/**
 * ✅ DYNAMIC RESPONSE SELECTOR ENGINE
 * 
 * Selects the best possible response variant for the current context
 * Evaluates against emotional state, history, repetition and timing
 * 
 * This is Nephi's final decision layer before speaking
 */

export class DynamicResponseSelector {

  selectBestResponse(variants, context) {
    const scoredVariants = variants.map(variant => {
      return {
        text: variant,
        score: this.calculateVariantScore(variant, context)
      }
    })

    // Sort highest score first
    scoredVariants.sort((a, b) => b.score - a.score)

    // Record selection
    this.recordSelection(scoredVariants[0].text, context)

    return scoredVariants[0].text
  }

  calculateVariantScore(variant, context) {
    let score = 0.5

    // ✅ Penalty for recent repetition
    if (this.wasUsedRecently(variant, context.memory?.usedPhrases)) {
      score -= 0.6
    }

    // ✅ Bonus for matching emotional tone
    if (this.matchesEmotionalTone(variant, context)) {
      score += 0.2
    }

    // ✅ Penalty for being too long when overwhelmed
    if (context.emotionalState?.intensity > 0.7 && variant.length > 120) {
      score -= 0.3
    }

    // ✅ Bonus for appropriate length
    if (variant.length > 30 && variant.length < 100) {
      score += 0.1
    }

    // ✅ Penalty for giving advice when not appropriate
    if (context.shouldAvoidAdvice && this.containsAdvice(variant)) {
      score -= 0.4
    }

    // ✅ Bonus for natural conversational flow
    if (this.hasNaturalFlow(variant)) {
      score += 0.1
    }

    return Math.max(0, Math.min(1, score))
  }

  wasUsedRecently(variant, usedPhrases = []) {
    return usedPhrases.slice(-6).some(used => {
      const similarity = this.calculateSimilarity(variant, used)
      return similarity > 0.55
    })
  }

  matchesEmotionalTone(variant, context) {
    const emotionalState = context.emotionalState?.state || 'neutral'
    
    if (emotionalState === 'overwhelmed') {
      return variant.length < 100 && !this.containsLists(variant)
    }

    if (emotionalState === 'distressed') {
      return !this.containsSolutions(variant)
    }

    return true
  }

  containsAdvice(text) {
    return /should|need to|have to|must|you could|try to/i.test(text)
  }

  containsLists(text) {
    return /(\d+\.|\-|\•)/.test(text)
  }

  containsSolutions(text) {
    return /you can|try|start|step|first/i.test(text)
  }

  hasNaturalFlow(text) {
    // Avoid perfectly structured template sentences
    if (text.endsWith('.') === false) return true
    if (text.includes('?')) return true
    
    // Slight imperfection is natural
    return text.split(' ').length > 3 && text.split(' ').length < 18
  }

  calculateSimilarity(a, b) {
    const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2))
    const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2))
    
    if (wordsA.size === 0 || wordsB.size === 0) return 0

    const intersection = new Set([...wordsA].filter(x => wordsB.has(x)))
    return intersection.size / Math.max(wordsA.size, wordsB.size)
  }

  recordSelection(text, context) {
    if (!context.memory) return
    
    if (!context.memory.usedPhrases) {
      context.memory.usedPhrases = []
    }

    context.memory.usedPhrases.push(text)
    
    // Keep only last 12 phrases
    if (context.memory.usedPhrases.length > 12) {
      context.memory.usedPhrases.shift()
    }
  }
}

export default DynamicResponseSelector