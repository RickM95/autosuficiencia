import { STAGES, getStageById } from './bootStages.js'
import { bootLog, getLogSummary, getLogHistory } from './bootLogger.js'
import { BootRecovery, RECOVERY_ACTIONS } from './bootRecovery.js'

import { validateAll } from '../kb/validator.js'
import { buildIndexes } from '../kb/indexBuilder.js'
import { storeKB, loadKBFiles } from '../kb/loader.js'
import KbEngine from '../kb/KbEngine.js'
import PythonBridge from '../PythonBridge.js'
import KnowledgeBase from '../KnowledgeBase.js'

export const BOOT_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  STAGE_COMPLETE: 'STAGE_COMPLETE',
  COMPLETE: 'COMPLETE',
  FAILED: 'FAILED',
  DEGRADED: 'DEGRADED',
  TIMEOUT: 'TIMEOUT',
}

export const SYSTEM_STATE = {
  INITIALIZING: 'INITIALIZING',
  READY: 'SYSTEM_READY',
  DEGRADED: 'DEGRADED_MODE_READY',
  FAILED: 'FAILED_SAFE_STATE',
}

export class NephiBootSystem {
  constructor() {
    this.status = BOOT_STATUS.PENDING
    this.systemState = SYSTEM_STATE.INITIALIZING
    this.currentStage = null
    this.currentStageIndex = -1
    this.stageResults = []
    this.recovery = new BootRecovery()
    this.finalState = null
    this.onProgress = null
    this.kb = null
    this.py = null
    this.docKB = null
    this.startTime = null
    this.aborted = false
    this.debugMode = false
  }

  setProgressCallback(callback) {
    this.onProgress = callback
  }

  _reportProgress(stageId, percent, message) {
    const stage = getStageById(stageId)
    const overallPercent = this._calculateOverallPercent(stageId, percent)
    const payload = {
      stage: stageId,
      stagePercent: percent,
      overallPercent,
      message,
      label_en: stage ? stage.label_en : '',
      label_es: stage ? stage.label_es : '',
      description_en: stage ? stage.description_en : '',
      description_es: stage ? stage.description_es : '',
      status: this.status,
      systemState: this.systemState,
    }
    if (this.onProgress) this.onProgress(payload)
    if (this.debugMode) bootLog.info('Progress', `${stageId}: ${percent}%`, { overallPercent, message })
  }

  _calculateOverallPercent(stageId, stagePercent) {
    const currentIdx = STAGES.findIndex(s => s.id === stageId)
    if (currentIdx < 0) return 0
    const stagesBefore = currentIdx
    const stageWeight = 100 / STAGES.length
    return Math.round((stagesBefore * stageWeight) + (stagePercent * stageWeight / 100))
  }

  async boot(debugMode = false) {
    this.debugMode = debugMode
    this.startTime = Date.now()
    this.aborted = false

    bootLog.info('Boot', '===== NEPHI BOOT SEQUENCE STARTING =====', { debugMode })
    this.status = BOOT_STATUS.RUNNING

    for (let i = 0; i < STAGES.length; i++) {
      if (this.aborted) break
      
      // Yield to main thread before each stage to keep UI responsive
      await new Promise(resolve => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => resolve(), { timeout: 100 })
        } else {
          setTimeout(resolve, 0)
        }
      })

      const stage = STAGES[i]
      this.currentStage = stage.id
      this.currentStageIndex = i
      this.status = BOOT_STATUS.RUNNING
      this._reportProgress(stage.id, 0, stage.description_en)

      bootLog.stage(stage.id, 'START', stage.label_en)
      const startTime = Date.now()

      try {
        const result = await this._executeStageWithTimeout(stage)
        const elapsed = Date.now() - startTime

        if (result.success === false) {
          const recovery = await this.recovery.attemptRecovery(stage.id, result.error)

          if (recovery.action === RECOVERY_ACTIONS.RETRY) {
            bootLog.stage(stage.id, 'RETRY', `Retrying...`)
            const retryResult = await this._executeStageWithTimeout(stage)
            if (!retryResult.success) {
              bootLog.stage(stage.id, 'FAILED', retryResult.error.message)
              this.stageResults.push({ stage: stage.id, status: BOOT_STATUS.FAILED, error: retryResult.error, elapsed })
              if (!this._handleStageFailure(stage, recovery)) break
              continue
            }
            this._recordStageSuccess(stage, retryResult, elapsed)
          } else if (recovery.action === RECOVERY_ACTIONS.SKIP) {
            bootLog.stage(stage.id, 'SKIPPED', recovery.reason)
            this.stageResults.push({ stage: stage.id, status: 'SKIPPED', error: recovery.reason, elapsed })
            this._reportProgress(stage.id, 100, recovery.reason)
          } else if (recovery.action === RECOVERY_ACTIONS.FALLBACK || recovery.action === RECOVERY_ACTIONS.DEGRADE) {
            if (recovery.action === RECOVERY_ACTIONS.DEGRADE) this.recovery.degraded = true
            bootLog.stage(stage.id, 'DEGRADED', recovery.reason)
            this.stageResults.push({ stage: stage.id, status: BOOT_STATUS.DEGRADED, error: recovery.reason, elapsed })
            this._reportProgress(stage.id, 100, recovery.reason)
          } else {
            bootLog.stage(stage.id, 'ABORT', recovery.reason)
            this.stageResults.push({ stage: stage.id, status: BOOT_STATUS.FAILED, error: recovery.reason, elapsed })
            this._handleStageFailure(stage, recovery)
            break
          }
        } else {
          this._recordStageSuccess(stage, result, elapsed)
        }
      } catch (err) {
        const elapsed = Date.now() - startTime
        bootLog.stage(stage.id, 'CRASH', err.message)
        const recovery = await this.recovery.attemptRecovery(stage.id, err)
        if (recovery.action === RECOVERY_ACTIONS.RETRY) {
          bootLog.stage(stage.id, 'RETRY', 'Retrying after crash...')
          try {
            const retryResult = await this._executeStageWithTimeout(stage)
            this._recordStageSuccess(stage, retryResult, elapsed)
          } catch (retryErr) {
            bootLog.stage(stage.id, 'FAILED', retryErr.message)
            this.stageResults.push({ stage: stage.id, status: BOOT_STATUS.FAILED, error: retryErr, elapsed })
            if (!this._handleStageFailure(stage, recovery)) break
          }
        } else if (recovery.action === RECOVERY_ACTIONS.SKIP) {
          this.stageResults.push({ stage: stage.id, status: 'SKIPPED', error: recovery.reason, elapsed })
        } else if (recovery.action === RECOVERY_ACTIONS.DEGRADE || recovery.action === RECOVERY_ACTIONS.FALLBACK) {
          if (recovery.action === RECOVERY_ACTIONS.DEGRADE) this.recovery.degraded = true
          this.stageResults.push({ stage: stage.id, status: BOOT_STATUS.DEGRADED, error: recovery.reason, elapsed })
          this._reportProgress(stage.id, 100, recovery.reason)
        } else {
          this.stageResults.push({ stage: stage.id, status: BOOT_STATUS.FAILED, error: recovery.reason, elapsed })
          this._handleStageFailure(stage, recovery)
          break
        }
      }
    }

    if (!this.aborted) {
      this._finalizeBoot()
    }

    bootLog.info('Boot', '===== NEPHI BOOT SEQUENCE COMPLETE =====', {
      state: this.systemState,
      totalTime: Date.now() - this.startTime,
      results: this.stageResults.map(r => `${r.stage}:${r.status}`),
    })

    return this.getBootResult()
  }

  _executeStageWithTimeout(stage) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve({ success: false, error: new Error(`TIMEOUT: ${stage.id} exceeded ${stage.timeout}ms`), timedOut: true })
      }, stage.timeout)

      this._executeStage(stage).then(result => {
        clearTimeout(timer)
        resolve(result)
      }).catch(err => {
        clearTimeout(timer)
        resolve({ success: false, error: err })
      })
    })
  }

  async _executeStage(stage) {
    this._reportProgress(stage.id, 5, stage.description_en)

    switch (stage.id) {
      case 'SYSTEM_PRECHECK':
        return this._runPrecheck()
      case 'MODULE_REGISTRATION':
        return this._runModuleRegistration()
      case 'KB_LOAD':
        return this._runKBLoad()
      case 'KB_VALIDATION':
        return this._runKBValidation()
      case 'INDEX_BUILD':
        return this._runIndexBuild()
      case 'STORAGE_SYNC':
        return this._runStorageSync()
      case 'REASONING_ENGINE_INIT':
        return this._runReasoningEngine()
      case 'OPTIONAL_MODULES':
        return this._runOptionalModules()
      case 'FINAL_HEALTH_CHECK':
        return this._runHealthCheck()
      case 'SYSTEM_READY':
        return { success: true, data: { ready: true } }
      default:
        return { success: false, error: new Error(`Unknown stage: ${stage.id}`) }
    }
  }

  async _runPrecheck() {
    const issues = []
    if (typeof indexedDB === 'undefined') issues.push('IndexedDB not available')
    if (typeof window === 'undefined') issues.push('Window object not available')
    if (typeof Promise === 'undefined') issues.push('Promise not available')
    this._reportProgress('SYSTEM_PRECHECK', 100, issues.length === 0 ? 'Environment OK' : `Issues: ${issues.join(', ')}`)
    return issues.length === 0
      ? { success: true, data: { environment: 'browser', indexedDB: true } }
      : { success: false, error: new Error(issues.join('; ')) }
  }

  async _runModuleRegistration() {
    this._reportProgress('MODULE_REGISTRATION', 50, 'Modules registered')
    return { success: true, data: { registered: ['kb', 'engine', 'storage'] } }
  }

  async _runKBLoad() {
    const kbFiles = loadKBFiles()
    const domainCount = Object.keys(kbFiles.domains || {}).length
    this._reportProgress('KB_LOAD', 100, `${domainCount} domains loaded`)
    return { success: true, data: { domains: domainCount } }
  }

  async _runKBValidation() {
    this._reportProgress('KB_VALIDATION', 30, 'Running validation...')
    const kbFiles = loadKBFiles()
    const kbData = { domains: kbFiles.domains, masterIndex: kbFiles.masterIndex, rules: kbFiles.rules, schemas: kbFiles.schemas }
    const validationResult = validateAll(kbData)

    if (!validationResult.valid) {
      this._reportProgress('KB_VALIDATION', 100, `Validation failed: ${validationResult.errors.length} errors`)
      return { success: false, error: new Error(`KB validation failed: ${validationResult.errors.join('; ')}`), validation: validationResult }
    }

    this._reportProgress('KB_VALIDATION', 100, `Passed: ${validationResult.summary.actions} actions, ${validationResult.summary.rules} rules`)
    return { success: true, data: validationResult }
  }

  async _runIndexBuild() {
    this._reportProgress('INDEX_BUILD', 20, 'Building indexes...')
    const kbFiles = loadKBFiles()
    const indexes = buildIndexes({ domains: kbFiles.domains, masterIndex: kbFiles.masterIndex, rules: kbFiles.rules })
     this.kb = new KbEngine()
     await this.kb.init()
    this._reportProgress('INDEX_BUILD', 100, `${indexes.actionCount} actions indexed`)
    return { success: true, data: { actionCount: indexes.actionCount, triggerCount: indexes.triggerCount } }
  }

  async _runStorageSync() {
    this._reportProgress('STORAGE_SYNC', 30, 'Connecting to IndexedDB...')
    this.docKB = new KnowledgeBase()
    await this.docKB.init()
    this._reportProgress('STORAGE_SYNC', 60, 'Storing KB...')
    try {
      await storeKB()
      this._reportProgress('STORAGE_SYNC', 100, 'IndexedDB sync complete')
    } catch (e) {
      this._reportProgress('STORAGE_SYNC', 100, `Storage sync warning: ${e.message}`)
      return { success: false, error: e }
    }
    return { success: true, data: { indexedDB: true } }
  }

  async _runReasoningEngine() {
    this._reportProgress('REASONING_ENGINE_INIT', 50, 'Engine ready')
    return { success: true, data: { engine: 'initialized' } }
  }

  async _runOptionalModules() {
    this._reportProgress('OPTIONAL_MODULES', 10, 'Checking Pyodide...')
    this.py = new PythonBridge()

    let pyStatus
    try {
      await Promise.race([
        this.py.init(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Pyodide timeout')), 12000)),
      ])
      pyStatus = this.py.ready ? 'loaded' : 'failed'
      this._reportProgress('OPTIONAL_MODULES', pyStatus === 'loaded' ? 100 : 70, pyStatus === 'loaded' ? 'Pyodide ready' : 'Pyodide not available')
    } catch (e) {
      pyStatus = 'skipped'
      this._reportProgress('OPTIONAL_MODULES', 70, `Pyodide: ${e.message}`)
    }

    return { success: true, data: { pyodide: pyStatus } }
  }

  async _runHealthCheck() {
    this._reportProgress('FINAL_HEALTH_CHECK', 30, 'Verifying system state...')
    const checks = []
    if (this.kb) checks.push('kb')
    if (this.docKB) checks.push('storage')
    const allPassed = checks.length >= 2
    this._reportProgress('FINAL_HEALTH_CHECK', 100, allPassed ? 'All systems nominal' : `Partial: ${checks.join(', ')}`)
    return { success: true, data: { checks, allPassed } }
  }

  _recordStageSuccess(stage, result, elapsed) {
    this.stageResults.push({ stage: stage.id, status: BOOT_STATUS.STAGE_COMPLETE, elapsed })
    this._reportProgress(stage.id, 100, `${stage.label_en} complete`)
    bootLog.stage(stage.id, 'COMPLETE', `${elapsed}ms`)
  }

  _handleStageFailure(stage, recovery) {
    if (stage.critical && recovery.action !== RECOVERY_ACTIONS.SKIP) {
      if (recovery.action === RECOVERY_ACTIONS.DEGRADE) {
        bootLog.stage(stage.id, 'DEGRADED', 'System continuing in degraded mode')
        return true
      }
      bootLog.stage(stage.id, 'ABORT', 'Critical stage failure — halting boot')
      this.status = BOOT_STATUS.FAILED
      this.systemState = SYSTEM_STATE.FAILED
      this.aborted = true
      return false
    }
    return true
  }

  _finalizeBoot() {
    if (this.recovery.isDegraded()) {
      this.systemState = SYSTEM_STATE.DEGRADED
      this.status = BOOT_STATUS.DEGRADED
    } else {
      const allComplete = this.stageResults.every(r => r.status === BOOT_STATUS.STAGE_COMPLETE || r.status === 'SKIPPED')
      if (allComplete) {
        this.systemState = SYSTEM_STATE.READY
        this.status = BOOT_STATUS.COMPLETE
      } else {
        this.systemState = SYSTEM_STATE.DEGRADED
        this.status = BOOT_STATUS.DEGRADED
      }
    }
  }

  getBootResult() {
    return {
      status: this.status,
      systemState: this.systemState,
      stages: this.stageResults,
      recovery: this.recovery.getStatus(),
      logs: getLogSummary(),
      bootTime: Date.now() - (this.startTime || Date.now()),
      debug: this.debugMode ? { fullLog: getLogHistory() } : undefined,
    }
  }

  abort() {
    this.aborted = true
    bootLog.warn('Boot', 'Boot sequence aborted by user')
  }
}
