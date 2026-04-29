/**
 * ✅ LANGUAGE DETECTOR
 * Automatic bilingual language detection and persistence
 */

export class LanguageDetector {

  detect(text) {
    const cleaned = text.toLowerCase().trim()

    const spanishSignals = /(que|como|cuando|donde|por que|yo|tu|él|ella|nosotros|ellos|es|son|fue|ser|tener|hacer|ir|ver|decir|dar|saber|querer|poder|deber|bueno|mal|gracias|por favor|ayuda|dinero|casa|trabajo)/i
    const englishSignals = /(what|how|when|where|why|i|you|he|she|we|they|is|are|was|be|have|do|go|see|say|give|know|want|can|should|good|bad|thank|please|help|money|home|work)/i

    let esMatches = 0
    let enMatches = 0

    const words = cleaned.split(/\s+/)

    for (const word of words) {
      if (spanishSignals.test(word)) esMatches++
      if (englishSignals.test(word)) enMatches++
    }

    // Direct triggers
    if (/[áéíóúñ¿¡]/.test(text)) return 'es'

    if (esMatches > enMatches) return 'es'
    if (enMatches > esMatches) return 'en'

    // Ambiguous, default to memory language
    return null
  }

  detectAndUpdate(memory, text) {
    const detected = this.detect(text)
    
    if (detected) {
      memory.language = detected
    }

    return memory.language || 'es'
  }
}

export default LanguageDetector