import { detectIntent } from './intentDetector.js'
import { decideFinalResponse } from './aiOrchestrator.js'
import { getPlannerResponse } from './autonomousPlanner.js'
import { generateDecisionResponse } from './decisionEngine.js'
import { fuseDomains, generateDeepResponse } from './domainFusionEngine.js'
import { EmotionalIntelligence } from './EmotionalIntelligence.js'
import { isRepeatingResponse, getVariantResponse } from './loopGuard.js'
import { analyzeNeeds, analyzeFinances, analyzeGoals, analyzeResources, analyzeCompleteness, identifyRisks, analyzeMessage } from './Analyzer.js'
import KbEngine from './kb/KbEngine.js'

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
      if (!this.kb.ready) {
        return this._basicResult()
      }
    }

    const previousStage = this.memory.stage
    const turnCount = this.memory.interactionCount || 0

    // 1. Analyze Core Domains
    const analyses = {
      needs: analyzeNeeds(formData),
      finances: analyzeFinances(formData),
      goals: analyzeGoals(formData),
      resources: analyzeResources(formData),
      completeness: analyzeCompleteness(formData),
      risks: identifyRisks(formData),
      message: analyzeMessage(userMessage || ''),
    }

    // 2. Gather Module Outputs (Structured Data ONLY)
    const intent = detectIntent(userMessage)
    const fusion = fuseDomains(userMessage, this.memory)
    const planner = getPlannerResponse(this.memory, { formData, analysis: analyses })
    const decision = generateDecisionResponse(this.memory, { formData })
    const emotion = EmotionalIntelligence.detect(userMessage, { ...formData, ...analyses })

    const modulesOutput = {
      intent,
      fusion: {
        ...fusion,
        ...generateDeepResponse(userMessage, fusion, this.memory)
      },
      planner,
      decision,
      emotion
    }

    // 3. Centralized Authoritative Decision
    const responseText = decideFinalResponse(userMessage, this.memory, modulesOutput)

    // 4. Update Memory
    this.memory.lastAction = modulesOutput.intent.intent
    this.memory.stage = modulesOutput.planner.plan.currentStage || 'CONVERSATION'
    this.memory.lastValidStage = this.memory.stage

    if (userMessage) {
      this.memory.recordInteraction('user', userMessage, analyses.message)
      this.memory.recordIntents([{
        intent: intent.intent,
        confidence: intent.confidence,
      }])
    }

    this.memory.extractFactsFromForm(formData)
    const previousContext = this.memory.getContextForNextResponse()

    return {
      stage: this.memory.stage,
      pipeline: { log: { steps: ['ORCHESTRATOR_V2'] }, responseText },
      kbDrivenResponse: responseText,
      decision: { action: intent.intent, reason: 'orchestrated decision' },
      intents: [intent],
      emotionalContext: emotion,
      subtexts: [],
      dualReasoning: {
        selectedLayer: 'AI_ORCHESTRATOR',
        responseMode: 'NORMAL',
        rationale: 'centralized pipeline',
      },
      turnCount,
      previousContext,
      needsAnalysis: analyses.needs,
      financialAnalysis: analyses.finances,
      goalsAnalysis: analyses.goals,
      resourcesAnalysis: analyses.resources,
      completeness: analyses.completeness,
      risks: analyses.risks,
      topic: analyses.message,
      conversationStageChanged: previousStage !== this.memory.stage,
      activeRules: [],
      validation: { valid: true, issues: [] },
      kbGapDetected: false,
      structureError: false,
      orchestratorResponse: responseText,
    }
  }

  _basicResult() {
    return {
      stage: 'CONVERSATION',
      pipeline: { log: { steps: ['KB_NOT_INITIALIZED'] }, kbGapDetected: true },
      kbDrivenResponse: null,
      decision: { action: 'explore', reason: 'kb not ready' },
      intents: [{ intent: 'general', confidence: 0.3 }],
      emotionalContext: { intensity: 0, interventionNeed: 'NORMAL' },
      subtexts: [],
      dualReasoning: { selectedLayer: 'BASIC', responseMode: 'NORMAL', rationale: 'system not ready' },
      turnCount: 0,
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
      structureError: false,
      orchestratorResponse: null,
    }
  }
}
