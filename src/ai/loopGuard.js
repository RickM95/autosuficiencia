const SIMILARITY_THRESHOLD = 0.6

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text) {
  return normalize(text).split(/\s+/).filter(Boolean)
}

function jaccardSimilarity(a, b) {
  const tokensA = new Set(tokenize(a))
  const tokensB = new Set(tokenize(b))

  if (tokensA.size === 0 && tokensB.size === 0) return 1
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let intersection = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++
  }

  const union = new Set([...tokensA, ...tokensB]).size
  return intersection / union
}

function getNgrams(text, n = 3) {
  const tokens = tokenize(text)
  const ngrams = new Set()
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.add(tokens.slice(i, i + n).join(' '))
  }
  return ngrams
}

function ngramSimilarity(a, b) {
  const ngramsA = getNgrams(a, 2)
  const ngramsB = getNgrams(b, 2)

  if (ngramsA.size === 0 && ngramsB.size === 0) return 1
  if (ngramsA.size === 0 || ngramsB.size === 0) return 0

  let intersection = 0
  for (const ng of ngramsA) {
    if (ngramsB.has(ng)) intersection++
  }

  const union = new Set([...ngramsA, ...ngramsB]).size
  return intersection / union
}

export function isRepeatingResponse(current, responseHistory, threshold = SIMILARITY_THRESHOLD) {
  if (!current || !responseHistory || responseHistory.length === 0) {
    return false
  }

  const lastResponses = responseHistory.slice(-5)

  for (const previous of lastResponses) {
    const jaccard = jaccardSimilarity(current, previous)
    const ngram = ngramSimilarity(current, previous)
    const combined = (jaccard * 0.4) + (ngram * 0.6)

    if (combined > threshold) {
      return {
        isRepeating: true,
        similarity: combined,
        similarTo: previous.substring(0, 60),
      }
    }
  }

  return false
}

export function getVariantResponse(action, language, turnCount) {
  const variants = {
    explore: {
      es: [
        `Cuéntame cómo estás—¿qué está pasando en tu vida en este momento?`,
        `Me gustaría conocerte mejor. ¿Cómo es tu día a día?`,
        `Háblame de ti—¿qué es lo más importante para ti ahora?`,
        `Cuéntame un poco sobre tu situación actual—¿cómo te sientes con respecto a ella?`,
        `Estoy aquí para escucharte. ¿Qué te gustaría compartir conmigo?`,
        `¿Cómo van las cosas por tu lado? Cuéntame un poco.`,
        `Dime, ¿qué te gustaría explorar hoy?`,
        `Cuéntame, ¿cómo te sientes acerca de tu situación actual?`,
      ],
      en: [
        `Tell me how you are—what's happening in your life right now?`,
        `I'd like to get to know you better. What's your day-to-day like?`,
        `Tell me about yourself—what's most important to you right now?`,
        `Tell me a bit about your current situation—how do you feel about it?`,
        `I'm here to listen. What would you like to share with me?`,
        `How are things on your end? Tell me a bit.`,
        `What would you like to explore today?`,
        `How do you feel about your current situation?`,
      ],
    },
    guide: {
      es: [
        `Háblame de lo que te trae aquí hoy. Sin estructura, solo tus palabras.`,
        `¿Qué te gustaría lograr en esta conversación?`,
        `Cuéntame qué te preocupa más ahora mismo—y desde ahí construimos.`,
        `No necesitas tener un plan. Solo dime qué está pasando.`,
        `Empecemos con lo simple: ¿qué te gustaría cambiar en tu situación?`,
        `Dime por dónde te gustaría empezar—no hay respuesta incorrecta.`,
        `Cuéntame qué área de tu vida te gustaría fortalecer primero.`,
        `Háblame de lo que más te importa en este momento.`,
      ],
      en: [
        `Tell me what brings you here today. No structure, just your words.`,
        `What would you like to achieve in this conversation?`,
        `Tell me what worries you most right now—and we'll build from there.`,
        `You don't need to have a plan. Just tell me what's happening.`,
        `Let's start simple: what would you like to change about your situation?`,
        `Tell me where you'd like to start—there's no wrong answer.`,
        `What area of your life would you like to strengthen first?`,
        `Tell me what matters most to you right now.`,
      ],
    },
    support: {
      es: [
        `Siento que estás pasando por un momento difícil. Estoy aquí contigo.`,
        `Lo que sea que estés sintiendo, está bien sentirlo. No tienes que enfrentarlo solo.`,
        `Tómate tu tiempo. Estoy aquí cuando quieras hablar.`,
        `Respira. No tienes que resolver todo hoy. Un paso a la vez.`,
        `A veces solo hablar ayuda. Cuéntame lo que sea que tengas en mente.`,
        `Está bien no estar bien. Estoy aquí para acompañarte.`,
        `No hay prisa. Podemos ir al ritmo que necesites.`,
        `Lo que sientes es válido. Cuéntame más cuando te sientas listo.`,
      ],
      en: [
        `I sense you're going through a difficult time. I'm here with you.`,
        `Whatever you're feeling, it's okay to feel it. You don't have to face it alone.`,
        `Take your time. I'm here whenever you want to talk.`,
        `Breathe. You don't have to solve everything today. One step at a time.`,
        `Sometimes just talking helps. Tell me whatever is on your mind.`,
        `It's okay not to be okay. I'm here for you.`,
        `There's no rush. We can go at your pace.`,
        `What you feel is valid. Tell me more when you're ready.`,
      ],
    },
    acknowledge: {
      es: [
        `Entiendo. Sigue cuando quieras.`,
        `Gracias por compartir eso. ¿Hay algo más en tu mente?`,
        `Te escucho. Cuéntame más cuando estés listo.`,
        `Entiendo cómo te sientes. Sigue adelante.`,
        `Aprecio que me lo cuentes. ¿Quieres añadir algo más?`,
        `Entiendo tu punto. ¿Hay algo más que quieras explorar?`,
        `Gracias por contarme. Sigo aquí cuando quieras continuar.`,
        `Te entiendo perfectamente. Continúa cuando gustes.`,
      ],
      en: [
        `I understand. Go on whenever you like.`,
        `Thanks for sharing that. Is there anything else on your mind?`,
        `I hear you. Tell me more when you're ready.`,
        `I understand how you feel. Go ahead.`,
        `I appreciate you telling me. Would you like to add anything else?`,
        `I see your point. Is there anything else you'd like to explore?`,
        `Thanks for telling me. I'm still here when you want to continue.`,
        `I understand completely. Continue whenever you like.`,
      ],
    },
  }

  const pool = variants[action]
  if (!pool) return null

  const langPool = pool[language] || pool.es
  return langPool[turnCount % langPool.length]
}
