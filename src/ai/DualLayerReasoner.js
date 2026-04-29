/**
 * DualLayerReasoner.js
 *
 * Combines human-like reasoning with system logic.
 * Human layer prioritized for emotional/vague inputs.
 * System layer used for clear technical requests.
 */

export class DualLayerReasoner {
  static async reason(userMessage, formData, context = {}) {
    // Layer 1: Human reasoning (flexible, contextual, empathetic)
    const humanLayer = await this.humanReason(userMessage, formData, context)

    // Layer 2: System reasoning (deterministic, rule-based)
    const systemLayer = this.systemReason(userMessage, formData, context)

    // Determine which layer takes priority
    const decision = this.prioritize(humanLayer, systemLayer, context)

    return {
      humanLayer,
      systemLayer,
      decision,
      rationale: this.explainDecision(decision, humanLayer, systemLayer)
    }
  }

  // LAYER 1: Human reasoning — treat as dialogue, not lookup
  static async humanReason(userMessage, formData, context = {}) {
    // Step 1: Assess what the user REALLY needs (not just surface intent)
    const needsAssessment = this.assessRealNeeds(userMessage, formData, context)

    // Step 2: Consider emotional state
    const emotionalContext = context.emotionalIntelligence || { intensity: 0 }

    // Step 3: Determine response mode (QUESTION vs ANSWER vs VALIDATE_THEN_QUESTION)
    const responseMode = this.determineResponseMode(needsAssessment, emotionalContext)

    // Step 4: Consider follow-up questions
    const shouldAskClarification = this.shouldAskClarifyingQuestion(needsAssessment, context)

    return {
      layer: 'HUMAN',
      needsAssessment,
      emotionalContext,
      responseMode,
      shouldAskClarification,
      confidence: 0.75  // Human reasoning has inherent uncertainty
    }
  }

  static assessRealNeeds(userMessage, formData, context = {}) {
    const msg = (userMessage || '').toLowerCase()

    // Pattern: Vague overwhelm ("I don't know what to do")
    if (msg.includes("don't know") || msg.includes('no sé')) {
      return {
        realNeed: 'NEEDS_CLARITY',
        reason: 'User is confused or overwhelmed',
        shouldAsk: true,
        whatToAsk: context.lang === 'es'
          ? '¿Cuál es tu confusión específica?'
          : 'What specifically is confusing?'
      }
    }

    // Pattern: Obstacle ("I can't because...")
    if (msg.includes("can't") || msg.includes('no puedo')) {
      const barrier = this.extractBarrier(msg)
      return {
        realNeed: 'HAS_BARRIER',
        barrier,
        reason: 'User faces a constraint',
        shouldAsk: true,
        whatToAsk: context.lang === 'es'
          ? `¿Hay otra forma de abordar ${barrier}?`
          : `Is there another way to address ${barrier}?`
      }
    }

    // Pattern: Emotional crisis
    if (context.emotionalIntelligence?.intensity > 7) {
      return {
        realNeed: 'EMOTIONAL_SUPPORT_FIRST',
        reason: 'User is in distress',
        shouldValidate: true,
        shouldAsk: false
      }
    }

    // Pattern: Seeking permission/validation
    if (msg.includes('is it ok') || msg.includes('está bien')) {
      return {
        realNeed: 'SEEKING_VALIDATION',
        reason: 'User doubts their choice',
        shouldValidate: true,
        shouldAsk: false
      }
    }

    // Default: User has clear intent
    return {
      realNeed: 'CLEAR_REQUEST',
      reason: 'User has clear goal',
      shouldAsk: false
    }
  }

  static extractBarrier(message) {
    // Simple barrier extraction
    const match = message.match(/can't.*because(.+)|no puedo.*porque(.+)/)
    return match ? match[1] || match[2] : 'the issue'
  }

  static determineResponseMode(needsAssessment, emotionalContext) {
    if (emotionalContext.intensity > 7) {
      return 'EMOTIONAL_FIRST'  // Validate before anything
    }

    if (needsAssessment.realNeed === 'NEEDS_CLARITY') {
      return 'QUESTION_FIRST'  // Ask before answering
    }

    if (needsAssessment.realNeed === 'HAS_BARRIER') {
      return 'OBSTACLE_FIRST'  // Address barrier first
    }

    if (needsAssessment.realNeed === 'SEEKING_VALIDATION') {
      return 'VALIDATE_THEN_ACTION'
    }

    return 'NORMAL'
  }

  static shouldAskClarifyingQuestion(needsAssessment, context = {}) {
    return needsAssessment.shouldAsk === true
  }

  // LAYER 2: System reasoning — deterministic, rule-based
  static systemReason(userMessage, formData, context = {}) {
    // Traditional logic: intent → stage → KB query

    const intent = this.detectIntent(userMessage)
    const stage = context.stage || 'WELCOME'
    const kbQuery = context.kbResult || {}

    return {
      layer: 'SYSTEM',
      intent,
      stage,
      kbQuery,
      confidence: 0.95  // System has high certainty
    }
  }

  static detectIntent(userMessage) {
    const msg = (userMessage || '').toLowerCase()

    const intents = {
      'PLAN_REQUEST': /plan|generate|create|make|hacer|crear/i,
      'DEBT_QUERY': /debt|deuda|loan|préstamo/i,
      'BUDGET_QUERY': /budget|presupuesto|expense|gasto/i,
      'EMERGENCY_FUND': /emergency|fondo|ahorro|save/i,
      'GOAL_QUERY': /goal|meta|objetivo/i,
      'STRESS_SUPPORT': /stressed|stressed|overwhelm|abrumado/i,
      'GENERAL': /general|general/i
    }

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(msg)) return intent
    }

    return 'GENERAL'
  }

  // PRIORITIZATION: Human vs System
  static prioritize(humanLayer, systemLayer, context = {}) {
    // Rule 1: If emotional crisis → ALWAYS human layer
    if (context.emotionalIntelligence?.intensity > 8) {
      return {
        layer: 'HUMAN',
        reason: 'User in emotional crisis—empathy required'
      }
    }

    // Rule 2: If user is vague/unclear → ALWAYS human layer
    const isVague = (context.userMessage || '').length < 20 || (context.userMessage || '').includes('?')
    if (isVague && !context.userMessage?.includes('plan')) {
      return {
        layer: 'HUMAN',
        reason: 'User input is vague—clarification needed'
      }
    }

    // Rule 3: If KB has direct answer AND user isn't vulnerable → System layer
    if (systemLayer.kbQuery?.found && context.emotionalIntelligence?.intensity < 4) {
      return {
        layer: 'SYSTEM',
        reason: 'KB has answer and user is stable'
      }
    }

    // Rule 4: Default to human layer (safer default)
    return {
      layer: 'HUMAN',
      reason: 'Default to human layer for safety'
    }
  }

  static explainDecision(decision, humanLayer, systemLayer) {
    return {
      selectedLayer: decision.layer,
      reason: decision.reason,
      humanConfidence: humanLayer.confidence,
      systemConfidence: systemLayer.confidence
    }
  }
}
