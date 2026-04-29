import { getBudgetAdvice, getDebtAdvice, getSavingsAdvice, getIncomeAdvice } from './advice/finances.js'
import { getNeedsAdvice, getStressAdvice, getResourcesAdvice } from './advice/wellbeing.js'
import { getGoalsAdvice } from './advice/goals.js'
import { analyzeCompleteness } from './Analyzer.js'
import { generatePlan } from './PlanGenerator.js'
import { isDevRequest, routeDevRequest, buildModuleRegistry, buildPackageJson, classifyAndRoute } from './devAgent/index.js'
import { EmotionalIntelligence } from './EmotionalIntelligence.js'
import { ResponseGenerator } from './ResponseGenerator.js'

const PRECISION_PREFIX = ''

function nephiFrame(text, lang) {
  const prefix = lang === 'es'
    ? `**Nephi — Análisis**\n\n`
    : `**Nephi — Analysis**\n\n`
  return prefix + text
}

const WELCOME_MESSAGES = {
  es: {
    first: `👋 **¡Hola! Soy Nephi, tu asesor de autosuficiencia.**\n\nEstoy aquí para ayudarte a analizar tu situación financiera, establecer metas claras y construir un plan que funcione para ti.\n\n**¿Qué puedo hacer por ti?**\n- 📊 **Analizar tu situación** — evaluar necesidades y finanzas\n- 🎯 **Crear metas** — objetivos con pasos prácticos\n- 💰 **Gestión financiera** — presupuesto, deudas, ahorro\n- 📋 **Generar plan** — plan de autosuficiencia\n\nCuéntame, ¿qué te gustaría trabajar hoy?`,
    returning: `👋 **Bienvenido de nuevo.** ¿En qué puedo ayudarte hoy?`,
  },
  en: {
    first: `👋 **Hello! I'm Nephi, your self-sufficiency advisor.**\n\nI'm here to help you analyze your financial situation, set clear goals, and build a plan that works for you.\n\n**What can I do for you?**\n- 📊 **Analyze your situation** — assess needs and finances\n- 🎯 **Create goals** — objectives with practical steps\n- 💰 **Manage money** — budget, debt, savings\n- 📋 **Generate plan** — self-sufficiency plan\n\nTell me, what would you like to work on today?`,
    returning: `👋 **Welcome back.** How can I help you today?`,
  },
}

export function buildWelcomeMessage(memory, formData, lang) {
  const name = formData?.name || ''
  if (memory.interactionCount === 0) return WELCOME_MESSAGES[lang || 'es'].first
  const greeting = name ? (lang === 'es' ? `👋 **¡Hola ${name}!** ` : `👋 **Hello ${name}!** `) : ''
  return greeting + WELCOME_MESSAGES[lang || 'es'].returning
}

// ═══════════════════════════════════════════════════════════════
// PRIMARY ENTRY POINT — Context-aware response assembly
// ═══════════════════════════════════════════════════════════════

export function assembleResponse(stage, analysis, formData, budgetData, memory, userMessage, lang) {
  const emotion = analysis.emotionalContext || { intensity: 0, interventionNeed: 'NORMAL' }
  const subtexts = analysis.subtexts || []
  const intents = analysis.intents || []
  const dualReason = analysis.dualReasoning || {}
  const selectedMode = dualReason.responseMode || 'NORMAL'
  const turnCount = memory.interactionCount || 0

  if (analysis.structureError && !analysis.stage) {
    return lang === 'es'
      ? '⚠️ Encontré un problema técnico. Por favor intenta de nuevo.'
      : '⚠️ I encountered a technical issue. Please try again.'
  }

  // Priority 1: Crisis / immediate emotional intervention
  if (emotion.interventionNeed === 'IMMEDIATE') {
    return _buildHumanResponse('IMMEDIATE', emotion, subtexts, intents, analysis, formData, budgetData, memory, userMessage, lang, turnCount)
  }

  // Priority 2: Dev Agent — only for explicit technical requests
  const shouldBlockDev = emotion.interventionNeed === 'IMMEDIATE' || emotion.interventionNeed === 'IMPORTANT'
  const isDev = !shouldBlockDev && userMessage && isDevRequest(userMessage)

  if (isDev) {
    const routing = classifyAndRoute(userMessage)
    if (routing.shouldBlockDevTrigger) {
      const response = buildEmotionalResponse(routing, userMessage, lang)
      if (response) return response
    }
    return _handleDevRequest(userMessage, lang)
  }

  // Priority 3: Human layer modes (emotional/confusion/obstacle detected)
  if (selectedMode === 'QUESTION_FIRST' || selectedMode === 'OBSTACLE_FIRST' || selectedMode === 'EMOTIONAL_FIRST') {
    return _buildHumanResponse(selectedMode, emotion, subtexts, intents, analysis, formData, budgetData, memory, userMessage, lang, turnCount)
  }

  // Priority 4: Welcome
  if (stage === 'WELCOME' && memory.interactionCount <= 1) {
    return buildWelcomeMessage(memory, formData, lang)
  }

  // Priority 5: KB-driven response — ONLY used as a supplement after humanization check
  // The KB response is used only when context is stable and no human-layer override is needed
  // It is reformatted through the contextual builder, NOT returned raw.
  // (Previously this was a hard early-exit that bypassed all humanization — now removed)

  return _buildContextualResponse(stage, analysis, formData, budgetData, memory, userMessage, lang, turnCount)
}

// ═══════════════════════════════════════════════════════════════
// HUMAN RESPONSE VARIATION POOLS
// Prevents repetition across turns — selected by (turnCount % pool.length)
// ═══════════════════════════════════════════════════════════════

const GUIDANCE_POOL = {
  es: [
    `Entiendo que no estás seguro por dónde empezar. Eso es completamente normal, y es el punto de partida más honesto.\n\n**¿Qué área te preocupa más en este momento?**\n\n- Finanzas y presupuesto\n- Metas y futuro\n- Necesidades inmediatas (vivienda, alimentación, salud)\n- Algo más\n\nCuéntame y lo trabajamos juntos, paso a paso.`,
    `Estás en el lugar correcto. A veces el primer paso más difícil es simplemente no saber cuál dar.\n\n**¿Cuál de estas describe mejor lo que sientes ahora?**\n\n- Tengo demasiados problemas y no sé cuál atacar primero\n- Sé lo que necesito pero no sé cómo lograrlo\n- Necesito que alguien me ayude a ver mi situación con claridad\n\nDime y empezamos desde ahí.`,
    `Eso que describes —no saber qué hacer— es más común de lo que crees. Y tiene solución.\n\n**Hablemos de lo más concreto:** ¿Hay algo que te quite el sueño en este momento? Una preocupación específica, aunque sea pequeña. Empieza por ahí.`,
    `Bien que estés aquí. Antes de hacer cualquier análisis o plan, necesito entender mejor tu situación.\n\n**Una pregunta simple:** Si pudieras cambiar UNA cosa en tu vida financiera o personal ahora mismo, ¿qué sería?`,
    `No tienes que tener todo claro para comenzar. De hecho, la claridad viene después del primer paso.\n\n**¿Qué te trajo aquí hoy?** Cuéntame con tus palabras —sin formatos, sin estructura. Solo dime qué está pasando.`
  ],
  en: [
    `I understand you're not sure where to begin. That's completely normal, and honestly, it's the most honest starting point.\n\n**Which area concerns you most right now?**\n\n- Finances and budget\n- Goals and future\n- Immediate needs (housing, food, health)\n- Something else\n\nTell me and we'll work through it together, step by step.`,
    `You're in the right place. Sometimes the hardest first step is simply not knowing which one to take.\n\n**Which of these best describes how you feel right now?**\n\n- I have too many problems and don't know which to tackle first\n- I know what I need but don't know how to get there\n- I need someone to help me see my situation clearly\n\nTell me and we'll start from there.`,
    `What you're describing —not knowing what to do— is more common than you think. And it has a solution.\n\n**Let's get concrete:** Is there something keeping you up at night? A specific concern, even a small one. Start with that.`,
    `Good that you're here. Before any analysis or planning, I need to better understand your situation.\n\n**One simple question:** If you could change ONE thing in your financial or personal life right now, what would it be?`,
    `You don't need to have it all figured out to start. Clarity comes after the first step.\n\n**What brought you here today?** Tell me in your own words —no format, no structure. Just tell me what's going on.`
  ]
}

const EMOTIONAL_POOL = {
  es: [
    `Escucho que estás en un momento difícil. Antes de hablar de planes o números, quiero que sepas que lo que sientes es válido.\n\n**Respira.** No tienes que resolver todo hoy.\n\n¿Qué es lo más urgente para ti en este momento? No lo que «debería» ser urgente —lo que tú sientes que lo es.`,
    `Lo que describes suena pesado. Y tiene sentido que sea así.\n\nNo voy a empezar con cifras ni con listas. Primero: **¿qué necesitas ahora mismo?** ¿Hablar de cómo te sientes, o que te ayude con algo concreto?`,
    `Entiendo. A veces la situación financiera y emocional se mezclan de una forma que parece imposible de separar.\n\nNo estás solo en esto. Muchas personas que han estado en situaciones similares encontraron una salida, aunque no la veían al principio.\n\n**¿Por dónde quieres empezar?** No hay respuesta incorrecta.`,
    `Gracias por compartirlo. Eso que sientes —esa presión— es una señal de que te importa tu situación. Eso es una fortaleza, aunque no lo parezca.\n\n**Un paso a la vez.** ¿Cuál sería el más pequeño que podrías dar hoy?`,
    `Lo que describes tiene solución, aunque desde donde estás no se vea. Conozco muchos casos similares.\n\nAntes de cualquier plan: **¿tienes a alguien con quien hablar de esto?** ¿Apoyo familiar o personas cercanas? Eso cambia mucho la estrategia.`
  ],
  en: [
    `I hear that you're going through a hard time. Before talking plans or numbers, I want you to know what you're feeling is valid.\n\n**Breathe.** You don't have to solve everything today.\n\nWhat's most urgent for you right now? Not what «should» be urgent —what you feel is urgent.`,
    `What you're describing sounds heavy. And it makes sense that it does.\n\nI'm not going to start with numbers or lists. First: **what do you need right now?** To talk about how you're feeling, or help with something concrete?`,
    `I understand. Sometimes financial and emotional pressure mix in a way that feels impossible to untangle.\n\nYou're not alone in this. Many people who've been in similar situations found a way through, even when they couldn't see it at first.\n\n**Where do you want to start?** There's no wrong answer.`,
    `Thank you for sharing that. What you're feeling —that pressure— is a sign that you care about your situation. That's a strength, even if it doesn't feel like one.\n\n**One step at a time.** What would be the smallest one you could take today?`,
    `What you're describing has a solution, even if you can't see it from where you are. I've seen similar situations turn around.\n\nBefore any plan: **do you have someone to talk to about this?** Family support, close friends? That changes the strategy significantly.`
  ]
}

function _buildHumanResponse(mode, emotion, subtexts, intents, analysis, formData, budgetData, memory, userMessage, lang, turnCount = 0) {
  const isVague = !userMessage
    || /^\s*$/.test(userMessage)
    || /\b(don't know|no sé|what to do|qué hacer|confused|confundido|idk|not sure|no estoy seguro)\b/i.test(userMessage)
  const isConfused = subtexts.some(s => s.subtext === 'USER_CONFUSION' || s.subtext === 'NEEDS_GUIDANCE')

  if (isVague || isConfused || mode === 'QUESTION_FIRST') {
    const pool = GUIDANCE_POOL[lang] || GUIDANCE_POOL.es
    return pool[turnCount % pool.length]
  }

  if (mode === 'EMOTIONAL_FIRST' || mode === 'IMMEDIATE') {
    const pool = EMOTIONAL_POOL[lang] || EMOTIONAL_POOL.es
    return pool[turnCount % pool.length]
  }

  if (mode === 'OBSTACLE_FIRST') {
    const barrier = subtexts.find(s => s.subtext === 'CAPABILITY_BARRIER')
    return lang === 'es'
      ? `Entiendo que hay algo que se siente como un obstáculo. Eso no significa que no tenga solución.\n\n**Cuéntame más:** ¿Cuál es la situación específica que sientes que te bloquea? A veces hay caminos que no son obvios al principio.`
      : `I understand something feels like an obstacle. That doesn't mean it has no solution.\n\n**Tell me more:** What's the specific situation that feels like it's blocking you? Sometimes there are paths that aren't obvious at first.`
  }

  return _buildContextualResponse(memory.stage, analysis, formData, budgetData, memory, userMessage, lang, turnCount)
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT-AWARE RESPONSE BUILDER
// ═══════════════════════════════════════════════════════════════

function _buildContextualResponse(stage, analysis, formData, budgetData, memory, userMessage, lang, turnCount = 0) {
  const topic = analysis.topic || 'general'
  const needs = analysis.needsAnalysis || { critical: [], warnings: [], score: 0 }
  const finances = analysis.financialAnalysis || { score: 0, hasDebt: false, isDeficit: false }
  const goals = analysis.goalsAnalysis || { score: 0, totalGoals: 0 }
  const completeness = analysis.completeness || { percent: 0 }

  if (stage === 'WELCOME' && memory.interactionCount <= 1) {
    return buildWelcomeMessage(memory, formData, lang)
  }

  if (needs.critical && needs.critical.length > 0) {
    return getNeedsAdvice(needs, formData, lang)
  }

  if (stage === 'FINANCIAL_REVIEW' || topic === 'budget' || topic === 'debt' || topic === 'income' || topic === 'emergency') {
    if (topic === 'debt' || (userMessage || '').toLowerCase().includes('debt') || (userMessage || '').toLowerCase().includes('deuda')) {
      return getDebtAdvice(finances, formData, lang)
    }
    if (topic === 'emergency' || (userMessage || '').toLowerCase().includes('ahorr') || (userMessage || '').toLowerCase().includes('sav')) {
      return getSavingsAdvice(finances, formData, lang)
    }
    if (topic === 'income' || (userMessage || '').toLowerCase().includes('ingreso') || (userMessage || '').toLowerCase().includes('income')) {
      return getIncomeAdvice(finances, formData, lang)
    }
    if (topic === 'budget' || finances.isDeficit) {
      return getBudgetAdvice(finances, formData, lang)
    }
    if (finances.hasDebt) {
      return getDebtAdvice(finances, formData, lang)
    }
  }

  if (stage === 'GOALS_REVIEW' || topic === 'goals') {
    return getGoalsAdvice(goals, formData, lang)
  }

  if (stage === 'TOPIC_ADVICE') {
    memory.recordAdvice(topic, userMessage)
    switch (topic) {
      case 'stress': return getStressAdvice(lang)
      case 'resources': return getResourcesAdvice(lang)
      case 'housing': case 'food': case 'health': return getNeedsAdvice(needs, formData, lang)
      case 'education': case 'plan': {
        if (topic === 'plan' || completeness.percent >= 60) {
          const plan = generatePlan(formData, budgetData, lang)
          memory.stage = 'PLAN_REVIEW'
          return renderPlanInChat(plan, lang)
        }
        return lang === 'es'
          ? 'Para generar un plan completo, necesito más información. ¿Podemos llenar los datos faltantes primero?'
          : 'To generate a complete plan, I need more information. Can we fill in the missing data first?'
      }
      default: break
    }
  }

  if (stage === 'PLAN_BUILD' || (stage === 'TOPIC_ADVICE' && topic === 'plan')) {
    const plan = generatePlan(formData, budgetData, lang)
    memory.stage = 'PLAN_REVIEW'
    memory.updatePlanProgress('needs', 100)
    memory.updatePlanProgress('finances', 100)
    memory.updatePlanProgress('goals', goals.totalGoals > 0 ? 100 : 50)
    return renderPlanInChat(plan, lang)
  }

  if (stage === 'PLAN_REVIEW') {
    return getReviewAdvice(analysis, formData, budgetData, lang)
  }

  if (stage === 'KNOWLEDGE_IMPORT') {
    return lang === 'es'
      ? '📚 **Importar Conocimiento**\n\nPuedes arrastrar y soltar archivos aquí o pegar enlaces para que aprenda de ellos.\n\nFormatos aceptados: PDF, TXT, CSV, enlaces web.\n\n¿Qué te gustaría compartir conmigo?'
      : '📚 **Import Knowledge**\n\nYou can drag and drop files here or paste links for me to learn from them.\n\nAccepted formats: PDF, TXT, CSV, web links.\n\nWhat would you like to share with me?'
  }

  if (stage === 'FOLLOW_UP' || memory.interactionCount > 5) {
    return getFollowUpAdvice(analysis, formData, lang)
  }

  if (completeness.percent > 0 && completeness.percent < 100) {
    if (lang === 'es') {
      return `He analizado tu información hasta ahora (${completeness.percent}% completa).\n\n**Observaciones:**\n- Necesidades: ${needs.score}/100\n- Finanzas: ${finances.score}/100\n- Metas: ${goals.score}/100\n\n¿Qué área te gustaría trabajar primero?`
    }
    return `I've analyzed your information so far (${completeness.percent}% complete).\n\n**Observations:**\n- Needs: ${needs.score}/100\n- Finances: ${finances.score}/100\n- Goals: ${goals.score}/100\n\nWhich area would you like to work on first?`
  }

  return WELCOME_MESSAGES[lang || 'es'].returning
}

function _ensureActionRef(responseText, actionId, lang) {
  return responseText
}

// ═══════════════════════════════════════════════════════════════
// REVIEW AND FOLLOW-UP
// ═══════════════════════════════════════════════════════════════

function getReviewAdvice(analysis, formData, budgetData, lang) {
  const completeness = analysis.completeness
  const needs = analysis.needsAnalysis
  const finances = analysis.financialAnalysis
  const goals = analysis.goalsAnalysis

  const lines = [lang === 'es'
    ? `**Revisión de progreso**`
    : `**Progress review**`
  ]
  lines.push('')
  lines.push(lang === 'es'
    ? `**Completitud del formulario:** ${completeness.percent}%`
    : `**Form completeness:** ${completeness.percent}%`
  )
  lines.push(lang === 'es'
    ? `**Necesidades:** ${needs.score}/100 — ${needs.critical.length > 0 ? `${needs.critical.length} crítica(s)` : 'Estable'}${needs.warnings.length > 0 ? `, ${needs.warnings.length} pendiente(s)` : ''}`
    : `**Needs:** ${needs.score}/100 — ${needs.critical.length > 0 ? `${needs.critical.length} critical` : 'Stable'}${needs.warnings.length > 0 ? `, ${needs.warnings.length} pending` : ''}`
  )
  lines.push(lang === 'es'
    ? `**Finanzas:** ${finances.score}/100 — ${finances.isDeficit ? 'Déficit mensual' : 'Equilibrado'}${finances.hasDebt ? `, ${finances.debts.length} deuda(s)` : ''}`
    : `**Finances:** ${finances.score}/100 — ${finances.isDeficit ? 'Monthly deficit' : 'Balanced'}${finances.hasDebt ? `, ${finances.debts.length} debt(s)` : ''}`
  )
  lines.push(lang === 'es'
    ? `**Metas:** ${goals.score}/100 — ${goals.totalGoals} meta(s) definidas`
    : `**Goals:** ${goals.score}/100 — ${goals.totalGoals} goal(s) defined`
  )
  lines.push('')

  const suggestions = []
  if (finances.needsEmergencyFund) suggestions.push(lang === 'es' ? 'Construir fondo de emergencia (3-6 meses de gastos)' : 'Build emergency fund (3-6 months of expenses)')
  if (finances.isDeficit) suggestions.push(lang === 'es' ? 'Eliminar déficit — reducir gastos o aumentar ingresos' : 'Eliminate deficit — reduce expenses or increase income')
  if (goals.score < 50) suggestions.push(lang === 'es' ? 'Agregar pasos y fechas a las metas' : 'Add steps and deadlines to goals')
  if (completeness.missing.includes('commitmentStatement')) suggestions.push(lang === 'es' ? 'Completar declaración de compromiso' : 'Complete commitment statement')

  if (suggestions.length > 0) {
    lines.push(lang === 'es' ? '**Intervenciones requeridas:**' : '**Required interventions:**')
    for (const s of suggestions) lines.push(`- ${s}`)
    lines.push('')
  }

  lines.push(lang === 'es'
    ? '¿Requieres generación de plan mejorado o intervención en algún aspecto específico?'
    : 'Do you require improved plan generation or intervention in a specific aspect?'
  )

  return lines.join('\n')
}

function getFollowUpAdvice(analysis, formData, lang) {
  const completeness = analyzeCompleteness(formData)
  const needs = analysis.needsAnalysis

  if (completeness.percent < 30) {
    return nephiFrame(lang === 'es'
      ? `**Estado:** Formulario incompleto (${completeness.percent}%)\n**Acción requerida:** Completar secciones restantes del formulario de autosuficiencia.\n**Prioridad:** Alta — sin datos completos no es posible generar un plan preciso.\n\n¿Deseas que guíe la recolección de datos paso a paso?`
      : `**Status:** Incomplete form (${completeness.percent}%)\n**Required action:** Complete remaining self-sufficiency form sections.\n**Priority:** High — without complete data, a precise plan cannot be generated.\n\nShall I guide data collection step by step?`,
      lang)
  }
  if (needs.critical.length > 0) {
    return nephiFrame(lang === 'es'
      ? `**Estado:** ${needs.critical.length} área(s) crítica(s) detectadas\n**Acción requerida:** Abordar necesidades críticas antes de planificación avanzada.\n**Prioridad:** Inmediata.\n\n¿Has podido avanzar en alguna de estas áreas desde nuestra última intervención?`
      : `**Status:** ${needs.critical.length} critical area(s) detected\n**Required action:** Address critical needs before advanced planning.\n**Priority:** Immediate.\n\nHave you made progress on any of these areas since our last intervention?`,
      lang)
  }
  const goals = analysis.goalsAnalysis
  if (goals.totalGoals > 0 && goals.score < 50) {
    return nephiFrame(lang === 'es'
      ? `**Estado:** ${goals.totalGoals} meta(s) definidas, puntaje SMART ${goals.score}/100\n**Acción requerida:** Agregar pasos específicos y fechas límite a las metas existentes.\n**Prioridad:** Media.\n\n¿Requieres asistencia para detallar alguna meta en particular?`
      : `**Status:** ${goals.totalGoals} goal(s) defined, SMART score ${goals.score}/100\n**Required action:** Add specific steps and deadlines to existing goals.\n**Priority:** Medium.\n\nDo you require assistance detailing a specific goal?`,
      lang)
  }
  return nephiFrame(lang === 'es'
    ? `**Estado:** Progreso estable\n**Acción:** No se detectan intervenciones urgentes.\n**Recomendación:** Continuar con el plan actual y programar revisión en 30 días.\n\n¿Hay algún aspecto específico que requiera análisis adicional?`
    : `**Status:** Stable progress\n**Action:** No urgent interventions detected.\n**Recommendation:** Continue with current plan and schedule review in 30 days.\n\nIs there any specific aspect requiring additional analysis?`,
    lang)
}

// Emotional support response when user is struggling
function buildEmotionalSupportResponse(emotionalContext, userMessage, lang) {
  if (emotionalContext.intensity > 8) {
    return lang === 'es'
      ? `❤️ **Veo que estás pasando por un momento muy difícil.**\n\nTu bienestar es lo más importante. No necesitas preocuparte por planes o números ahora.\n\n**Respira profundo.** Tómate el tiempo que necesites. Cuando estés listo, puedo ayudarte a pensar en lo que sigue, paso a paso.\n\n¿Hay algo concreto en lo que pueda apoyarte ahora mismo?`
      : `❤️ **I can see you're going through a very difficult time right now.**\n\nYour wellbeing is what matters most. You don't need to worry about plans or numbers right now.\n\n**Take a deep breath.** Take all the time you need. When you're ready, I can help you think about what's next, step by step.\n\nIs there something specific I can help you with right now?`
  }

  return lang === 'es'
    ? `❤️ **Siento que algo te está pesando.** Y está bien.\n\nA veces lo mejor es dar un paso atrás. ¿Qué es lo más importante para ti en este momento?\n\nPodemos hablar de lo que necesites: tus finanzas, tus metas, o simplemente desahogarte. Tú eliges.`
    : `❤️ **I sense something is weighing on you.** And that's okay.\n\nSometimes the best thing is to take a step back. What's most important to you right now?\n\nWe can talk about whatever you need: your finances, your goals, or just vent. You choose.`
}

// ═══════════════════════════════════════════════════════════════
// PLAN RENDERING (template-driven)
// ═══════════════════════════════════════════════════════════════

export function renderPlanInChat(plan, lang) {
  const t = (es, en) => lang === 'es' ? es : en
  const scoreColor = s => s >= 70 ? '✅' : s >= 40 ? '⚠️' : '🔴'

  // Inline renderer — no external 'kb' reference needed (safe for all contexts)
  const lines = [
    `╔═══════════════════════════════════════════════════╗`,
    `║      ${t('PLAN DE AUTOSUFICIENCIA', 'SELF-SUFFICIENCY PLAN').padEnd(42)}║`,
    `╚═══════════════════════════════════════════════════╝`,
    '',
    `${scoreColor(plan.overallScore)} **${t('Puntaje General', 'Overall Score')}: ${plan.overallScore}/100**`,
    `   ${t('Necesidades', 'Needs')}: ${plan.scores.needs}/100  |  ${t('Finanzas', 'Finances')}: ${plan.scores.finances}/100  |  ${t('Metas', 'Goals')}: ${plan.scores.goals}/100`,
    '',
    `1️⃣ ${t('Evaluación de Necesidades', 'Needs Assessment')}`,
    ...plan.needsAssessment.map(n => `   ${n.emoji} ${n.area}: ${n.score}/5 — ${n.status}`),
    '',
    `2️⃣ ${t('Salud Financiera', 'Financial Health')}`,
    `   ${t('Ingresos', 'Income')}: ${plan.financeDetails.income}  |  ${t('Gastos', 'Expenses')}: ${plan.financeDetails.expenses}`,
    `   ${t('Balance', 'Balance')}: ${plan.financeDetails.balance}  |  ${t('Deuda total', 'Total debt')}: ${plan.financeDetails.totalDebt}`,
    ...(plan.financeDetails.emergencyFundMonths !== undefined ? [`   ${t('Fondo emergencia', 'Emergency fund')}: ${plan.financeDetails.emergencyFundMonths} ${t('mese(s)', 'month(s)')}`] : []),
    '',
    `3️⃣ ${t('Metas SMART', 'SMART Goals')}`,
    ...plan.goals.map(g => `   ${g.emoji} **${g.timeframe}:** ${g.goal}`),
    '',
    `4️⃣ ${t('Plan de Acción', 'Action Plan')} — ${t('Prioridades', 'Priorities')}`,
    ...plan.actionItems.map((a, i) => `   ${i + 1}. ${a.emoji} **${a.action}** — ${a.detail}`),
    '',
    `5️⃣ ${t('Análisis de Riesgos', 'Risk Analysis')}`,
    ...plan.risks.map(r => `   ${r.emoji} ${r.risk}`),
    '',
    `📅 ${t('Próxima revisión recomendada', 'Next review recommended')}: ${plan.nextReviewDate}`,
    '',
    t('¿Quieres que detalle alguna sección o ajuste algo?', 'Would you like me to detail any section or adjust something?'),
  ]
  return lines.join('\n')
}

function buildEmotionalResponse(routing, userMessage, lang) {
  const strategy = routing.responseStrategy
  if (!strategy) return null

  const template = strategy.templates
    ? (strategy.templates[lang] || strategy.templates.en)
    : null
  if (!template || template.length === 0) return null

  const selected = template[Math.floor(Math.random() * template.length)]

  const prefix = ''

  return prefix + selected
}

function _handleDevRequest(userMessage, lang) {
  const registry = buildModuleRegistry()
  const packageJson = buildPackageJson()
  const result = routeDevRequest(userMessage, registry, packageJson)
  const t = (es, en) => lang === 'es' ? es : en

  const header = `**Nephi — ${t('Análisis', 'Analysis')}**\n`

  switch (result.type) {
    case 'inspect': {
      if (result.error) {
        return `${header}\n${t('Error', 'Error')}: ${result.error}\n\n${t('Módulos disponibles', 'Available modules')}: ${result.registry.join(', ')}`
      }
      if (result.target) {
        return `${header}\n**${t('Módulo', 'Module')}:** ${result.target}\n${t('Exportaciones', 'Exports')}: ${(result.exports || []).join(', ') || t('Ninguna', 'None')}\n${t('Importaciones', 'Imports')}: ${(result.imports || []).join(', ') || t('Ninguna', 'None')}\n${t('Tamaño', 'Size')}: ${result.size} ${t('líneas', 'lines')}\n${t('Dependencias', 'Dependencies')}: ${(result.dependencies || []).join(', ') || t('Ninguna', 'None')}`
      }
      return `${header}\n${t('Registro de módulos', 'Module registry')}: ${result.count} ${t('módulos', 'modules')}\n${Object.keys(registry).join(', ')}`
    }

    case 'dependency': {
      const lines = [header]
      if (result.scan) {
        lines.push(`\n**${t('Escaneo de dependencias', 'Dependency scan')}**`)
        lines.push(`${t('Instaladas', 'Installed')}: ${result.scan.installedDependencies.length}`)
        lines.push(`${t('Faltantes', 'Missing')}: ${result.scan.missingDependencies.length}`)
      }
      if (result.advice && result.advice.recommendations) {
        lines.push(`\n**${t('Recomendaciones', 'Recommendations')}:**`)
        for (const r of result.advice.recommendations) {
          lines.push(`  \`${r.installCmd}\` ${r.viteCompatible ? '✅' : '⚠️'}`)
        }
      }
      if (result.viteIssues && result.viteIssues.warnings) {
        lines.push(`\n**${t('Advertencias Vite', 'Vite warnings')}:**`)
        for (const w of result.viteIssues.warnings) {
          lines.push(`  ⚠️ ${w.detail}`)
        }
      }
      return lines.join('\n')
    }

    case 'patch': {
      if (result.error) {
        return `${header}\n**${t('Error de validación', 'Validation error')}:** ${result.error}`
      }
      return `${header}\n✅ ${t('Parche aprobado — listo para ejecución', 'Patch approved — ready for execution')}\n${t('Ejecutar', 'Run')}: \`npm install\` ${t('si hay dependencias pendientes', 'if dependencies are pending')}`
    }

    case 'validate': {
      if (!result.validation) return `${header}\n${t('Sin resultados de validación', 'No validation results')}`
      return `${header}\n✅ ${t('Seguro', 'Safe')}: ${result.validation.safe}\n${t('Errores', 'Errors')}: ${(result.validation.errors || []).join('; ') || t('Ninguno', 'None')}\n${t('Advertencias', 'Warnings')}: ${(result.validation.warnings || []).join('; ') || t('Ninguna', 'None')}`
    }

    case 'explain': {
      if (result.error) return `${header}\n${t('Error', 'Error')}: ${result.error}`
      return `${header}\n${result.details || result.message}`
    }

    default:
      return `${header}\n${t('No se pudo determinar el tipo de solicitud de desarrollo.', 'Could not determine development request type.')}\n${t('Tipos soportados', 'Supported types')}: inspect, patch, dependency, validate, explain`
  }
}
