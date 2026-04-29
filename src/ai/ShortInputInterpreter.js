/**
 * ✅ SHORT INPUT INTERPRETER
 * 
 * Handles ambiguous, short, minimal user inputs correctly
 * Never resets context on these inputs
 * 
 * Inputs handled:
 * "a hug", "idk", "yeah", "ok", "…", silence, single words
 */

export const SHORT_INPUT_PATTERNS = {
  AGREEMENT: /^(yes|yeah|yep|si|sí|ok|okay|sure|yeah|correct|right)$/i,
  DISAGREEMENT: /^(no|nope|nah|negativo|no)$/i,
  UNCERTAIN: /^(idk|dunno|maybe|not sure|no se|no sé|quizás|tal vez)$/i,
  EMOTIONAL_CONTINUATION: /^(a hug|abrazo|calm|help|please|pls|por favor)$/i,
  SILENCE: /^(\.+|_+| *|)$/i
}

export class ShortInputInterpreter {
  constructor(memory) {
    this.memory = memory
  }

  interpret(input) {
    const trimmed = input.trim().toLowerCase()

    if (!trimmed || SHORT_INPUT_PATTERNS.SILENCE.test(trimmed)) {
      return this.handleSilence()
    }

    if (SHORT_INPUT_PATTERNS.EMOTIONAL_CONTINUATION.test(trimmed)) {
      return this.handleEmotionalContinuation(trimmed)
    }

    if (SHORT_INPUT_PATTERNS.UNCERTAIN.test(trimmed)) {
      return this.handleUncertainty()
    }

    if (SHORT_INPUT_PATTERNS.AGREEMENT.test(trimmed)) {
      return this.handleAgreement()
    }

    if (SHORT_INPUT_PATTERNS.DISAGREEMENT.test(trimmed)) {
      return this.handleDisagreement()
    }

    return {
      type: 'UNKNOWN_SHORT',
      responseType: 'CLARIFY_GENTLY',
      preserveContext: true
    }
  }

  handleSilence() {
    return {
      type: 'SILENCE',
      responseType: 'GENTLE_PROMPT',
      preserveContext: true,
      guidance: 'No pressure. Take all the time you need.'
    }
  }

  handleEmotionalContinuation(input) {
    return {
      type: 'EMOTIONAL_CONTINUATION',
      responseType: 'VALIDATE_AND_INVITE',
      preserveContext: true,
      inputType: input,
      guidance: this.getEmotionalResponse(input)
    }
  }

  handleUncertainty() {
    return {
      type: 'UNCERTAINTY',
      responseType: 'LOW_PRESSURE',
      preserveContext: true,
      guidance: "That's okay. We can go slow. Want to talk about whatever is on your mind?"
    }
  }

  handleAgreement() {
    return {
      type: 'AGREEMENT',
      responseType: 'CONTINUE_FLOW',
      preserveContext: true
    }
  }

  handleDisagreement() {
    return {
      type: 'DISAGREEMENT',
      responseType: 'ACKNOWLEDGE_AND_ADJUST',
      preserveContext: true
    }
  }

  getEmotionalResponse(input) {
    const responses = {
      'a hug': "I wish I could give you a real one. You're not alone right now. Want to tell me what's been weighing on you?",
      'abrazo': "Ojalá pudiera darte uno de verdad. No estás solo en esto. ¿Quieres contarme qué te está pasando?",
      'help': "I'm here. What do you need most right now?",
      'please': "Of course. Tell me what you need.",
      'calm': "It's okay to feel this way. Let's take this one breath at a time."
    }

    return responses[input.toLowerCase()] || "I'm here with you."
  }
}

export default ShortInputInterpreter