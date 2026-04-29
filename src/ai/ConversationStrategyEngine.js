/**
 * ✅ CONVERSATION STRATEGY ENGINE
 * Decides how to respond, not just what to respond
 * 
 * Selects appropriate conversational strategy:
 * acknowledge, reflect, clarify, guide, suggest, pause
 */

export const RESPONSE_STRATEGIES = {
  ACKNOWLEDGE: 'ACKNOWLEDGE',
  REFLECT: 'REFLECT',
  CLARIFY: 'CLARIFY',
  GUIDE: 'GUIDE',
  SUGGEST: 'SUGGEST',
  PAUSE: 'PAUSE',
  VALIDATE: 'VALIDATE',
  PRESENCE: 'PRESENCE'
}

export class ConversationStrategyEngine {

  decideStrategy(context) {
    const { cognitiveInterpretation, memory, semanticMeaning } = context

    // ✅ RULE 1: Emotional support mode = almost always validate first
    if (memory.currentMode?.type === 'EMOTIONAL_SUPPORT') {
      if (semanticMeaning?.intensity > 0.7) {
        return RESPONSE_STRATEGIES.VALIDATE
      }

      if (cognitiveInterpretation?.ambiguityLevel > 0.6) {
        return RESPONSE_STRATEGIES.PRESENCE
      }

      return RESPONSE_STRATEGIES.ACKNOWLEDGE
    }

    // ✅ RULE 2: High ambiguity = clarify gently
    if (cognitiveInterpretation?.ambiguityLevel > 0.7) {
      return RESPONSE_STRATEGIES.CLARIFY
    }

    // ✅ RULE 3: Explicit request for help = guide
    if (semanticMeaning?.intentLayer === 'REQUEST_GUIDANCE') {
      return RESPONSE_STRATEGIES.GUIDE
    }

    // ✅ RULE 4: Just sharing = acknowledge
    if (semanticMeaning?.intentLayer === 'SHARING') {
      return RESPONSE_STRATEGIES.ACKNOWLEDGE
    }

    // ✅ RULE 5: Uncertainty = reflect
    if (semanticMeaning?.intentLayer === 'EXPRESSING_UNCERTAINTY') {
      return RESPONSE_STRATEGIES.REFLECT
    }

    // Default balanced strategy
    return RESPONSE_STRATEGIES.ACKNOWLEDGE
  }

  getStrategyInstructions(strategy, context) {
    const instructions = {
      [RESPONSE_STRATEGIES.VALIDATE]: {
        priority: 'emotional_validation',
        avoidAdvice: true,
        avoidLists: true,
        keepShort: true,
        inviteShare: true
      },

      [RESPONSE_STRATEGIES.PRESENCE]: {
        priority: 'presence',
        minimalResponse: true,
        noPressure: true
      },

      [RESPONSE_STRATEGIES.ACKNOWLEDGE]: {
        priority: 'acknowledgment',
        followUpNatural: true
      },

      [RESPONSE_STRATEGIES.REFLECT]: {
        priority: 'reflection',
        mirrorFeeling: true,
        noSolutions: true
      },

      [RESPONSE_STRATEGIES.CLARIFY]: {
        priority: 'gentle_clarification',
        openQuestion: true
      },

      [RESPONSE_STRATEGIES.GUIDE]: {
        priority: 'guidance',
        structured: true,
        actionable: true
      }
    }

    return instructions[strategy] || instructions[RESPONSE_STRATEGIES.ACKNOWLEDGE]
  }

  shouldGiveAdvice(context) {
    // Only give advice when explicitly requested
    // OR when user is calm and ready
    if (context.memory?.currentMode?.type === 'EMOTIONAL_SUPPORT') {
      return context.semanticMeaning?.intensity < 0.5
    }

    return context.cognitiveInterpretation?.inferredNeeds?.includes('guidance')
  }
}

export default ConversationStrategyEngine