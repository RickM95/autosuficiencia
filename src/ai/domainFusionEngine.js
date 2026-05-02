const DOMAIN_SIGNALS = {
  emotional: {
    label: { es: 'Emocional', en: 'Emotional' },
    signals: [
      { weight: 1.0, patterns: [/\b(?:suicide|suicidio|kill myself|matarme|end my life|quitarme la vida)\b/i], result: 'crisis' },
      { weight: 0.9, patterns: [/\b(?:give up|me rindo|no puedo m[aá]s|i can't (?:take|do) this|no aguanto m[aá]s)\b/i], result: 'desperation' },
      { weight: 0.8, patterns: [/\b(?:overwhelmed|abrumado|abrumada|drowning|ahogando|buried|enterrrado)\b/i], result: 'overwhelm' },
      { weight: 0.7, patterns: [/\b(?:depressed|depresi[oó]n|deprimido|hopeless|sin esperanza|desesperanza)\b/i], result: 'depression' },
      { weight: 0.6, patterns: [/\b(?:stressed|estresado|estresada|anxious|ansiedad|ansioso|nervous|nervioso)\b/i], result: 'anxiety' },
      { weight: 0.5, patterns: [/\b(?:frustrated|frustrado|frustrada|angry|enojado|enojada|molesto)\b/i], result: 'frustration' },
      { weight: 0.5, patterns: [/\b(?:lonely|solo|sola|soledad|alone|aislado|aislada)\b/i], result: 'loneliness' },
      { weight: 0.4, patterns: [/\b(?:triste|sad|unhappy|infeliz|down|desanimado|desanimada)\b/i], result: 'sadness' },
      { weight: 0.4, patterns: [/\b(?:worried|preocupado|preocupada|scared|asustado|miedo|fear)\b/i], result: 'fear' },
      { weight: 0.3, patterns: [/\b(?:disappointed|decepcionado|decepcionada|desilusionado)\b/i], result: 'disappointment' },
    ],
  },
  lifeDirection: {
    label: { es: 'Dirección de vida', en: 'Life Direction' },
    signals: [
      { weight: 0.8, patterns: [/\b(?:don't know what to do|no s[eé] qu[eé] hacer|no s[eé] qu[eé] camino tomar|lost in life|perdido en la vida)\b/i], result: 'existential_confusion' },
      { weight: 0.7, patterns: [/\b(?:no purpose|sin prop[oó]sito|no tengo direcci[oó]n|no direction|no s[eé] a d[oó]nde voy)\b/i], result: 'lack_of_purpose' },
      { weight: 0.6, patterns: [/\b(?:confused about (?:future|life|my path)|confundido sobre (?:futuro|vida|camino))\b/i], result: 'future_uncertainty' },
      { weight: 0.5, patterns: [/\b(?:what should i do with my life|qu[eé] hago con mi vida|cual es mi prop[oó]sito|what is my purpose)\b/i], result: 'purpose_search' },
      { weight: 0.4, patterns: [/\b(?:stuck|estancado|estancada|no avanzo|not progressing|sin avance)\b/i], result: 'stagnation' },
      { weight: 0.4, patterns: [/\b(?:uncertain|incierto|no estoy seguro|not sure about|indeciso)\b/i], result: 'uncertainty' },
      { weight: 0.3, patterns: [/\b(?:what's next|what now|qu[eé] sigue|y ahora|ahora qu[eé])\b/i], result: 'next_step_uncertainty' },
    ],
  },
  financial: {
    label: { es: 'Financiero', en: 'Financial' },
    signals: [
      { weight: 0.9, patterns: [/\b(?:no tengo dinero|sin dinero|no money|broke|quiebra|bankrupt|insolvente)\b/i], result: 'zero_income' },
      { weight: 0.8, patterns: [/\b(?:emergency|emergencia|urgent|urgente|crisis financiera|financial crisis)\b/i], result: 'financial_crisis' },
      { weight: 0.7, patterns: [/\b(?:debt|deuda|deudas|debo|owe|pr[eé]stamo|loan)\b/i], result: 'debt_stress' },
      { weight: 0.6, patterns: [/\b(?:can't pay|no puedo pagar|sin trabajo|unemployed|desempleado|no tengo trabajo)\b/i], result: 'income_loss' },
      { weight: 0.5, patterns: [/\b(?:need money|necesito dinero|need income|necesito ingresos|earn|ganar)\b/i], result: 'income_need' },
      { weight: 0.4, patterns: [/\b(?:self.sufficient|autosuficiencia|independencia financiera|financial freedom)\b/i], result: 'self_sufficiency_desire' },
      { weight: 0.3, patterns: [/\b(?:budget|presupuesto|save|ahorrar|savings|ahorro|gasto|spend)\b/i], result: 'financial_management' },
    ],
  },
  behavioral: {
    label: { es: 'Comportamiento', en: 'Behavioral' },
    signals: [
      { weight: 0.7, patterns: [/\b(?:i don't do anything|no hago nada|procrastinate|procrastinando|no tengo motivaci[oó]n)\b/i], result: 'inaction' },
      { weight: 0.6, patterns: [/\b(?:can't start|no puedo empezar|can't begin|no s[eé] por d[oó]nde empezar|don't know where to start)\b/i], result: 'initiative_paralysis' },
      { weight: 0.5, patterns: [/\b(?:keep putting off|sigo dejando|postponing|posponiendo|avoiding|evitando)\b/i], result: 'avoidance' },
      { weight: 0.5, patterns: [/\b(?:no discipline|sin disciplina|can't stick|no me mantengo|no sigo)\b/i], result: 'lack_structure' },
      { weight: 0.4, patterns: [/\b(?:hesitant|dudando|hesito|no me decido|can't decide)\b/i], result: 'hesitation' },
      { weight: 0.3, patterns: [/\b(?:distracted|distra[íi]do|distracci[oó]n|no me concentro|can't focus)\b/i], result: 'lack_focus' },
      { weight: 0.3, patterns: [/\b(?:lazy|perezoso|sin energ[íi]a|no energy|fatigued|fatiga)\b/i], result: 'low_energy' },
    ],
  },
  social: {
    label: { es: 'Social', en: 'Social' },
    signals: [
      { weight: 0.8, patterns: [/\b(?:no one|nadie|alone|solo|sola|isolated|aislado|aislada)\b/i], result: 'isolation' },
      { weight: 0.7, patterns: [/\b(?:no friends|sin amigos|no support|sin apoyo|no help|no tengo apoyo)\b/i], result: 'lack_support' },
      { weight: 0.6, patterns: [/\b(?:disconnected|desconectado|desconectada|no pertenezco|don't belong)\b/i], result: 'disconnection' },
      { weight: 0.5, patterns: [/\b(?:no family|sin familia|no tengo a nadie|estranged|alejado)\b/i], result: 'family_disconnect' },
      { weight: 0.4, patterns: [/\b(?:nobody understands|nadie me entiende|can't talk to anyone|no puedo hablar con nadie)\b/i], result: 'communication_barrier' },
      { weight: 0.3, patterns: [/\b(?:shy|t[ií]mido|verg[uú]enza|social anxiety|ansiedad social)\b/i], result: 'social_anxiety' },
    ],
  },
}

const SHALLOW_PATTERNS = [
  /\btell me more\b/i,
  /\bcontinue when (?:you'?re|you are) ready\b/i,
  /\bis there anything else\b/i,
  /\bsigue cuando (?:est[eé]s|estas) listo\b/i,
  /\bcu[eé]ntame m[aá]s\b/i,
  /\banything else you want to share\b/i,
  /\balgo m[aá]s que quieras compartir\b/i,
]

function analyzeDomain(input, domainKey, domainConfig) {
  const results = []
  for (const signal of domainConfig.signals) {
    for (const pattern of signal.patterns) {
      if (pattern.test(input)) {
        results.push({
          domain: domainKey,
          signal: signal.result,
          confidence: signal.weight,
          label: domainConfig.label,
        })
        break
      }
    }
  }
  return results
}

export function fuseDomains(input, memory) {
  if (!input || !input.trim()) {
    return {
      domains: {},
      priorityDomain: null,
      combinedInsight: '',
      allSignals: [],
      hasEmotionalWeight: false,
    }
  }

  const allSignals = []
  const domains = {}

  for (const [domainKey, domainConfig] of Object.entries(DOMAIN_SIGNALS)) {
    const found = analyzeDomain(input, domainKey, domainConfig)
    if (found.length > 0) {
      domains[domainKey] = found
      allSignals.push(...found)
    }
  }

  allSignals.sort((a, b) => b.confidence - a.confidence)

  let priorityDomain = null
  let topConfidence = 0
  for (const [domainKey, signals] of Object.entries(domains)) {
    const maxConf = Math.max(...signals.map(s => s.confidence))
    if (maxConf > topConfidence) {
      topConfidence = maxConf
      priorityDomain = domainKey
    }
  }

  const combinedInsight = buildCombinedInsight(domains, priorityDomain, memory)

  const hasEmotionalWeight =
    (domains.emotional && domains.emotional.some(s => s.confidence >= 0.6)) ||
    (domains.lifeDirection && domains.lifeDirection.some(s => s.confidence >= 0.7))

  const result = { domains, priorityDomain, combinedInsight, allSignals, hasEmotionalWeight }

  memory.lastFusion = result

  return result
}

function buildCombinedInsight(domains, priorityDomain, memory) {
  const lang = memory.language || 'es'
  const parts = []

  if (domains.emotional) {
    const top = domains.emotional[0]
    parts.push(lang === 'es'
      ? `El usuario muestra ${top.signal} (confianza: ${Math.round(top.confidence * 100)}%)`
      : `User shows ${top.signal} (confidence: ${Math.round(top.confidence * 100)}%)`)
  }
  if (domains.lifeDirection) {
    const top = domains.lifeDirection[0]
    parts.push(lang === 'es'
      ? `Dirección de vida: ${top.signal}`
      : `Life direction: ${top.signal}`)
  }
  if (domains.financial) {
    const top = domains.financial[0]
    parts.push(lang === 'es'
      ? `Situación financiera: ${top.signal}`
      : `Financial: ${top.signal}`)
  }
  if (domains.behavioral) {
    const top = domains.behavioral[0]
    parts.push(lang === 'es'
      ? `Patrón de comportamiento: ${top.signal}`
      : `Behavioral pattern: ${top.signal}`)
  }
  if (domains.social) {
    const top = domains.social[0]
    parts.push(lang === 'es'
      ? `Contexto social: ${top.signal}`
      : `Social context: ${top.signal}`)
  }

  return parts.join(' | ')
}

export function isShallowResponse(text) {
  if (!text) return false
  for (const pattern of SHALLOW_PATTERNS) {
    if (pattern.test(text)) return true
  }
  return false
}

export function generateDeepResponse(input, fusion, memory) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en
  const { domains, priorityDomain, hasEmotionalWeight, allSignals } = fusion

  if (!priorityDomain) {
    return {
      insights: 'No specific domain detected',
      suggestedAction: t(
        `Cuéntame un poco más—¿qué está pasando en tu vida en este momento?`,
        `Tell me a bit more—what's happening in your life right now?`
      ),
      priority: 0.3
    }
  }

  const emotional = domains.emotional?.[0]
  const lifeDir = domains.lifeDirection?.[0]
  const financial = domains.financial?.[0]
  const behavioral = domains.behavioral?.[0]
  const social = domains.social?.[0]

  const hasMultiDomain = Object.keys(domains).length >= 2

  if (emotional && emotional.confidence >= 0.8) {
    return {
      insights: `Crisis detected: ${emotional.signal}`,
      suggestedAction: buildCrisisResponse(emotional, domains, memory, t),
      priority: 1.0
    }
  }

  if (priorityDomain === 'emotional' && hasMultiDomain) {
    return {
      insights: `Emotional with context: ${emotional.signal}`,
      suggestedAction: buildEmotionalWithContextResponse(emotional, domains, memory, t),
      priority: 0.8
    }
  }

  if (priorityDomain === 'emotional') {
    return {
      insights: `Pure emotional: ${emotional.signal}`,
      suggestedAction: buildPureEmotionalResponse(emotional, domains, memory, t),
      priority: 0.7
    }
  }

  if (priorityDomain === 'lifeDirection') {
    return {
      insights: `Life direction: ${lifeDir.signal}`,
      suggestedAction: buildLifeDirectionResponse(lifeDir, domains, memory, t),
      priority: 0.6
    }
  }

  if (priorityDomain === 'financial') {
    return {
      insights: `Financial: ${financial.signal}`,
      suggestedAction: buildFinancialResponse(financial, domains, memory, t),
      priority: 0.9
    }
  }

  if (priorityDomain === 'behavioral') {
    return {
      insights: `Behavioral: ${behavioral.signal}`,
      suggestedAction: buildBehavioralResponse(behavioral, domains, memory, t),
      priority: 0.5
    }
  }

  if (priorityDomain === 'social') {
    return {
      insights: `Social: ${social.signal}`,
      suggestedAction: buildSocialResponse(social, domains, memory, t),
      priority: 0.4
    }
  }

  return {
    insights: 'General domain fusion',
    suggestedAction: t(
      `Entiendo. Vamos a explorar juntos—¿qué te gustaría abordar primero?`,
      `I understand. Let's explore together—what would you like to address first?`
    ),
    priority: 0.4
  }
}

function buildCrisisResponse(emotional, domains, memory, t) {
  return t(
    `Lo que estás sintiendo es muy serio, y quiero que sepas que no estás solo en esto.\n\n` +
    `Antes de cualquier plan—tu bienestar es lo primero. ¿Hay alguien cercano con quien puedas hablar ahora mismo? ¿O prefieres que nos enfoquemos en algo peque\u00f1o que puedas hacer para sentirte mejor en este momento?`,
    `What you're feeling is very serious, and I want you to know you're not alone in this.\n\n` +
    `Before any plan—your wellbeing comes first. Is there someone close you can talk to right now? Or would you prefer we focus on something small you can do to feel better right now?`
  )
}

function buildEmotionalWithContextResponse(emotional, domains, memory, t) {
  const parts = []
  parts.push(t(
    `Eso que sientes—${emotional.signal}—es una se\u00f1al importante. Y no viene sola.`,
    `What you're feeling—${emotional.signal}—is an important signal. And it doesn't come alone.`
  ))

  const lifeDir = domains.lifeDirection?.[0]
  if (lifeDir) {
    parts.push(t(
      `Tambi\u00e9n noto que hay incertidumbre sobre tu direcci\u00f3n. Cuando no vemos un camino claro, la emoci\u00f3n se intensifica.`,
      `I also notice uncertainty about your direction. When we don't see a clear path, the emotion intensifies.`
    ))
  }

  const financial = domains.financial?.[0]
  if (financial) {
    parts.push(t(
      `Y la presi\u00f3n financiera agrega peso a todo lo dem\u00e1s.`,
      `And financial pressure adds weight to everything else.`
    ))
  }

  const social = domains.social?.[0]
  if (social) {
    parts.push(t(
      `Sentirte ${social.signal} hace que sea m\u00e1s dif\u00edcil encontrar apoyo.`,
      `Feeling ${social.signal} makes it harder to find support.`
    ))
  }

  parts.push(t(
    `\nVamos a reducir esto a algo manejable. De todo lo que mencionas—\u00bfqu\u00e9 es lo que m\u00e1s te pesa en este momento?`,
    `\nLet's reduce this to something manageable. Of everything you mention—what weighs on you the most right now?`
  ))

  return parts.join(' ')
}

function buildPureEmotionalResponse(emotional, domains, memory, t) {
  return t(
    `${emotional.signal} es una carga pesada. A veces cuando nos sentimos as\u00ed, lo \u00faltimo que queremos escuchar es "todo va a estar bien".\n\n` +
    `En lugar de eso—\u00bfqu\u00e9 necesitas AHORA? No en general—sino ahora mismo. \u00bfUn momento de descanso? \u00bfHablar con alguien? \u00bfUn plan concreto para salir de esto?`,
    `${emotional.signal} is a heavy burden. Sometimes when we feel this way, the last thing we want to hear is "everything will be okay."\n\n` +
    `Instead—what do you NEED right now? Not in general—right now. A moment to rest? Someone to talk to? A concrete plan to get out of this?`
  )
}

function buildLifeDirectionResponse(lifeDir, domains, memory, t) {
  return t(
    `La sensaci\u00f3n de no tener direcci\u00f3n puede paralizar m\u00e1s que cualquier obst\u00e1culo concreto.\n\n` +
    `Pero no necesitas tener todo resuelto. Solo necesitas UN paso claro hacia adelante.\n\n` +
    `Dime—si pudieras despertar ma\u00f1ana y tener claridad sobre UN \u00e1rea de tu vida, \u00bfcu\u00e1l ser\u00eda?`,
    `The feeling of having no direction can be more paralyzing than any concrete obstacle.\n\n` +
    `But you don't need to have everything figured out. You just need ONE clear step forward.\n\n` +
    `Tell me—if you could wake up tomorrow and have clarity on ONE area of your life, what would it be?`
  )
}

function buildFinancialResponse(financial, domains, memory, t) {
  const emotional = domains.emotional?.[0]
  const base = financial.signal
  let response

  if (base === 'zero_income' || base === 'financial_crisis') {
    response = t(
      `Cuando no hay ingresos, todo lo dem\u00e1s se vuelve urgente. Y eso agota.\n\n` +
      `No vamos a resolver todo hoy. Vamos a encontrar UNA cosa que puedas hacer HOY para generar algo.\n\n` +
      `\u00bfTienes alguna habilidad, herramienta o medio de transporte? Incluso sin nada, hay opciones.`,
      `When there's no income, everything becomes urgent. And that's exhausting.\n\n` +
      `We're not going to solve everything today. Let's find ONE thing you can do TODAY to generate something.\n\n` +
      `Do you have any skill, tool, or transportation? Even with nothing, there are options.`
    )
  } else if (emotional) {
    response = t(
      `La presi\u00f3n financiera combinada con ${emotional.signal} es una combinaci\u00f3n dif\u00edcil.\n\n` +
      `Pero el hecho de que est\u00e9s hablando de esto ya es un paso. Muchas personas se quedan calladas.\n\n` +
      `Hablemos de lo pr\u00e1ctico—\u00bfcu\u00e1l es tu fuente de ingresos actual? Aunque sea peque\u00f1a.`,
      `Financial pressure combined with ${emotional.signal} is a tough combination.\n\n` +
      `But the fact that you're talking about this is already a step. Many people stay silent.\n\n` +
      `Let's talk practically—what's your current source of income? Even if it's small.`
    )
  } else {
    response = t(
      `Entiendo que la situaci\u00f3n financiera te preocupa. Es una de las \u00e1reas m\u00e1s comunes de estr\u00e9s, y tambi\u00e9n una donde peque\u00f1os cambios pueden tener gran impacto.\n\n` +
      `\u00bfQuieres que exploremos opciones pr\u00e1cticas juntos?`,
      `I understand financial concerns weigh on you. It's one of the most common stress areas, and also one where small changes can have big impact.\n\n` +
      `Want to explore practical options together?`
    )
  }

  return response
}

function buildBehavioralResponse(behavioral, domains, memory, t) {
  const base = behavioral.signal
  if (base === 'inaction' || base === 'initiative_paralysis') {
    return t(
      `No hacer nada no es pereza—muchas veces es se\u00f1al de que no sabemos por d\u00f3nde empezar o le tenemos miedo al resultado.\n\n` +
      `La clave no es motivaci\u00f3n. La clave es reducir la acci\u00f3n a algo TAN peque\u00f1o que sea imposible no hacerlo.\n\n` +
      `\u00bfCu\u00e1l es la cosa m\u00e1s peque\u00f1a que podr\u00edas hacer hoy? No importante—solo posible.`,
      `Doing nothing isn't laziness—often it's a sign we don't know where to start or we fear the outcome.\n\n` +
      `The key isn't motivation. The key is to reduce the action to something SO small it's impossible not to do it.\n\n` +
      `What's the smallest thing you could do today? Not important—just possible.`
    )
  }
  return t(
    `Noto que hay un patr\u00f3n de ${base} que podr\u00eda estar fren\u00e1ndote. No te juzgo—es algo que le pasa a muchas personas cuando enfrentan situaciones complejas.\n\n` +
    `Lo que funciona no es forzarse, sino cambiar el enfoque. \u00bfQu\u00e9 crees que necesitas para romper ese ciclo?`,
    `I notice a pattern of ${base} that might be holding you back. I'm not judging—it happens to many people facing complex situations.\n\n` +
    `What works isn't forcing yourself, but changing the approach. What do you think you need to break that cycle?`
  )
}

function buildSocialResponse(social, domains, memory, t) {
  if (social.signal === 'isolation' || social.signal === 'lack_support') {
    return t(
      `La falta de conexi\u00f3n es una de las cargas m\u00e1s pesadas. No porque no haya personas—sino porque a veces no sentimos que podamos acercarnos a ellas.\n\n` +
      `\u00bfHay al menos una persona en tu vida con quien podr\u00edas hablar? No tiene que ser de todo—solo de c\u00f3mo est\u00e1s hoy.`,
      `Lack of connection is one of the heaviest burdens. Not because there aren't people—but because sometimes we don't feel we can reach out.\n\n` +
      `Is there at least one person in your life you could talk to? Not about everything—just about how you're doing today.`
    )
  }
  return t(
    `El aspecto social de lo que describes—${social.signal}—es algo que muchas personas enfrentan silenciosamente.\n\n` +
    `A veces el primer paso no es buscar mucha compa\u00f1\u00eda, sino encontrar UNA conexi\u00f3n significativa.\n\n` +
    `\u00bfC\u00f3mo te sientes con respecto a las personas que te rodean actualmente?`,
    `The social aspect of what you're describing—${social.signal}—is something many people face silently.\n\n` +
    `Sometimes the first step isn't seeking many connections, but finding ONE meaningful one.\n\n` +
    `How do you feel about the people around you currently?`
  )
}
