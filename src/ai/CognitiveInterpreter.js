/**
 * ✅ COGNITIVE INTERPRETER ENGINE
 * Nephi AS - Deep understanding layer
 * 
 * Interprets user input beyond literal text
 * Detects subtext, emotional signals, inferred needs, and cross-domain links
 * This is Nephi's human-level understanding system
 */

export class CognitiveInterpreter {

  interpret(input, memory) {
    const cleaned = input.trim().toLowerCase()
    
    const result = {
      input: input,
      literalIntent: this.getLiteralIntent(cleaned),
      emotionalSignal: this.detectEmotionalSignal(cleaned, memory),
      inferredNeeds: this.inferNeeds(cleaned, memory),
      ambiguityLevel: this.calculateAmbiguity(cleaned),
      requiresClarification: false,
      contextLinks: this.findContextLinks(cleaned, memory),
      interpretationConfidence: 0.5,
      suggestedMode: null
    }

    // Adjust confidence
    result.interpretationConfidence = this.calculateConfidence(result)
    result.requiresClarification = result.ambiguityLevel > 0.7 && result.interpretationConfidence < 0.4

    // Determine suggested mode
    if (result.emotionalSignal.intensity > 0.6) {
      result.suggestedMode = 'EMOTIONAL_SUPPORT'
    } else if (result.inferredNeeds.includes('planning')) {
      result.suggestedMode = 'PLANNING'
    } else if (result.inferredNeeds.includes('information')) {
      result.suggestedMode = 'INFORMATION'
    }

    return result
  }

  detectEmotionalSignal(text, memory) {
    const signals = {
      overwhelmed: /overwhelm|can't|no puedo|perdido|lost|stuck|collapse|crisis/i,
      distress: /hurt|sad|depressed|alone|solo|triste|muerto|sufro/i,
      anxiety: /worried|scared|ansioso|miedo|nervious|panic/i,
      frustration: /stupid|annoyed|frustrated|enojado|molesto|failing/i,
      hopeful: /better|ok|improving|mejor|bueno|logré/i
    }

    let detected = 'neutral'
    let intensity = 0

    for (const [state, pattern] of Object.entries(signals)) {
      if (pattern.test(text)) {
        detected = state
        intensity = Math.min(1, intensity + 0.3)
      }
    }

    // Short inputs in emotional context = high signal
    if (text.length < 12 && memory?.currentMode?.type === 'EMOTIONAL_SUPPORT') {
      intensity = Math.max(intensity, 0.7)
    }

    return {
      state: detected,
      intensity,
      escalation: memory?.emotionalState ? intensity > memory.emotionalState.intensity : false
    }
  }

  inferNeeds(text, memory) {
    const needs = []

    // Explicit needs
    if (/hug|abrazo|comfort|apoyo/i.test(text)) needs.push('comfort')
    if (/help|ayuda|necesito/i.test(text)) needs.push('support')
    if (/plan|how|cómo|que hago|what do/i.test(text)) needs.push('guidance')
    if (/money|dinero|deuda|bills|gastos/i.test(text)) needs.push('financial_help')
    if (/listen|escucha|just need to talk/i.test(text)) needs.push('presence')
    if (/don't know|no sé|idk|confused/i.test(text)) needs.push('clarity')
    if (/tired|cansado|burnt out/i.test(text)) needs.push('rest')

    // Implied needs
    if (this.detectEmotionalSignal(text, memory).intensity > 0.5) {
      needs.push('validation')
      needs.push('safety')
    }

    return [...new Set(needs)]
  }

  findContextLinks(text, memory) {
    const links = []

    if (/money|dinero|debt|ingreso|gastos/i.test(text)) {
      links.push({ domain: 'finances', weight: 0.8 })
      links.push({ domain: 'stress', weight: 0.6 })
    }

    if (/stress|anxiety|overwhelm|cansado/i.test(text)) {
      links.push({ domain: 'wellbeing', weight: 0.9 })
      links.push({ domain: 'capacity', weight: 0.5 })
    }

    if (/future|goals|quiero|want|plan/i.test(text)) {
      links.push({ domain: 'planning', weight: 0.8 })
      links.push({ domain: 'goals', weight: 0.7 })
    }

    if (/alone|lonely|solo|nadie/i.test(text)) {
      links.push({ domain: 'wellbeing', weight: 0.9 })
      links.push({ domain: 'support_network', weight: 0.7 })
    }

    return links
  }

  calculateAmbiguity(text) {
    if (text.length < 5) return 0.9
    if (text.length < 12) return 0.7
    if (text.split(' ').length < 3) return 0.6
    if (text.split(' ').length < 5) return 0.4
    return 0.2
  }

  getLiteralIntent(text) {
    if (/help|ayuda/i.test(text)) return 'REQUEST_HELP'
    if (/question|pregunta/i.test(text)) return 'ASK_QUESTION'
    if (/plan/i.test(text)) return 'REQUEST_PLAN'
    if (/yes|si|sí|yeah/i.test(text)) return 'AGREEMENT'
    if (/no|nah|nope/i.test(text)) return 'DISAGREEMENT'
    if (/idk|no sé|don't know/i.test(text)) return 'UNCERTAIN'
    return 'STATEMENT'
  }

  calculateConfidence(result) {
    let confidence = 0.5

    if (result.emotionalSignal.intensity > 0.7) confidence += 0.2
    if (result.inferredNeeds.length > 0) confidence += 0.1
    if (result.contextLinks.length > 1) confidence += 0.1
    if (result.ambiguityLevel > 0.7) confidence -= 0.3

    return Math.max(0.1, Math.min(1, confidence))
  }
}

export default CognitiveInterpreter