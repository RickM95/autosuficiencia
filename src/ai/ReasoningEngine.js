import { analyzeNeeds, analyzeFinances, analyzeGoals, analyzeResources, analyzeCompleteness, identifyRisks, analyzeMessage } from './Analyzer.js'
import KbEngine from './kb/KbEngine.js'
import { generateHealthReport, getDiagnosticSummary } from './kb/debugger.js'

export default class ReasoningEngine {
  constructor(memory, debugMode = false) {
    this.memory = memory
    this.kb = new KbEngine()
    this._initPromise = null
    this.debugMode = debugMode
  }

  async init() {
    if (this._initPromise) return this._initPromise
    this._initPromise = this.kb.init(this.debugMode)
    return this._initPromise
  }

  getDebugInfo() {
    if (!this.debugMode) return null
    return {
      kbReady: this.kb.ready,
      healthReport: generateHealthReport(),
      diagnosticSummary: getDiagnosticSummary(),
      validation: this.kb.lastValidationResult,
    }
  }

  async processMessage(formData, budgetData, userMessage) {
    if (!this.kb.ready) {
      await this.init()
      if (!this.kb.ready) {
        return this._kbNotReadyResult()
      }
    }
    const previousStage = this.memory.stage
    const pipeline = this.kb.executePipeline(userMessage, formData, this.memory, null)

    if (pipeline.kbGapDetected && !pipeline.responseText) {
      return this._fallbackWithGap(formData, budgetData, userMessage, previousStage, pipeline)
    }

    if (pipeline.structureError) {
      return this._structureErrorResult(previousStage)
    }

    const newStage = pipeline.overrides.stage || this._determineStageFromAnalysis(formData, userMessage)
    this.memory.stage = newStage

    if (userMessage) {
      const topic = analyzeMessage(userMessage)
      this.memory.recordInteraction('user', userMessage, topic)
    }
    this.memory.extractFactsFromForm(formData)

    return {
      stage: this.memory.stage,
      pipeline,
      kbDrivenResponse: pipeline.responseText,
      needsAnalysis: analyzeNeeds(formData),
      financialAnalysis: analyzeFinances(formData),
      goalsAnalysis: analyzeGoals(formData),
      resourcesAnalysis: analyzeResources(formData),
      completeness: analyzeCompleteness(formData),
      risks: identifyRisks(formData),
      topic: pipeline.context.intent || analyzeMessage(userMessage || ''),
      conversationStageChanged: previousStage !== this.memory.stage,
      activeRules: pipeline.activeRules,
      validation: pipeline.validation,
      kbGapDetected: pipeline.kbGapDetected,
    }
  }

  _determineStageFromAnalysis(formData, userMessage) {
    const needs = analyzeNeeds(formData)
    if (needs.critical.length > 0) return 'NEEDS_CRITICAL'

    if (userMessage) {
      if (this._isImportRequest(userMessage)) return 'KNOWLEDGE_IMPORT'
      if (this._isPlanRequest(userMessage)) return 'PLAN_BUILD'
      if (this._isPlanReview(userMessage)) return 'PLAN_REVIEW'
      const topic = analyzeMessage(userMessage)
      if (topic !== 'general') return 'TOPIC_ADVICE'
    }

    const finances = analyzeFinances(formData)
    const completeness = analyzeCompleteness(formData)
    if (completeness.percent >= 60 && !userMessage) return 'PLAN_BUILD'
    if (finances.income > 0 || finances.expenses > 0) return 'FINANCIAL_REVIEW'
    if (completeness.percent > 20) return 'GOALS_REVIEW'
    if (this.memory.interactionCount > 5) return 'FOLLOW_UP'
    return 'WELCOME'
  }

  _fallbackWithGap(formData, budgetData, userMessage, previousStage, pipeline) {
    const needsAnalysis = analyzeNeeds(formData)
    const financialAnalysis = analyzeFinances(formData)
    const goalsAnalysis = analyzeGoals(formData)
    const completeness = analyzeCompleteness(formData)
    const risks = identifyRisks(formData)
    const topic = analyzeMessage(userMessage || '')

    return {
      stage: this.memory.stage,
      pipeline,
      kbDrivenResponse: null,
      needsAnalysis,
      financialAnalysis,
      goalsAnalysis,
      resourcesAnalysis: analyzeResources(formData),
      completeness,
      risks,
      topic,
      conversationStageChanged: false,
      activeRules: [],
      validation: pipeline.validation,
      kbGapDetected: true,
      structureError: false,
    }
  }

  _structureErrorResult(previousStage) {
    return {
      stage: previousStage || 'WELCOME',
      pipeline: { log: { steps: ['KB_STRUCTURE_ERROR'] } },
      kbDrivenResponse: null,
      needsAnalysis: { critical: [], warnings: [], ok: [], score: 0 },
      financialAnalysis: { score: 0, income: 0, expenses: 0, balance: 0 },
      goalsAnalysis: { score: 0, short: [], medium: [], long: [], completeness: 0 },
      resourcesAnalysis: { score: 0 },
      completeness: { percent: 0, missing: [] },
      risks: { criticalRisks: [], warnings: [], summary: '' },
      topic: 'general',
      conversationStageChanged: false,
      activeRules: [],
      validation: { valid: false, issues: ['KB_STRUCTURE_ERROR'] },
      kbGapDetected: false,
      structureError: true,
    }
  }

  _isImportRequest(msg) {
    return /import|upload|cargar|subir|pdf|document|documento|file|archivo|leer|read|download|descargar/i.test((msg || '').toLowerCase())
  }

  _isPlanRequest(msg) {
    const lower = (msg || '').toLowerCase()
    return /generate plan|generar plan|create plan|crear plan|make a plan|hacer un plan|your plan|mi plan|plan now|plan ahora|generate|generar/i.test(lower) &&
      !/delete|remove|borrar|eliminar/i.test(lower)
  }

  _isPlanReview(msg) {
    return /review|revisar|score|puntaje|rate|calificar|evaluate|evaluar|critique|criticar|improve|mejorar|check|verificar/i.test((msg || '').toLowerCase())
  }

  _kbNotReadyResult() {
    return {
      stage: 'WELCOME',
      pipeline: { log: { steps: ['KB_NOT_INITIALIZED'] }, kbGapDetected: true },
      kbDrivenResponse: null,
      needsAnalysis: { critical: [], warnings: [], ok: [], score: 0 },
      financialAnalysis: { score: 0, income: 0, expenses: 0, balance: 0 },
      goalsAnalysis: { score: 0, short: [], medium: [], long: [], completeness: 0 },
      resourcesAnalysis: { score: 0 },
      completeness: { percent: 0, missing: [] },
      risks: { criticalRisks: [], warnings: [], summary: '' },
      topic: 'general',
      conversationStageChanged: false,
      activeRules: [],
      validation: { valid: false, issues: ['KB_NOT_INITIALIZED'] },
      kbGapDetected: true,
      structureError: true,
    }
  }
}
