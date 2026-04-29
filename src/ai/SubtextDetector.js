/**
 * SubtextDetector.js
 *
 * Detects what users REALLY mean beyond surface words.
 * Identifies help-seeking cues, confusion, barriers, and unspoken concerns.
 */

export class SubtextDetector {
  static detect(userMessage, context = {}) {
    const subtexts = []

    // Pattern: "I don't know X"
    if (this.matches(userMessage, ["don't know", 'no sé', 'unclear', 'confused', 'confundido'])) {
      subtexts.push({
        subtext: 'USER_CONFUSION',
        implies: 'Clarifying question needed; break down into steps',
        responseMode: 'QUESTION_FIRST',
        confidence: 0.85
      })
    }

    // Pattern: "I can't do X"
    if (this.matches(userMessage, ["can't", "cannot", 'no puedo', 'unable', 'incapaz', 'impossible'])) {
      subtexts.push({
        subtext: 'CAPABILITY_BARRIER',
        implies: 'Offer alternative path; validate the barrier',
        responseMode: 'OBSTACLE_FIRST',
        confidence: 0.9
      })
    }

    // Pattern: Question after statement ("But what about X?")
    if (this.matches(userMessage, ['but what', 'pero y si', 'pero qué', 'what if', 'y si'])) {
      subtexts.push({
        subtext: 'CONCERN_RAISED',
        implies: 'Address specific concern before continuing',
        responseMode: 'ADDRESS_CONCERN',
        confidence: 0.8
      })
    }

    // Pattern: Vagueness/helplessness ("I don't know what to do")
    if (this.matches(userMessage, ['what to do', 'qué hacer', 'how to start', 'por dónde empezar', 'donde empiezo'])) {
      subtexts.push({
        subtext: 'NEEDS_GUIDANCE',
        implies: 'Provide clear, sequential steps',
        responseMode: 'STEP_BY_STEP',
        confidence: 0.85
      })
    }

    // Pattern: Seeking permission/validation ("Is it okay if...?")
    if (this.matches(userMessage, ['is it ok', 'is it okay', 'puede', 'está bien', 'is that alright', 'está permitido'])) {
      subtexts.push({
        subtext: 'SEEKING_PERMISSION',
        implies: 'Validate choice and encourage autonomy',
        responseMode: 'VALIDATE_AND_EMPOWER',
        confidence: 0.8
      })
    }

    // Pattern: Comparison ("But they...") - seeking benchmark
    if (this.matches(userMessage, ['but they', 'pero ellos', 'compared to', 'comparado con', 'like them', 'como ellos'])) {
      subtexts.push({
        subtext: 'SEEKING_BENCHMARK',
        implies: 'Normalize their situation; show context',
        responseMode: 'CONTEXTUAL',
        confidence: 0.75
      })
    }

    // Pattern: Doubt after agreement ("Yes, but...")
    if (userMessage.match(/^yes.*but|^sí.*pero/i)) {
      subtexts.push({
        subtext: 'INTERNAL_CONFLICT',
        implies: 'Acknowledge the tension; help resolve',
        responseMode: 'BOTH_SIDES',
        confidence: 0.8
      })
    }

    // Pattern: Time pressure ("I need to...")
    if (this.matches(userMessage, ['i need to', 'tengo que', 'need to', 'necesito', 'asap', 'urgent', 'urgente'])) {
      subtexts.push({
        subtext: 'TIME_PRESSURE',
        implies: 'Prioritize; acknowledge urgency',
        responseMode: 'PRIORITIZE',
        confidence: 0.8
      })
    }

    // Pattern: Repeated concern (they're circling back)
    if (context.previousTopics && context.previousTopics.includes(context.currentTopic)) {
      subtexts.push({
        subtext: 'UNRESOLVED_CONCERN',
        implies: 'Earlier answer wasn\'t satisfying; dig deeper',
        responseMode: 'DEEPER_EXPLORATION',
        confidence: 0.75
      })
    }

    // Pattern: No question mark (statement, not question) - possible resigned statement
    if (userMessage && !userMessage.includes('?') && !userMessage.includes('¿')) {
      if (this.matches(userMessage, ['i guess', 'suppose', 'guess', 'supongo', 'asumo', 'creo que'])) {
        subtexts.push({
          subtext: 'RESIGNED_ACCEPTANCE',
          implies: 'Challenge resignation; open possibilities',
          responseMode: 'EMPOWERING',
          confidence: 0.7
        })
      }
    }

    // Pattern: Apology/Self-blame
    if (this.matches(userMessage, ['my fault', 'my bad', 'i should', 'culpa mía', 'debería', 'es mi error'])) {
      subtexts.push({
        subtext: 'SELF_BLAME',
        implies: 'Reduce shame; reframe as learning',
        responseMode: 'REFRAME',
        confidence: 0.8
      })
    }

    return subtexts
  }

  static matches(message, keywords) {
    if (!message || typeof message !== 'string') return false
    const lower = message.toLowerCase()
    return keywords.some(kw => lower.includes(kw.toLowerCase()))
  }

  static prioritizeSubtexts(subtexts) {
    const priority = {
      'USER_CONFUSION': 10,
      'CAPABILITY_BARRIER': 9,
      'CONCERN_RAISED': 8,
      'UNRESOLVED_CONCERN': 8,
      'NEEDS_GUIDANCE': 7,
      'INTERNAL_CONFLICT': 7,
      'TIME_PRESSURE': 8,
      'SEEKING_PERMISSION': 6,
      'SEEKING_BENCHMARK': 5,
      'RESIGNED_ACCEPTANCE': 7,
      'SELF_BLAME': 6
    }

    return subtexts
      .map(s => ({ ...s, priorityScore: priority[s.subtext] || 0 }))
      .sort((a, b) => (b.priorityScore * b.confidence) - (a.priorityScore * a.confidence))
  }
}
