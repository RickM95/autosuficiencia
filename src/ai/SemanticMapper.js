/**
 * ✅ SEMANTIC MAPPER
 * Maps input to deeper meaning beyond literal words
 */

export class SemanticMapper {

  mapMeaning(input) {
    const text = input.toLowerCase().trim()

    return {
      coreMeaning: this.getCoreMeaning(text),
      emotionalLayer: this.getEmotionalLayer(text),
      intentLayer: this.getIntentLayer(text),
      relatedConcepts: this.getRelatedConcepts(text),
      intensity: this.calculateIntensity(text)
    }
  }

  getCoreMeaning(text) {
    const mappings = [
      { pattern: /i('m| am) stuck/i, meaning: "lack direction, unable to progress" },
      { pattern: /i('m| am) overwhelmed/i, meaning: "exceeded capacity, cannot manage current load" },
      { pattern: /i don('t| not) know/i, meaning: "uncertainty, confusion, decision paralysis" },
      { pattern: /i('m| am) tired/i, meaning: "fatigue, burnout, low energy" },
      { pattern: /a hug/i, meaning: "need comfort, connection, feeling alone" },
      { pattern: /i('m| am) scared/i, meaning: "anxiety, uncertainty about future" },
      { pattern: /nothing works/i, meaning: "hopelessness, repeated failure" },
    ]

    for (const map of mappings) {
      if (map.pattern.test(text)) return map.meaning
    }

    return text
  }

  getEmotionalLayer(text) {
    if (/overwhelm|collapse|drowning/i.test(text)) return 'overwhelmed'
    if (/tired|exhausted|burnt out/i.test(text)) return 'exhausted'
    if (/stuck|lost|don't know/i.test(text)) return 'confused'
    if (/scared|afraid|worried/i.test(text)) return 'anxious'
    if (/sad|hurt|alone/i.test(text)) return 'distressed'
    if (/angry|frustrated|stupid/i.test(text)) return 'frustrated'
    
    return 'neutral'
  }

  getIntentLayer(text) {
    if (/help|ayuda|what should/i.test(text)) return 'REQUEST_GUIDANCE'
    if (/just need to talk|listen/i.test(text)) return 'REQUEST_PRESENCE'
    if (/hug|comfort|abrazo/i.test(text)) return 'REQUEST_COMFORT'
    if (/idk|don't know|no sé/i.test(text)) return 'EXPRESSING_UNCERTAINTY'
    if (/tired|can't|no puedo/i.test(text)) return 'EXPRESSING_LIMIT'
    
    return 'SHARING'
  }

  getRelatedConcepts(text) {
    const concepts = []

    if (/money|dinero|debt|bills/i.test(text)) {
      concepts.push('finance', 'stress', 'security')
    }

    if (/tired|overwhelm|can't|exhausted/i.test(text)) {
      concepts.push('capacity', 'boundaries', 'rest')
    }

    if (/stuck|lost|don't know/i.test(text)) {
      concepts.push('clarity', 'direction', 'next_step')
    }

    if (/alone|lonely|nobody/i.test(text)) {
      concepts.push('connection', 'support', 'isolation')
    }

    return concepts
  }

  calculateIntensity(text) {
    let intensity = 0.5
    
    const intensifiers = /so|really|very|completely|totally|absolutely|muy|totalmente/i
    if (intensifiers.test(text)) intensity += 0.2

    const exclamations = (text.match(/!/g) || []).length
    intensity += exclamations * 0.1

    return Math.min(1, intensity)
  }
}

export default SemanticMapper