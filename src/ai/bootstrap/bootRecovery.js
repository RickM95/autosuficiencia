import { bootLog } from './bootLogger.js'
import { getStageById } from './bootStages.js'

export const RECOVERY_ACTIONS = {
  RETRY: 'RETRY',
  SKIP: 'SKIP',
  FALLBACK: 'FALLBACK',
  DEGRADE: 'DEGRADE',
  ABORT: 'ABORT',
}

export class BootRecovery {
  constructor() {
    this.retryCounts = {}
    this.fallbackModules = new Set()
    this.degraded = false
  }

  async attemptRecovery(stageId, error) {
    const stage = getStageById(stageId)
    if (!stage) return { action: RECOVERY_ACTIONS.ABORT, reason: `Unknown stage: ${stageId}` }

    bootLog.warn('Recovery', `Attempting recovery for stage: ${stageId}`, { error: error.message })

    if (stage.retryable) {
      const retryKey = stageId
      this.retryCounts[retryKey] = (this.retryCounts[retryKey] || 0) + 1

      if (this.retryCounts[retryKey] <= 1) {
        bootLog.info('Recovery', `Retrying stage: ${stageId} (attempt ${this.retryCounts[retryKey]})`)
        return { action: RECOVERY_ACTIONS.RETRY, reason: `Retry attempt ${this.retryCounts[retryKey]}` }
      }

      bootLog.warn('Recovery', `Retry exhausted for: ${stageId}`, { attempts: this.retryCounts[retryKey] })
    }

    if (!stage.critical) {
      bootLog.info('Recovery', `Skipping non-critical stage: ${stageId}`)
      this.fallbackModules.add(stageId)
      return { action: RECOVERY_ACTIONS.SKIP, reason: 'Non-critical stage failed — skipping' }
    }

    bootLog.warn('Recovery', `Attempting fallback for critical stage: ${stageId}`)

    const fallbackStrategies = {
      KB_LOAD: () => ({ action: RECOVERY_ACTIONS.FALLBACK, reason: 'Using minimal KB fallback' }),
      KB_VALIDATION: () => ({ action: RECOVERY_ACTIONS.DEGRADE, reason: 'KB validation failed — running in degraded mode' }),
      INDEX_BUILD: () => ({ action: RECOVERY_ACTIONS.FALLBACK, reason: 'Index build failed — using linear scan fallback' }),
      REASONING_ENGINE_INIT: () => ({ action: RECOVERY_ACTIONS.DEGRADE, reason: 'Reasoning engine init failed — running in degraded mode' }),
      FINAL_HEALTH_CHECK: () => ({ action: RECOVERY_ACTIONS.ABORT, reason: 'Health check failed — system cannot operate safely' }),
      SYSTEM_PRECHECK: () => ({ action: RECOVERY_ACTIONS.ABORT, reason: 'System precheck failed — incompatible environment' }),
    }

    const strategy = fallbackStrategies[stageId]
    if (strategy) {
      const result = strategy()
      if (result.action === RECOVERY_ACTIONS.DEGRADE) this.degraded = true
      return result
    }

    return { action: RECOVERY_ACTIONS.ABORT, reason: `No recovery strategy for stage: ${stageId}` }
  }

  isDegraded() { return this.degraded }
  getFallbackModules() { return [...this.fallbackModules] }
  getRetryCounts() { return { ...this.retryCounts } }

  getStatus() {
    return {
      degraded: this.degraded,
      fallbackModules: [...this.fallbackModules],
      retries: { ...this.retryCounts },
    }
  }
}
