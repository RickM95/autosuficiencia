import { LanguageDetector } from './LanguageDetector.js'
import { detectIntent } from './intentDetector.js'
import { fuseDomains } from './domainFusionEngine.js'
import { progressTracker } from './progressTracker.js'
import { decideFinalResponse } from './aiOrchestrator.js'
import { isRepeatingResponse, getVariantResponse } from './loopGuard.js'
import { analyzeFinances, analyzeMessage } from './Analyzer.js'
import { EmotionalIntelligence } from './EmotionalIntelligence.js'
import { knowledgeFetcher } from './knowledgeFetcher.js'
import { emotionOverride } from './emotionOverride.js'
import KbEngine from './kb/KbEngine.js'
import { hasNegation } from './negationUtils.js'

export default class ReasoningEngine {
  constructor(memory, debugMode = false) {
    this.memory = memory
    this.kb = new KbEngine()
    this._initPromise = null
    this.debugMode = debugMode
    this._emotion = new EmotionalIntelligence()
  }

  async init() {
    if (this._initPromise) return this._initPromise
    this._initPromise = this.kb.init(this.debugMode)
    return this._initPromise
  }

  _emitDebug(phase, data) {
    if (!this.debugMode) return
    try {
      if (typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        self.postMessage({ type: 'onDebug', payload: { phase, ...data } })
      }
    } catch { }
  }

  async processMessage(formData, budgetData, userMessage) {
    if (!this.kb.ready) {
      await this.init()
    }

    const startTime = performance.now()
    const lang = LanguageDetector.detect(userMessage, this.memory)
    this.memory.language = lang

    let intent = detectIntent(userMessage)

    const hasNegationLocal = hasNegation(userMessage)

    this._emitDebug('intent_detection', { intent, hasNegation: hasNegationLocal, duration: performance.now() - startTime })

    if (this.memory.activeMode && ['agreement', 'negative'].includes(intent.intent) && this.memory.lastQuestionContext) {
      const originalIntent = intent.intent
      const domain = this.memory.lastQuestionContext.domain || this.memory.activeMode.toLowerCase().replace('_review', '')
      intent.originalIntent = originalIntent
      intent.intent = domain
      intent.confidence = 0.9
      intent.isReinterpreted = true

      this._emitDebug('mode_reinterpret', {
        from: intent.originalIntent,
        to: domain,
        mode: this.memory.activeMode,
        stage: this.memory.modeStage
      })
    }

    const fusion = fuseDomains(userMessage, this.memory)

    const analyses = { message: analyzeMessage(userMessage || '') }

    const isFinancialContext = this.memory.activeMode === 'FINANCIAL_REVIEW' ||
                               this.memory.modeStage === 'FINANCIAL_REVIEW' ||
                               this.memory.lastAction === 'financial' ||
                               ['financial', 'planning', 'general', 'goals'].includes(intent.intent)
    if (isFinancialContext) {
      analyses.finances = analyzeFinances(formData)
    }
    const progressState = await progressTracker.updateState(fusion, intent.intent)

    let externalKnowledge = null
    const needsKnowledge = knowledgeFetcher.needsExternalKnowledge(userMessage, intent.intent, false)
    if (needsKnowledge || intent.intent === 'knowledge_query' || intent.intent === 'advice') {
      const fetchPromise = knowledgeFetcher.fetchKnowledge(userMessage, lang)
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ success: false, fallback: true }), 1500))
      const knowledgeResult = await Promise.race([fetchPromise, timeoutPromise])
      if (knowledgeResult && knowledgeResult.success) {
        externalKnowledge = knowledgeResult.text
      }
    }

    this._emitDebug('knowledge_fetch', { needed: needsKnowledge, found: !!externalKnowledge })

    const modulesOutput = {
      fusion,
      intent,
      lang,
      analyses,
      progressState,
      externalKnowledge,
      activeMode: this.memory.activeMode,
      modeStage: this.memory.modeStage,
      hasNegation: hasNegationLocal
    }

    const finalResponse = decideFinalResponse(userMessage, this.memory, modulesOutput, progressState)

    this.memory.lastTurn = {
      intent: intent.intent,
      mode: this.memory.activeMode,
      question: finalResponse
    }

    let responseText = finalResponse
    if (isRepeatingResponse(responseText, this.memory.lastResponses)) {
      responseText = getVariantResponse(intent.intent, lang, this.memory.interactionCount || 0)
    }

    this.memory.recordInteraction('user', userMessage, analyses.message)
    this.memory.recordIntents([{
      intent: intent.intent,
      confidence: intent.confidence,
    }])
    this.memory.lastAction = intent.intent
    this.memory.interactionCount = (this.memory.interactionCount || 0) + 1

    this._emitDebug('reasoning_complete', {
      intent: intent.intent,
      mode: this.memory.activeMode,
      domains: fusion.activeDomains,
      duration: performance.now() - startTime
    })

    return {
      stage: 'CONVERSATION',
      pipeline: {
        log: { steps: ['REBUILD_V3'] },
        responseText,
        domains: fusion.domains
      },
      kbDrivenResponse: responseText,
      decision: { action: intent.intent, reason: 'unified autonomous flow' },
      intents: [intent],
      emotionalContext: modulesOutput.emotion,
      emotionalDistress: emotionOverride.detectEmotionalPriority(userMessage, lang),
      progressState,
      orchestratorResponse: responseText,
      domains: fusion.domains,
      externalKnowledge: modulesOutput.externalKnowledge
    }
  }
}
