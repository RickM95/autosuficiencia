import _ from 'lodash'

/**
 * loopGuard.js
 * Prevents repetitive responses and ensures conversational variety.
 */

export function isRepeatingResponse(newResponse, history) {
  if (!history || history.length === 0) return false

  const recent = history.slice(-3).map(h => h.content || h)
  
  return recent.some(prev => {
    // Exact match or very similar
    if (_.isEqual(newResponse.trim(), prev.trim())) return true
    
    // Check for significant overlap
    const newWords = newResponse.toLowerCase().split(/\s+/)
    const prevWords = prev.toLowerCase().split(/\s+/)
    const intersection = _.intersection(newWords, prevWords)
    
    return intersection.length > (newWords.length * 0.7)
  })
}

export function getVariantResponse(action, lang, turnCount) {
  const variants = {
    explore: {
      es: [
        "Cuéntame un poco más sobre eso.",
        "Entiendo. ¿Cómo afecta eso tu día a día?",
        "Háblame más de esa situación."
      ],
      en: [
        "Tell me a bit more about that.",
        "I see. How does that affect your day-to-day?",
        "Tell me more about that situation."
      ]
    },
    // Add more variants as needed
  }

  const list = variants[action]?.[lang] || variants.explore[lang]
  return list[turnCount % list.length]
}
