const INTENT_PATTERNS = {
  GREETING: {
    patterns: [
      /\b(hola|hi|hello|hey|buenas|buen[ao]s|saludos|good morning|good evening)\b/i,
    ],
    intent: 'greeting',
    requiresFollowUp: false,
    isFallback: false,
  },
  HOW_IT_WORKS: {
    patterns: [
      /\b(how (does this|does it) work|cómo funciona|como funciona|how (does|do) (i|you) (use|start|begin))\b/i,
      /\b(explain (this|the system)|qué es esto|what is this|dime cómo (funciona|empezar|empezamos))\b/i,
      /\b(tell me about (yourself|this|the system)|describe (this|the platform|the tool))\b/i,
    ],
    intent: 'how_it_works',
    requiresFollowUp: true,
    isFallback: false,
  },
  WHAT_TO_DO_FIRST: {
    patterns: [
      /\b(what (do|should) (i|we) do first|what now|where (do|should) (i|we) start)\b/i,
      /\b(por dónde (empezar|empiezo)|qué (hago|debo hacer) (primero|ahora)|cómo (empiezo|inicio))\b/i,
      /\b(first step|next step|guide me|help me start|help me begin|ayúdame a empezar|guíame)\b/i,
    ],
    intent: 'what_to_do_first',
    requiresFollowUp: true,
    isFallback: false,
  },
  AGREEMENT: {
    patterns: [
      /^(yes|yeah|yep|si|sí|ok|okay|sure|correct|right|dale|vamos|adelante|de acuerdo|está bien|bien|bueno)$/i,
      /^(claro|por supuesto|of course|certainly|absolutely|definitely|seguro)$/i,
    ],
    intent: 'agreement',
    requiresFollowUp: false,
    isContinuation: true,
    isFallback: false,
  },
  DISAGREEMENT: {
    patterns: [
      /^(no|nope|nah|negativo|no|para nada|nunca|jamás)$/i,
    ],
    intent: 'disagreement',
    requiresFollowUp: false,
    isContinuation: true,
    isFallback: false,
  },
  UNCERTAINTY: {
    patterns: [
      /^(idk|dunno|not sure|no sé|no se|no estoy seguro|quizás|quizá|tal vez|maybe|perhaps|i don't know|i don't understand|no entiendo|no comprendo)$/i,
      /\b(don't know what to (say|do|think)|no sé qué (decir|hacer|pensar))\b/i,
      /\b(confused|confundido)\b/i,
    ],
    intent: 'uncertainty',
    requiresFollowUp: true,
    isContinuation: true,
    isFallback: false,
  },
  EMOTIONAL: {
    patterns: [
      /\b(stress|stressed|estresado|anxious|ansiedad|ansioso|abrumado|overwhelmed|depressed|depresión|deprimido)\b/i,
      /\b(triste|sad|worried|preocupado|scared|asustado|miedo|panic|pánico)\b/i,
      /\b(crisis|desesperado|desperate|frustrated|frustrado|no puedo más)\b/i,
      /\b(i can't (take|do) (this|it anymore)|give up|me rindo|no aguanto)\b/i,
      /\b(estoy (muy )?mal|i('m| am) not ok|no estoy bien)\b/i,
    ],
    intent: 'emotional',
    requiresFollowUp: true,
    isFallback: false,
  },
  FINANCIAL: {
    patterns: [
      /\b(debt|deuda|deudas|money|dinero|budget|presupuesto)\b/i,
      /\b(income|ingreso|ingresos|expense|gasto|gastos)\b/i,
      /\b(save|ahorrar|savings|ahorro|emergency fund|fondo de emergencia)\b/i,
      /\b(bank|banco|loan|préstamo|préstamo|credit|crédito)\b/i,
      /\b(no me alcanza|not enough|broke|quiebra|bankrupt|insolvente)\b/i,
      /\b(financial|financiero|financiera|financieras|financieros)\b/i,
    ],
    intent: 'financial',
    requiresFollowUp: true,
    isFallback: false,
  },
  GOALS: {
    patterns: [
      /\b(goal|meta|metas|future|futuro|dream|sueño|plan|plan)\b/i,
      /\b(purpose|propósito|objective|objetivo)\b/i,
      /\b(i want to|quiero|quisiera|i need to|necesito)\b/i,
    ],
    intent: 'goals',
    requiresFollowUp: true,
    isFallback: false,
  },
  PLAN_REQUEST: {
    patterns: [
      /\b(generate a plan|generar un plan|create a plan|crear un plan|make a plan|hacer un plan)\b/i,
      /\b(your plan|mi plan|plan now|plan ahora|generate|generar)\b/i,
      /\b(give me a plan|dame un plan|muéstrame el plan|show me the plan|quiero mi plan|i want my plan)\b/i,
    ],
    intent: 'plan_request',
    requiresFollowUp: false,
    isFallback: false,
  },
  GRATITUDE: {
    patterns: [
      /\b(thank you|thanks|thank|gracias|muchas gracias|te lo agradezco|appreciate|agradecido)\b/i,
    ],
    intent: 'gratitude',
    requiresFollowUp: false,
    isContinuation: true,
    isFallback: false,
  },
  FAREWELL: {
    patterns: [
      /\b(bye|adiós|adios|see you|nos vemos|hasta luego|chao|goodbye|hasta pronto)\b/i,
    ],
    intent: 'farewell',
    requiresFollowUp: false,
    isFallback: false,
  },
  CLARIFICATION: {
    patterns: [
      /\b(what do you mean|qué quieres decir|qué significa|what does that mean)\b/i,
      /\b(explain more|explícame|a qué te refieres|what do you mean by)\b/i,
      /\b(can you explain|could you clarify|puedes explicar|puedes aclarar)\b/i,
    ],
    intent: 'clarification',
    requiresFollowUp: true,
    isContinuation: true,
    isFallback: false,
  },
  TOPIC_SHIFT: {
    patterns: [
      /\b(cambiar tema|change subject|another thing|otra cosa|different topic|tema diferente)\b/i,
      /\b(by the way|a propósito|hablando de otra cosa|enough about)\b/i,
    ],
    intent: 'topic_shift',
    requiresFollowUp: true,
    isFallback: false,
  },
}

export function detectIntent(input) {
  if (!input || !input.trim()) {
    return { intent: 'silence', confidence: 1, requiresFollowUp: true, isContinuation: false }
  }

  const trimmed = input.trim()
  const results = []

  for (const [key, config] of Object.entries(INTENT_PATTERNS)) {
    let bestCoverage = 0
    for (const pattern of config.patterns) {
      const match = trimmed.match(pattern)
      if (match) {
        const fullMatch = match[0]
        const coverage = fullMatch.length / trimmed.length
        bestCoverage = Math.max(bestCoverage, coverage)
      }
    }

    if (bestCoverage > 0) {
      const confidence = Math.min(bestCoverage + 0.2, 1)
      results.push({
        intent: config.intent,
        confidence,
        requiresFollowUp: config.requiresFollowUp,
        isContinuation: config.isContinuation || false,
        coverage: bestCoverage,
      })
    }
  }

  if (results.length === 0) {
    return {
      intent: 'general',
      confidence: 0.3,
      requiresFollowUp: true,
      isContinuation: false,
    }
  }

  results.sort((a, b) => b.confidence - a.confidence)
  const top = results[0]

  if (top.intent === 'agreement' || top.intent === 'disagreement' || top.intent === 'uncertainty' || top.intent === 'gratitude') {
    const strongerIntent = results.find(r =>
      r.intent !== top.intent &&
      !r.isContinuation &&
      r.confidence > top.confidence * 0.5
    )
    if (strongerIntent) {
      return {
        intent: strongerIntent.intent,
        confidence: strongerIntent.confidence,
        requiresFollowUp: strongerIntent.requiresFollowUp,
        isContinuation: false,
      }
    }
  }

  return {
    intent: top.intent,
    confidence: top.confidence,
    requiresFollowUp: top.requiresFollowUp,
    isContinuation: top.isContinuation || false,
  }
}
