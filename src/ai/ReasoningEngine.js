import { LanguageDetector } from './languageDetector.js'
import { detectIntent } from './intentDetector.js'
import { fuseDomains } from './domainFusionEngine.js'
import { progressTracker } from './progressTracker.js'
import { decideFinalResponse } from './aiOrchestrator.js'
import { isRepeatingResponse, getVariantResponse } from './loopGuard.js'
import { analyzeNeeds, analyzeFinances, analyzeGoals, analyzeResources, analyzeCompleteness, identifyRisks, analyzeMessage } from './Analyzer.js'
import { EmotionalIntelligence } from './EmotionalIntelligence.js'
import { getPlannerResponse } from './autonomousPlanner.js'
import { generateDecisionResponse } from './decisionEngine.js'
import { knowledgeFetcher } from './knowledgeFetcher.js'
import { emotionOverride } from './emotionOverride.js'
import KbEngine from './kb/KbEngine.js'

/**
 * ReasoningEngine.js (Complete Rewrite)
 * Unified, context-aware reasoning flow for Nephi.
 */

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

  async processMessage(formData, budgetData, userMessage) {
    if (!this.kb.ready) {
      await this.init()
    }

    // 1. Language Detection
    const lang = LanguageDetector.detect(userMessage, this.memory)
    this.memory.language = lang

    // 2. Intent Detection
    const intent = detectIntent(userMessage)

    // 3. Domain Fusion
    const fusion = fuseDomains(userMessage, this.memory)

    // 4. Progress Update
    // Need basic analysis for progress update
    const analyses = {
      finances: analyzeFinances(formData),
      message: analyzeMessage(userMessage || ''),
    }
    const progressState = await progressTracker.updateState(fusion, intent.intent)

    // 5. External Knowledge Fetching (Optional & Non-blocking)
    let externalKnowledge = null
    if (knowledgeFetcher.needsExternalKnowledge(userMessage, intent.intent, false)) {
      // Use a timeout to avoid blocking too long
      const fetchPromise = knowledgeFetcher.fetchKnowledge(userMessage, lang)
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 1500))
      externalKnowledge = await Promise.race([fetchPromise, timeoutPromise])
    }

    // 6. Gather all module outputs for Orchestrator
    const modulesOutput = {
      lang,
      intent,
      fusion,
      planner: getPlannerResponse(this.memory, { formData, analysis: analyses }),
      decision: generateDecisionResponse(this.memory, { formData }),
      emotion: EmotionalIntelligence.detect(userMessage, { ...formData, ...analyses }),
      externalKnowledge
    }

    // 6. Orchestrator Decision (Single Response Authority)
    let responseText = decideFinalResponse(userMessage, this.memory, modulesOutput, progressState)

    // 7. Loop Guard (Repetition Detection)
    if (isRepeatingResponse(responseText, this.memory.lastResponses)) {
      responseText = getVariantResponse(intent.intent, lang, this.memory.interactionCount || 0)
    }

    // 8. Update Memory & Context
    this.memory.recordInteraction('user', userMessage, analyses.message)
    this.memory.recordIntents([{
      intent: intent.intent,
      confidence: intent.confidence,
    }])
    this.memory.lastAction = intent.intent
    this.memory.interactionCount = (this.memory.interactionCount || 0) + 1

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
