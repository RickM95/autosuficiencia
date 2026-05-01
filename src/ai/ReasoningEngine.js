import { detectIntent } from './intentDetector.js'
import { decideNextAction, generateOrchestratorResponse, getResponseStrategy } from './autonomousOrchestrator.js'
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

  getDebugInfo() {
    if (!this.debugMode) return null
    return {
      kbReady: this.kb.ready,
    }
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

    const analyses = {
      needs: analyzeNeeds(formData),
      finances: analyzeFinances(formData),
      goals: analyzeGoals(formData),
      resources: analyzeResources(formData),
      completeness: analyzeCompleteness(formData),
      risks: identifyRisks(formData),
      message: analyzeMessage(userMessage || ''),
    }

    const orchestratorDecision = decideNextAction(userMessage, this.memory, {
      formData,
      analysis: analyses,
    })

    let responseText
    const detectedIntent = orchestratorDecision.intent

    contextLoopCheck: {
      if (this.memory.lastResponses.length > 0) {
        const generatedResponse = generateOrchestratorResponse(orchestratorDecision, this.memory, {
          hasFormData: !!(formData && Object.keys(formData).length > 2),
          userMessage,
        })

        const repetition = isRepeatingResponse(generatedResponse, this.memory.lastResponses)
        if (repetition) {
          const variant = getVariantResponse(
            orchestratorDecision.action,
            this.memory.language || 'es',
            turnCount
          )
          if (variant) {
            responseText = variant
            break contextLoopCheck
          }
        }

        responseText = generatedResponse
      } else {
        responseText = generateOrchestratorResponse(orchestratorDecision, this.memory, {
          hasFormData: !!(formData && Object.keys(formData).length > 2),
          userMessage,
        })
      }
    }

    this.memory.lastAction = orchestratorDecision.action
    this.memory.stage = 'CONVERSATION'
    this.memory.lastValidStage = 'CONVERSATION'

    if (userMessage) {
      this.memory.recordInteraction('user', userMessage, analyses.message)
      if (orchestratorDecision.intent) {
        this.memory.recordIntents([{
          intent: orchestratorDecision.intent.intent,
          confidence: orchestratorDecision.intent.confidence,
        }])
      }
    }

    this.memory.extractFactsFromForm(formData)

    const previousContext = this.memory.getContextForNextResponse()

    return {
      stage: orchestratorDecision.conversationalStage || 'CONVERSATION',
      pipeline: { log: { steps: ['ORCHESTRATOR'] }, responseText },
      kbDrivenResponse: responseText,
      decision: orchestratorDecision,
      intents: [orchestratorDecision.intent],
      emotionalContext: { intensity: 0, interventionNeed: 'NORMAL' },
      subtexts: [],
      dualReasoning: {
        selectedLayer: 'ORCHESTRATOR',
        responseMode: getResponseStrategy(orchestratorDecision)?.mode || 'NORMAL',
        rationale: orchestratorDecision.reason,
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
