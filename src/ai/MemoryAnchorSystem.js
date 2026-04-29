/**
 * ✅ MEMORY ANCHOR SYSTEM
 * 
 * Creates long term continuity anchors
 * Remembers important moments and patterns
 * Generates the feeling of "being remembered"
 * 
 * Allows references like:
 * "I remember you were feeling this way before..."
 * Without being intrusive or overly literal.
 */

export class MemoryAnchorSystem {
  constructor(memory) {
    this.memory = memory

    if (!this.memory.anchors) {
      this.memory.anchors = {
        importantMoments: [],
        recurringPatterns: [],
        userStatements: [],
        breakthroughs: [],
        referencePoints: []
      }
    }
  }

  recordAnchor(type, content, context) {
    const anchor = {
      type,
      content,
      context: {
        emotionalState: context.emotionalState?.state,
        stage: context.stage,
        language: context.language
      },
      timestamp: Date.now(),
      weight: 1
    }

    this.memory.anchors[type].push(anchor)

    // Keep only the most significant anchors
    if (this.memory.anchors[type].length > 12) {
      this.memory.anchors[type] = this.memory.anchors[type]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 8)
    }
  }

  findRelevantAnchor(context) {
    const currentEmotion = context.emotionalState?.state

    // Find anchors with same emotional state
    const matching = this.memory.anchors.importantMoments
      .filter(a => a.context.emotionalState === currentEmotion)
      .sort((a, b) => b.weight - a.weight)

    if (matching.length > 0 && Math.random() < 0.15) {
      // 15% chance to reference previous similar moment
      return matching[0]
    }

    return null
  }

  injectReference(response, anchor, language = 'en') {
    if (!anchor) return response

    const references = {
      en: [
        "I remember this feeling before.",
        "You've felt this way before, right?",
        "This reminds me of when we talked about this earlier."
      ],
      es: [
        "Recuerdo que has sentido esto antes.",
        "Ya te habías sentido así antes, ¿verdad?",
        "Esto me recuerda a cuando hablamos de esto antes."
      ]
    }

    if (Math.random() < 0.3) {
      const reference = references[language][Math.floor(Math.random() * references[language].length)]
      return `${reference} ${response}`
    }

    return response
  }

  shouldReferenceContext(context) {
    // Only reference when trust is sufficiently high
    return this.memory.relationship?.trustLevel > 40
  }
}

export default MemoryAnchorSystem