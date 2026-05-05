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
        "Entiendo.",
        "Perfecto, avancemos.",
        "Gracias por compartir."
      ],
      en: [
        "I understand.",
        "Perfect, let's move forward.",
        "Thanks for sharing."
      ]
    },
    // Add more variants as needed
  }

  const list = variants[action]?.[lang] || variants.explore[lang]
  const idx = turnCount % (list.length + 1)
  
  if (idx >= list.length) {
    return lang === 'es'
      ? "Siento que estamos dando vueltas. ¿Qué te parece si intentamos enfocarnos en otro aspecto de tu plan?"
      : "I feel like we're going in circles. How about we try focusing on another aspect of your plan?"
  }
  
  return list[idx]
}
