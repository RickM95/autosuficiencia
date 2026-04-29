import { analyzeNeeds, analyzeFinances, analyzeGoals, analyzeResources, analyzeCompleteness, identifyRisks, analyzeMessage } from './Analyzer.js'
import KbEngine from './kb/KbEngine.js'
import { generateHealthReport, getDiagnosticSummary } from './kb/debugger.js'
import { IntentTree } from './IntentTree.js'
import { DualLayerReasoner } from './DualLayerReasoner.js'
import { EmotionalIntelligence } from './EmotionalIntelligence.js'
import { SubtextDetector } from './SubtextDetector.js'

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

    // NEW: Run enhanced reasoning layers
    const analyses = {
      needs: analyzeNeeds(formData),
      finances: analyzeFinances(formData),
      goals: analyzeGoals(formData),
      resources: analyzeResources(formData),
      completeness: analyzeCompleteness(formData),
      risks: identifyRisks(formData),
      message: analyzeMessage(userMessage || '')
    }

    // NEW: Detect emotional state and subtexts
    const emotionalContext = EmotionalIntelligence.detect(userMessage, {
      financialAnalysis: analyses.finances,
      needsAnalysis: analyses.needs
    })

    const subtexts = SubtextDetector.detect(userMessage, {
      previousTopics: this.memory.recordedTopics || [],
      currentTopic: analyses.message,
      lang: 'en'
    })

    // NEW: Determine intents using weighted matching
    const intents = IntentTree.evaluate(userMessage, formData, analyses, this.memory)
    const topIntents = IntentTree.getTopIntents(intents, 2)

    // NEW: Use dual-layer reasoning
    const dualReasoning = await DualLayerReasoner.reason(userMessage, formData, {
      intents: topIntents,
      emotionalIntelligence: emotionalContext,
      subtexts,
      stage: previousStage,
      userMessage
    })

    // EXISTING: KB pipeline (supplementary now, not primary)
    const pipeline = this.kb.executePipeline(userMessage, formData, this.memory, null)

    // NEW: Select which reasoning layer to use
    const selectedReasoning = dualReasoning.decision.layer === 'HUMAN' 
      ? dualReasoning.humanLayer 
      : dualReasoning.systemLayer

    // Update stage (now based on intents + emotional context)
    const newStage = this._determineStageFromIntents(topIntents, analyses, emotionalContext, userMessage)
    this.memory.stage = newStage
    this.memory.lastValidStage = newStage

    // Track interaction
    if (userMessage) {
      this.memory.recordInteraction('user', userMessage, analyses.message)
      this.memory.recordIntents?.(topIntents)
      this.memory.recordSubtexts?.(subtexts)
      this.memory.recordResponseMode?.(selectedReasoning.responseMode)
    }
    this.memory.extractFactsFromForm(formData)

    // Surface memory context for next-turn continuity
    const previousContext = this.memory.getContextForNextResponse()

    return {
      stage: this.memory.stage,
      pipeline,
      kbDrivenResponse: pipeline.responseText,

      // NEW: Enhanced reasoning outputs
      intents: topIntents,
      emotionalContext,
      subtexts: SubtextDetector.prioritizeSubtexts(subtexts),
      dualReasoning: {
        selectedLayer: dualReasoning.decision.layer,
        responseMode: selectedReasoning.responseMode,
        rationale: dualReasoning.rationale
      },

      // Context continuity across turns
      turnCount: this.memory.interactionCount,
      previousContext,

      // EXISTING: Form analysis
      needsAnalysis: analyses.needs,
      financialAnalysis: analyses.finances,
      goalsAnalysis: analyses.goals,
      resourcesAnalysis: analyses.resources,
      completeness: analyses.completeness,
      risks: analyses.risks,
      topic: analyses.message,
      conversationStageChanged: previousStage !== this.memory.stage,
      activeRules: pipeline.activeRules,
      validation: pipeline.validation,
      kbGapDetected: pipeline.kbGapDetected,
    }
  }

  _determineStageFromIntents(topIntents, analyses, emotionalContext, userMessage) {
    // ✅ STICKY MODE PROTECTION - MOST IMPORTANT RULE
    if (this.memory.isShortInput(userMessage) && this.memory.shouldPreserveMode()) {
      // Short input while in active mode: STAY IN CURRENT MODE
      this.memory.currentMode.lastUpdated = Date.now()
      return this.memory.stage
    }

    // Priority 1: Emotional crisis
    if (emotionalContext.interventionNeed === 'IMMEDIATE') {
      this.memory.setActiveMode('EMOTIONAL_SUPPORT', 0.95)
      this.memory.lastEmotionalState = emotionalContext
      return 'STRESS_INTERVENTION'
    }

    // Priority 2: Critical needs
    if (analyses.needs.critical && analyses.needs.critical.length > 0) {
      this.memory.setActiveMode('EMOTIONAL_SUPPORT', 0.85)
      return 'NEEDS_CRITICAL'
    }

    // Priority 3: Top intent
    if (topIntents && topIntents.length > 0) {
      const primaryIntent = topIntents[0]
      this.memory.lastUserIntent = primaryIntent.intent
      
      const intentToStageMap = {
        'immediate_crisis': 'NEEDS_CRITICAL',
        'emotional_overwhelm': 'STRESS_INTERVENTION',
        'financial_crisis': 'FINANCIAL_REVIEW',
        'stressed_and_struggling': 'STRESS_INTERVENTION',
        'financial_planning': 'PLAN_BUILD',
        'goal_setting': 'GOALS_REVIEW',
        'learning_request': 'KNOWLEDGE_IMPORT',
        'general_conversation': 'TOPIC_ADVICE'
      }
      
      const stage = intentToStageMap[primaryIntent.intent]
      if (stage) {
        // Clear mode only if strong explicit intent to change topic
        if (primaryIntent.confidence > 0.7) {
          this.memory.clearActiveMode()
        }
        return stage
      }
    }

    // ✅ NO RESET RULE: Never go back to WELCOME if we have active context
    if (this.memory.interactionCount > 2 && this.memory.lastValidStage !== 'WELCOME') {
      return this.memory.lastValidStage
    }

    // Fallback to analysis-based determination
    return this._determineStageFromAnalysis(null, null, analyses)
  }

  _determineStageFromAnalysis(formData, userMessage, analyses = null) {
    // Use passed analyses if available, otherwise compute
    const needs = analyses?.needs || analyzeNeeds(formData || {})
    const finances = analyses?.finances || analyzeFinances(formData || {})
    const completeness = analyses?.completeness || analyzeCompleteness(formData || {})

    if (needs.critical && needs.critical.length > 0) return 'NEEDS_CRITICAL'

    if (userMessage) {
      if (this._isImportRequest(userMessage)) return 'KNOWLEDGE_IMPORT'
      if (this._isPlanRequest(userMessage)) return 'PLAN_BUILD'
      if (this._isPlanReview(userMessage)) return 'PLAN_REVIEW'
      const topic = analyzeMessage(userMessage)
      if (topic !== 'general') return 'TOPIC_ADVICE'
    }

    if (completeness?.percent >= 60 && !userMessage) return 'PLAN_BUILD'
    if (finances?.income > 0 || finances?.expenses > 0) return 'FINANCIAL_REVIEW'
    if (completeness?.percent > 20) return 'GOALS_REVIEW'
    if (this.memory?.interactionCount > 5) return 'FOLLOW_UP'
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
