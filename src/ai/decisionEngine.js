const WEIGHTS = {
  immediacy: 0.30,
  feasibility: 0.25,
  resourceMatch: 0.20,
  emotionalFit: 0.15,
  successProbability: 0.10,
}

function scoreImmediacy(option) {
  const t = (option.timeToFirstIncomeEn || '').toLowerCase()
  if (/(same day|mismo d[ií]a)/.test(t)) return 1.0
  if (/(next day|siguiente|1-2 d[ií]as|1-2 days)/.test(t)) return 0.8
  if (/(1-3 d[ií]as|1-3 days)/.test(t)) return 0.7
  if (/(1-7 d[ií]as|1-7 days)/.test(t)) return 0.5
  if (/(1-2 semanas|1-2 weeks)/.test(t)) return 0.3
  if (/(1-3 semanas|1-3 weeks)/.test(t)) return 0.2
  return 0.4
}

function scoreFeasibility(option, userState) {
  let score = 0.7
  if (userState.hasNothing) {
    if (option.requiredResources.length === 0) score = 0.9
    else score = 0.4
  }
  if (option.requiredResources.length === 0) score = Math.max(score, 0.85)
  if (option.category === 'zeroCapital') score = Math.max(score, 0.8)
  if (option.category === 'skillBuilding') score = Math.max(score, 0.4)
  if (userState.isOverwhelmed && option.requiredResources.length > 0) score = Math.min(score, 0.3)
  return Math.min(score, 1.0)
}

function scoreResourceMatch(option, userState) {
  let matchCount = 0
  let totalNeeded = Math.max(option.requiredResources.length, 1)

  for (const res of option.requiredResources) {
    const r = res.toLowerCase()
    if (userState.hasPhone && /\b(tel[eé]fono|celular|phone|whatsapp|smartphone)\b/i.test(r)) matchCount++
    if (userState.hasBike && /\b(bici|bike|bicycle)\b/i.test(r)) matchCount++
    if (userState.hasKitchen && /\b(cocina|kitchen|cocinar|cook)\b/i.test(r)) matchCount++
    if (userState.hasCapital && /\b(capital|inicial)\b/i.test(r)) matchCount++
    if (userState.hasTransport && /\b(moto|veh[ií]culo|transport)\b/i.test(r)) matchCount++
  }

  if (option.requiredResources.length === 0) return 1.0
  if (userState.hasNothing) return 0.3
  return matchCount / totalNeeded
}

function scoreEmotionalFit(option, userState) {
  if (!userState.isOverwhelmed) return 0.8
  if (option.category === 'zeroCapital') return 0.9
  if (option.requiredResources.length > 1) return 0.3
  if (option.stepsEn.length > 3) return 0.4
  return 0.6
}

function scoreSuccessProbability(option, userState) {
  let score = 0.6
  if (option.riskLevel === 'Bajo' || option.riskLevelEn === 'Low') score += 0.2
  if (option.category === 'zeroCapital') score += 0.1
  if (option.category === 'skillBuilding') score -= 0.2
  if (userState.isUrban !== false && option.id === 'vendor_helper') score += 0.1
  if (userState.isUrban === false && option.id === 'yard_work') score += 0.1
  return Math.min(score, 1.0)
}

function calculateTotalScore(option, userState) {
  const scores = {
    immediacy: scoreImmediacy(option),
    feasibility: scoreFeasibility(option, userState),
    resourceMatch: scoreResourceMatch(option, userState),
    emotionalFit: scoreEmotionalFit(option, userState),
    successProbability: scoreSuccessProbability(option, userState),
  }

  const total =
    scores.immediacy * WEIGHTS.immediacy +
    scores.feasibility * WEIGHTS.feasibility +
    scores.resourceMatch * WEIGHTS.resourceMatch +
    scores.emotionalFit * WEIGHTS.emotionalFit +
    scores.successProbability * WEIGHTS.successProbability

  return { total, breakdown: scores }
}

export function selectBestAction(options, memory, context = {}) {
  if (!options || options.allOptions.length === 0) {
    return {
      selectedAction: null,
      reasoning: 'No options available',
      executionPlan: [],
      fallbackPlan: [],
      confidence: 0,
    }
  }

  const userState = assessDecisionState(memory, context)
  const maxOptions = userState.isOverwhelmed ? 3 : options.allOptions.length
  const candidates = options.allOptions.slice(0, maxOptions)

  const scored = candidates.map(opt => ({
    option: opt,
    ...calculateTotalScore(opt, userState),
  }))

  scored.sort((a, b) => b.total - a.total)
  const best = scored[0]
  const second = scored[1]

  const lang = memory.language || 'es'
  const title = lang === 'es' ? best.option.titleEs : best.option.titleEn
  const steps = lang === 'es' ? best.option.stepsEs : best.option.stepsEn
  const desc = lang === 'es' ? best.option.descriptionEs : best.option.descriptionEn

  const executionPlan = generateExecutionPlan(steps, best.option, userState, lang)
  const fallbackPlan = second ? generateFallbackPlan(second, userState, lang) : generateGenericFallback(userState, lang)

  const decision = {
    selectedAction: {
      ...best.option,
      score: best.total,
      scoreBreakdown: best.breakdown,
    },
    reasoning: buildReasoning(best, userState, lang),
    executionPlan,
    fallbackPlan,
    confidence: Math.round(best.total * 100) / 100,
  }

  memory.lastDecision = {
    ...decision,
    currentStepIndex: 0,
    startedAt: Date.now(),
    status: 'proposed',
  }

  return decision
}

function assessDecisionState(memory, context) {
  const inputs = memory.userInputs || []
  const allText = inputs.map(u => u.content).join(' ').toLowerCase()
  const sentiment = memory.sentiment || 'neutral'

  const isOverwhelmed = sentiment === 'overwhelmed' ||
    /\b(overwhelm|abrumado|no s[eé]|don't know|lost|perdido|estresado|stressed|ansioso|anxious)\b/i.test(allText)

  const hasPhone = /\b(tel[eé]fono|celular|phone|cell|whatsapp)\b/i.test(allText) || context.hasPhone
  const hasBike = /\b(bici|bicicleta|bike|bicycle)\b/i.test(allText) || context.hasBike
  const hasKitchen = /\b(cocina|kitchen|cocinar|cook)\b/i.test(allText) || context.hasKitchen
  const hasCapital = /\b(\d{3,})\b/.test(allText)
  const hasNothing = !hasPhone && !hasBike && !hasKitchen && !hasCapital &&
    /\b(no tengo|no t[eé]ngo|have nothing|sin trabajo|unemployed|no money|sin dinero)\b/i.test(allText)

  return { isOverwhelmed, hasPhone, hasBike, hasKitchen, hasCapital, hasNothing }
}

function generateExecutionPlan(steps, option, userState, lang) {
  const plan = steps.map((step, i) => ({
    stepNumber: i + 1,
    instruction: step,
    status: 'pending',
  }))
  return plan
}

function generateFallbackPlan(secondBest, userState, lang) {
  const title = lang === 'es' ? secondBest.option.titleEs : secondBest.option.titleEn
  const steps = lang === 'es' ? secondBest.option.stepsEs : secondBest.option.stepsEn

  return [
    {
      optionTitle: title,
      score: secondBest.total,
      steps: steps.map((s, i) => ({
        stepNumber: i + 1,
        instruction: s,
        status: 'pending',
      })),
    },
  ]
}

function generateGenericFallback(userState, lang) {
  const es = lang === 'es'
  return [
    {
      optionTitle: es ? 'Preguntar en negocios locales' : 'Ask at local businesses',
      score: 0.5,
      steps: [
        { stepNumber: 1, instruction: es ? 'Camina por tu colonia y entra a 5 negocios' : 'Walk through your neighborhood and enter 5 businesses' },
        { stepNumber: 2, instruction: es ? 'Pregunta si necesitan ayuda temporal' : 'Ask if they need temporary help' },
        { stepNumber: 3, instruction: es ? 'Deja tu nombre y número en cada lugar' : 'Leave your name and number at each place' },
      ],
    },
  ]
}

function buildReasoning(scored, userState, lang) {
  const t = (es, en) => lang === 'es' ? es : en
  const title = lang === 'es' ? scored.option.titleEs : scored.option.titleEn
  const time = lang === 'es' ? scored.option.timeToFirstIncomeEs : scored.option.timeToFirstIncomeEn
  const parts = [t(
    `Recomiendo: **${title}**.`,
    `I recommend: **${title}**.`
  )]

  if (scored.breakdown.immediacy > 0.8) {
    parts.push(t(
      `Puedes generar ingreso ${time.toLowerCase()}.`,
      `You can generate income ${time.toLowerCase()}.`
    ))
  }
  if (scored.breakdown.feasibility > 0.7) {
    parts.push(t(
      `No necesitas inversión ni experiencia previa.`,
      `You don't need investment or prior experience.`
    ))
  }
  if (userState.isOverwhelmed) {
    parts.push(t(
      `Es la opción más simple para empezar sin presión.`,
      `It's the simplest option to start without pressure.`
    ))
  }

  return parts.join(' ')
}

export function getExecutionStep(memory) {
  const decision = memory.lastDecision
  if (!decision || decision.status === 'completed' || decision.status === 'failed') {
    return null
  }

  const plan = decision.executionPlan
  if (!plan || plan.length === 0) return null

  const currentIdx = decision.currentStepIndex || 0
  if (currentIdx >= plan.length) {
    decision.status = 'completed'
    return { type: 'completed', message: '' }
  }

  return {
    type: 'step',
    step: plan[currentIdx],
    currentStep: currentIdx + 1,
    totalSteps: plan.length,
  }
}

export function advanceExecution(memory, result) {
  const decision = memory.lastDecision
  if (!decision) return null

  const plan = decision.executionPlan
  const currentIdx = decision.currentStepIndex || 0

  if (result === 'success') {
    plan[currentIdx].status = 'done'
    decision.currentStepIndex = currentIdx + 1
    if (decision.currentStepIndex >= plan.length) {
      decision.status = 'completed'
      return buildCompletionResponse(memory)
    }
    return buildNextStepResponse(memory)
  }

  if (result === 'failed') {
    plan[currentIdx].status = 'failed'
    decision.attempts = (decision.attempts || 0) + 1

    if (decision.fallbackPlan && decision.fallbackPlan.length > 0 && decision.attempts <= 2) {
      const fallback = decision.fallbackPlan[0]
      decision.executionPlan = fallback.steps.map(s => ({ ...s, status: 'pending' }))
      decision.currentStepIndex = 0
      decision.status = 'fallback'
      return buildFallbackResponse(memory, fallback)
    }

    decision.status = 'failed'
    return buildFailureResponse(memory)
  }

  return null
}

function buildNextStepResponse(memory) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en
  const step = getExecutionStep(memory)
  if (!step || step.type !== 'step') return null

  return {
    text: t(
      `Bien. Ahora el siguiente paso:\n\n**Paso ${step.currentStep} de ${step.totalSteps}:** ${step.step.instruction}\n\nAvísame cuando lo hayas hecho.`,
      `Good. Now the next step:\n\n**Step ${step.currentStep} of ${step.totalSteps}:** ${step.step.instruction}\n\nLet me know when you've done it.`
    ),
    step,
  }
}

function buildCompletionResponse(memory) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en
  return {
    text: t(
      `¡Completaste todos los pasos! 🎉\n\nHas avanzado mucho. Ahora puedes repetir este proceso o explorar nuevas opciones.\n\n¿Quieres seguir con otra estrategia o tomarte un tiempo para evaluar cómo te fue?`,
      `You completed all the steps! 🎉\n\nYou've made real progress. Now you can repeat this process or explore new options.\n\nWant to continue with another strategy or take time to evaluate how it went?`
    ),
    type: 'completed',
  }
}

function buildFallbackResponse(memory, fallback) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en
  return {
    text: t(
      `Eso no funcionó — pero es normal. No siempre sale a la primera.\n\n**Intentemos con otra opción: ${fallback.optionTitle}**\n\n**Paso 1:** ${fallback.steps[0].instruction}\n\nAvísame cómo te va.`,
      `That didn't work — but that's normal. It doesn't always work on the first try.\n\n**Let's try another option: ${fallback.optionTitle}**\n\n**Step 1:** ${fallback.steps[0].instruction}\n\nLet me know how it goes.`
    ),
    type: 'fallback',
  }
}

function buildFailureResponse(memory) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en
  return {
    text: t(
      `Hemos intentado varias opciones y ninguna funcionó aún. Eso no significa que no haya salida — solo significa que necesitamos un enfoque diferente.\n\n¿Quieres que exploremos juntos otras posibilidades? A veces lo que funciona es preguntar de forma distinta o en otro lugar.`,
      `We've tried several options and none have worked yet. That doesn't mean there's no way forward — it just means we need a different approach.\n\nWant to explore other possibilities together? Sometimes what works is asking differently or in a different place.`
    ),
    type: 'failed',
  }
}

export function generateDecisionResponse(memory, context = {}) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en

  const decision = memory.lastDecision
  if (decision && decision.status === 'proposed') {
    const title = lang === 'es' ? decision.selectedAction.titleEs : decision.selectedAction.titleEn
    const step = decision.executionPlan[0]

    return {
      insights: `Decision proposed: ${title}`,
      suggestedAction: t(
        `${decision.reasoning}\n\nVamos paso a paso.\n\n**Paso 1:** ${step.instruction}\n\nHaz esto y luego me cuentas cómo te fue.`,
        `${decision.reasoning}\n\nLet's go step by step.\n\n**Step 1:** ${step.instruction}\n\nDo this and then tell me how it went.`
      ),
      priority: decision.confidence || 0.7,
      decision,
    }
  }

  const step = getExecutionStep(memory)
  if (step && step.type === 'step') {
    return {
      insights: `Decision step: ${step.currentStep}/${step.totalSteps}`,
      suggestedAction: t(
        `**Paso ${step.currentStep} de ${step.totalSteps}:** ${step.step.instruction}\n\nAvísame cuando lo completes.`,
        `**Step ${step.currentStep} of ${step.totalSteps}:** ${step.step.instruction}\n\nLet me know when you complete it.`
      ),
      priority: 0.8,
      decision,
    }
  }

  return null
}
