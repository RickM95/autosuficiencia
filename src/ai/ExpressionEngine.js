/**
 * ✅ EXPRESSION ENGINE
 * Generates natural language variations
 * Avoids repetition, adapts tone to context
 */

import lexicon from './lexicon.json' assert { type: 'json' }

export class ExpressionEngine {

  generateVariations(baseConcept, context = {}) {
    const { tone = 'empathetic', language = 'en' } = context

    const templates = this.getTemplates(baseConcept, tone, language)
    
    let variations = templates.map(template => {
      return this.injectLexicalVariation(template, tone, language)
    })

    variations = this.filterUsedPhrases(variations, context.usedPhrases || [])

    return variations.slice(0, 5)
  }

  selectVariation(baseConcept, context) {
    const variations = this.generateVariations(baseConcept, context)
    
    // Avoid recent phrases
    const unused = variations.filter(v => !this.wasUsedRecently(v, context.usedPhrases))
    
    if (unused.length > 0) {
      const selected = unused[Math.floor(Math.random() * unused.length)]
      this.recordUsage(selected, context)
      return selected
    }

    return variations[0]
  }

  getTemplates(concept, tone, language) {
    const templateMap = {
      'acknowledge_difficulty': {
        en: {
          empathetic: [
            "That’s a lot to deal with.",
            "That doesn’t sound easy at all.",
            "I can see why that feels heavy.",
            "That’s not a simple situation.",
            "That must be really hard."
          ],
          neutral: [
            "That sounds challenging.",
            "That is a difficult situation.",
            "I understand this is complex."
          ]
        },
        es: {
          empathetic: [
            "Eso es mucho para cargar.",
            "No debe ser nada fácil.",
            "Entiendo por qué se siente así.",
            "No es una situación sencilla.",
            "Debe ser muy difícil."
          ]
        }
      },

      'offer_presence': {
        en: {
          empathetic: [
            "I'm here with you.",
            "You don't have to go through this alone.",
            "I'm listening.",
            "Take all the time you need.",
            "I'm not going anywhere."
          ]
        },
        es: {
          empathetic: [
            "Estoy aquí contigo.",
            "No tienes que pasar por esto solo.",
            "Te estoy escuchando.",
            "Toma todo el tiempo que necesites.",
            "No me voy a ir."
          ]
        }
      },

      'invite_share': {
        en: {
          empathetic: [
            "Want to tell me more about it?",
            "What's been weighing on you?",
            "Would you like to talk about what's going on?",
            "I'm here whenever you're ready."
          ]
        },
        es: {
          empathetic: [
            "¿Quieres contarme más?",
            "¿Qué es lo que más te está pesando?",
            "¿Te gustaría hablar de lo que está pasando?",
            "Estoy aquí cuando estés listo."
          ]
        }
      },

      'comfort_response': {
        en: {
          empathetic: [
            "I wish I could give you a real hug. You're not alone right now.",
            "I'm so sorry you're feeling this way. I'm here with you.",
            "That ache makes sense. You don't have to hold this alone."
          ]
        }
      }
    }

    return templateMap[concept]?.[language]?.[tone] || [baseConcept]
  }

  injectLexicalVariation(text, tone, language) {
    let result = text

    for (const [word, variants] of Object.entries(lexicon)) {
      if (text.includes(word)) {
        const options = variants[language]?.[tone] || variants[language]?.neutral || [word]
        const replacement = options[Math.floor(Math.random() * options.length)]
        result = result.replace(word, replacement)
      }
    }

    return result
  }

  wasUsedRecently(phrase, usedPhrases) {
    return usedPhrases.slice(-5).some(used => 
      this.similarity(phrase, used) > 0.6
    )
  }

  filterUsedPhrases(variations, usedPhrases) {
    return variations.filter(v => !this.wasUsedRecently(v, usedPhrases))
  }

  recordUsage(phrase, context) {
    if (!context.usedPhrases) context.usedPhrases = []
    context.usedPhrases.push(phrase)
    if (context.usedPhrases.length > 10) {
      context.usedPhrases.shift()
    }
  }

  similarity(a, b) {
    const wordsA = new Set(a.toLowerCase().split(/\s+/))
    const wordsB = new Set(b.toLowerCase().split(/\s+/))
    const intersection = new Set([...wordsA].filter(x => wordsB.has(x)))
    return intersection.size / Math.max(wordsA.size, wordsB.size)
  }
}

export default ExpressionEngine