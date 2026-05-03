import Fuse from 'fuse.js'

/**
 * intentDetector.js
 * Uses fuzzy matching to identify user intent in EN and ES.
 */

const INTENTS = [
  { id: 'greeting', keywords: ['hola', 'buenos dias', 'hi', 'hello', 'hey', 'saludos'] },
  { id: 'financial', keywords: ['deuda', 'dinero', 'plata', 'ingreso', 'gastos', 'debt', 'money', 'income', 'expenses', 'salary', 'sueldo'] },
  { id: 'employment', keywords: ['trabajo', 'empleo', 'unemployed', 'job', 'work', 'hiring', 'contratación', 'despedido', 'fired'] },
  { id: 'goals', keywords: ['metas', 'objetivos', 'sueños', 'goals', 'plans', 'future', 'futuro', 'lograr', 'achieve'] },
  { id: 'agreement', keywords: ['si', 'claro', 'ok', 'yes', 'sure', 'agree', 'vale', 'entendido'] },
  { id: 'negative', keywords: ['no', 'no tengo', 'nada', 'none', 'nothing'] },
  { id: 'how_it_works', keywords: ['como funciona', 'que eres', 'quien eres', 'how it works', 'what are you', 'who are you'] },
  { id: 'farewell', keywords: ['adios', 'chao', 'bye', 'goodbye', 'nos vemos', 'see you'] }
]

const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  keys: ['keywords']
}

const fuse = new Fuse(INTENTS, fuseOptions)

export function detectIntent(text) {
  if (!text || text.trim().length === 0) {
    return { intent: 'none', confidence: 0 }
  }

  const results = fuse.search(text)

  if (results.length > 0) {
    const top = results[0]
    return {
      intent: top.item.id,
      confidence: 1 - top.score,
      isContinuation: text.trim().split(/\s+/).length < 3
    }
  }

  // Fallback for short inputs like "sí" which fuse might miss if threshold is tight
  const lower = text.toLowerCase().trim()
  if (lower === 'si' || lower === 'sí' || lower === 'yes' || lower === 'ok') {
    return { intent: 'agreement', confidence: 0.9, isContinuation: true }
  }
  
  if (lower === 'no' || lower === 'no tengo' || lower.includes('nada')) {
    return { intent: 'negative', confidence: 0.9, isContinuation: true }
  }

  return { intent: 'general', confidence: 0.3 }
}
