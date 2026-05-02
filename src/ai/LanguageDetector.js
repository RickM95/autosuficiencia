import { franc } from 'franc-min'

/**
 * languageDetector.js
 * Detects and locks the conversation language.
 */

export class LanguageDetector {
  static detect(text, memory) {
    // If language is already locked in memory and it's not a very short input, keep it
    if (memory.lockedLanguage && text.length < 20) {
      return memory.lockedLanguage
    }

    const langCode = franc(text)
    let detected = 'es' // Default to Spanish for this project context

    if (langCode === 'eng') {
      detected = 'en'
    } else if (langCode === 'spa') {
      detected = 'es'
    } else {
      // Heuristics for common words if franc fails
      const enPatterns = /\b(the|and|you|debt|income|work|job|help)\b/i
      const esPatterns = /\b(el|la|y|tu|deuda|ingreso|trabajo|empleo|ayuda)\b/i
      
      if (enPatterns.test(text)) detected = 'en'
      else if (esPatterns.test(text)) detected = 'es'
    }

    // Lock language if we have high confidence or it's a longer sentence
    if (text.length > 30 || !memory.lockedLanguage) {
      memory.lockedLanguage = detected
    }

    return detected
  }
}