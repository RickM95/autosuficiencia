import { generateIncomeResponse as incomeResponse } from './incomeEngine.js'

const PLAN_STAGES = {
  ORIENTATION: 'orientation',
  STABILIZE: 'stabilize',
  EXPLORE_INCOME: 'explore_income',
  EXPLORE_NEEDS: 'explore_needs',
  EXPLORE_GOALS: 'explore_goals',
  IDENTITY_GAPS: 'identity_gaps',
  SUGGEST_ACTION: 'suggest_action',
  INCOME_OPTIONS: 'income_options',
  BUILD_STRUCTURE: 'build_structure',
  REVIEW: 'review',
  COMPLETE: 'complete',
}

function assessUserState(memory) {
  const inputs = memory.userInputs || []
  const allText = inputs.map(u => u.content).join(' ').toLowerCase()
  const sentiment = memory.sentiment || 'neutral'

  const hasIncomeData = /\b(gano|i earn|salary|salario|income|ingreso|trabajo|work|empleo|job)\b/i.test(allText)
  const hasExpenseData = /\b(gasto|spend|expense|gasto|pago|pay|alquiler|rent)\b/i.test(allText)
  const hasDebtData = /\b(debt|deuda|debo|owe|préstamo|loan|credit|crédito)\b/i.test(allText)
  const hasGoalData = /\b(goal|meta|future|futuro|dream|sueño|quiero|want|necesito|need)\b/i.test(allText)
  const hasNeedData = /\b(hambre|hungry|housing|vivienda|food|comida|health|salud|medical|médico)\b/i.test(allText)

  const isOverwhelmed = sentiment === 'overwhelmed' || /\b(overwhelm|abrumado|no sé|don't know|lost|perdido)\b/i.test(allText)
  const isStressed = sentiment !== 'positive' && /\b(stress|estres|ansiedad|anxiety|worried|preocupado)\b/i.test(allText)
  const hasCrisis = /\b(crisis|emergencia|emergency|desesperado|desperate|urgente|urgent)\b/i.test(allText)

  const knowledgeLevel = [
    hasIncomeData, hasExpenseData, hasDebtData,
    hasGoalData, hasNeedData,
  ].filter(Boolean).length

  return {
    hasIncomeData,
    hasExpenseData,
    hasDebtData,
    hasGoalData,
    hasNeedData,
    isOverwhelmed,
    isStressed,
    hasCrisis,
    knowledgeLevel,
    totalInputs: inputs.length,
    allText,
  }
}

function generateAdaptivePlan(memory, context = {}) {
  const state = assessUserState(memory)
  const currentPlan = memory.currentPlan || { stage: PLAN_STAGES.ORIENTATION, step: 0, completed: [] }
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en

  if (state.hasCrisis || state.isOverwhelmed) {
    currentPlan.stage = PLAN_STAGES.STABILIZE
  } else if (!state.hasIncomeData && !state.hasNeedData && state.totalInputs < 3) {
    currentPlan.stage = PLAN_STAGES.ORIENTATION
  } else if (state.hasIncomeData && state.hasExpenseData && state.knowledgeLevel >= 3) {
    currentPlan.stage = PLAN_STAGES.BUILD_STRUCTURE
  } else if (state.hasIncomeData || state.hasNeedData) {
    currentPlan.stage = PLAN_STAGES.EXPLORE_NEEDS
    if (state.hasIncomeData && !state.hasExpenseData) currentPlan.stage = PLAN_STAGES.EXPLORE_NEEDS
    if (state.hasNeedData && !state.hasGoalData) currentPlan.stage = PLAN_STAGES.IDENTITY_GAPS
    if (state.hasIncomeData && state.hasGoalData) currentPlan.stage = PLAN_STAGES.SUGGEST_ACTION
  }

  const plan = buildStagePlan(currentPlan, state, memory, context)

  memory.currentPlan = {
    stage: plan.currentStage,
    step: currentPlan.step + (plan.advance ? 1 : 0),
    completed: [
      ...currentPlan.completed.filter(s => s !== plan.currentStage),
      ...(plan.advance ? [currentPlan.stage] : []),
    ],
  }

  return plan
}

function assessUserContext(memory, context) {
  const allText = (memory.userInputs || []).map(u => u.content).join(' ').toLowerCase()
  const mentionsIncome = /\b(income|ingreso|trabajo|work|job|empleo|earn|ganar|money|dinero|plata|necesito dinero|i need money|no tengo trabajo|unemployed|desempleado|ocupación|occupation)\b/i.test(allText)
  return { mentionsIncome }
}

function buildIncomeOptionsPlan(state, memory, context, lang, t) {
  try {
    const incomeResult = incomeResponse(memory, context)
    return {
      currentStage: PLAN_STAGES.INCOME_OPTIONS,
      nextAction: incomeResult.text,
      reasoning: t(
        'Usuario necesita opciones de ingreso. Generando estrategias adaptadas a su contexto.',
        'User needs income options. Generating strategies adapted to their context.'
      ),
      alternatives: [
        t('Explícame el primero con más detalle', 'Explain the first one in more detail'),
        t('Muéstrame opciones sin inversión', 'Show me zero-capital options'),
        t('Quiero algo para hoy mismo', 'I want something for today'),
      ],
      confidence: 0.8,
      advance: false,
    }
  } catch {
    return {
      currentStage: PLAN_STAGES.INCOME_OPTIONS,
      nextAction: t(
        `Entiendo que necesitas generar ingresos. Lo primero es identificar qué puedes hacer HOY.\n\n¿Tienes alguna habilidad, herramienta o medio de transporte? Incluso sin nada, hay opciones.\n\nPor ejemplo: ayudar en mercados, limpieza, o mandados.`,
        `I understand you need to generate income. First let's identify what you can do TODAY.\n\nDo you have any skills, tools, or transportation? Even with nothing, there are options.\n\nFor example: helping at markets, cleaning, or running errands.`
      ),
      reasoning: t(
        'Necesita ingresos. Ofreciendo opciones de cero capital inicial.',
        'Needs income. Offering zero-capital options.'
      ),
      alternatives: [
        t('No tengo nada', 'I have nothing'),
        t('Tengo bicicleta', 'I have a bike'),
        t('Tengo teléfono', 'I have a phone'),
      ],
      confidence: 0.75,
      advance: false,
    }
  }
}

function buildStagePlan(currentPlan, state, memory, context) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en

  switch (currentPlan.stage) {
    case PLAN_STAGES.STABILIZE:
      return buildStabilizePlan(state, memory, lang, t)
    case PLAN_STAGES.ORIENTATION:
      return buildOrientationPlan(state, memory, lang, t)
    case PLAN_STAGES.EXPLORE_INCOME:
      return buildExploreIncomePlan(state, memory, lang, t)
    case PLAN_STAGES.EXPLORE_NEEDS:
      return buildExploreNeedsPlan(state, memory, lang, t)
    case PLAN_STAGES.EXPLORE_GOALS:
      return buildExploreGoalsPlan(state, memory, lang, t)
    case PLAN_STAGES.IDENTITY_GAPS:
      return buildIdentifyGapsPlan(state, memory, lang, t)
    case PLAN_STAGES.SUGGEST_ACTION:
      return buildSuggestActionPlan(state, memory, lang, t)
    case PLAN_STAGES.INCOME_OPTIONS:
      return buildIncomeOptionsPlan(state, memory, context, lang, t)
    case PLAN_STAGES.BUILD_STRUCTURE:
      return buildStructurePlan(state, memory, lang, t)
    case PLAN_STAGES.REVIEW:
      return buildReviewPlan(state, memory, lang, t)
    default:
      return buildOrientationPlan(state, memory, lang, t)
  }
}

function buildStabilizePlan(state, memory, lang, t) {
  const nextAction = t(
    `Respira. No tienes que resolver todo hoy.\n\nVamos a enfocarnos en una sola cosa: ¿qué es lo más urgente para ti en este momento?`,
    `Breathe. You don't have to solve everything today.\n\nLet's focus on one thing: what's most urgent for you right now?`
  )

  return {
    currentStage: PLAN_STAGES.STABILIZE,
    nextAction,
    reasoning: t(
      'Usuario en estado de crisis o abrumado. Prioridad: estabilizar y reducir a una preocupación manejable.',
      'User in crisis or overwhelmed state. Priority: stabilize and reduce to one manageable concern.'
    ),
    alternatives: [
      t('Hablar con alguien de confianza', 'Talk to someone you trust'),
      t('Escribir lo que sientes', 'Write down what you feel'),
      t('Identificar una necesidad física inmediata (comida, descanso)', 'Identify one immediate physical need (food, rest)'),
    ],
    confidence: 0.85,
    advance: false,
  }
}

function buildOrientationPlan(state, memory, lang, t) {
  const nextAction = t(
    `Empecemos por el principio.\n\nCuéntame un poco sobre ti—¿cómo es tu situación actual? No necesitas dar detalles, solo una idea general.`,
    `Let's start at the beginning.\n\nTell me a bit about yourself—what's your current situation like? You don't need to give details, just a general idea.`
  )

  return {
    currentStage: PLAN_STAGES.ORIENTATION,
    nextAction,
    reasoning: t(
      'Poco conocimiento del usuario. Necesitamos entender su situación general antes de planificar.',
      'Little known about user. Need to understand their general situation before planning.'
    ),
    alternatives: [
      t('Hablar sobre trabajo o ingresos', 'Talk about work or income'),
      t('Hablar sobre necesidades básicas', 'Talk about basic needs'),
      t('Hablar sobre metas o sueños', 'Talk about goals or dreams'),
    ],
    confidence: 0.7,
    advance: state.totalInputs >= 2,
  }
}

function buildExploreIncomePlan(state, memory, lang, t) {
  const hasAnyIncome = state.hasIncomeData
  if (!hasAnyIncome) {
    return {
      currentStage: PLAN_STAGES.EXPLORE_INCOME,
      nextAction: t(
        `Háblame de tu situación laboral—¿trabajas actualmente o tienes alguna fuente de ingresos?`,
        `Tell me about your work situation—are you currently working or do you have any source of income?`
      ),
      reasoning: t(
        'Necesitamos entender los ingresos del usuario para poder planificar.',
        'Need to understand user income to plan effectively.'
      ),
      alternatives: [
        t('Trabajo tiempo completo', 'I work full time'),
        t('Trabajo por mi cuenta', 'I am self-employed'),
        t('No tengo ingresos actualmente', 'I have no income currently'),
      ],
      confidence: 0.75,
      advance: false,
    }
  }

  return {
    currentStage: PLAN_STAGES.EXPLORE_NEEDS,
    nextAction: t(
      `Entiendo que tienes ingresos. Ahora cuéntame—¿cómo son tus gastos mensuales? Aproximadamente.`,
      `I see you have income. Now tell me—what are your monthly expenses like? Approximately.`
    ),
    reasoning: t(
      'Usuario tiene ingresos. Siguiente paso: entender gastos para identificar déficit o superávit.',
      'User has income. Next step: understand expenses to identify deficit or surplus.'
    ),
    alternatives: [
      t('Gasto la mayor parte de mis ingresos', 'I spend most of my income'),
      t('Vivo cómodamente con lo que gano', 'I live comfortably with what I earn'),
      t('No tengo claro cuánto gasto', "I'm not sure how much I spend"),
    ],
    confidence: 0.7,
    advance: true,
  }
}

function buildExploreNeedsPlan(state, memory, lang, t) {
  if (state.isStressed) {
    return {
      currentStage: PLAN_STAGES.EXPLORE_NEEDS,
      nextAction: t(
        `Parece que hay estrés en tu situación. Antes de seguir con números—¿qué área de tu vida sientes que necesita más atención ahora mismo?`,
        `It seems there's stress in your situation. Before continuing with numbers—what area of your life needs the most attention right now?`
      ),
      reasoning: t(
        'Usuario muestra signos de estrés. Explorar necesidades inmediatas antes de finanzas.',
        'User shows signs of stress. Explore immediate needs before finances.'
      ),
      alternatives: [
        t('Mi salud física o mental', 'My physical or mental health'),
        t('Mi situación de vivienda', 'My housing situation'),
        t('Mis finanzas', 'My finances'),
      ],
      confidence: 0.75,
      advance: false,
    }
  }

  if (!state.hasGoalData) {
    return {
      currentStage: PLAN_STAGES.EXPLORE_GOALS,
      nextAction: t(
        `Ahora cuéntame—¿qué te gustaría lograr? No tiene que ser algo enorme. Puede ser algo pequeño como ahorrar un poco más cada mes o encontrar un trabajo más estable.`,
        `Now tell me—what would you like to achieve? It doesn't have to be huge. It could be something small like saving a bit more each month or finding more stable work.`
      ),
      reasoning: t(
        'Explorando metas del usuario para orientar el plan.',
        'Exploring user goals to guide the plan.'
      ),
      alternatives: [
        t('Quiero mejorar mis finanzas', 'I want to improve my finances'),
        t('Quiero encontrar trabajo', 'I want to find a job'),
        t('Quiero aprender una habilidad nueva', 'I want to learn a new skill'),
      ],
      confidence: 0.7,
      advance: false,
    }
  }

  return {
    currentStage: PLAN_STAGES.IDENTITY_GAPS,
    nextAction: t(
      `Tienes metas claras—eso es excelente. Ahora identifiquemos qué te falta para alcanzarlas. ¿Cuál es el obstáculo más grande que ves?`,
      `You have clear goals—that's excellent. Now let's identify what's missing to achieve them. What's the biggest obstacle you see?`
    ),
    reasoning: t(
      'Usuario tiene metas. Identificar brechas entre situación actual y metas.',
      'User has goals. Identify gaps between current situation and goals.'
    ),
    alternatives: [
      t('Falta de dinero', 'Lack of money'),
      t('Falta de conocimiento o habilidades', 'Lack of knowledge or skills'),
      t('No sé por dónde empezar', "I don't know where to start"),
    ],
    confidence: 0.8,
    advance: true,
  }
}

function buildExploreGoalsPlan(state, memory, lang, t) {
  return {
    currentStage: PLAN_STAGES.EXPLORE_GOALS,
    nextAction: t(
      `Háblame de tus metas—¿qué te gustaría lograr en los próximos meses? No pienses en lo que "deberías" querer, piensa en lo que realmente deseas.`,
      `Tell me about your goals—what would you like to achieve in the coming months? Don't think about what you "should" want, think about what you truly want.`
    ),
    reasoning: t(
      'Explorando aspiraciones del usuario para alinear el plan con sus motivaciones.',
      'Exploring user aspirations to align the plan with their motivations.'
    ),
    alternatives: [
      t('Estabilidad financiera', 'Financial stability'),
      t('Mejorar mi calidad de vida', 'Improve my quality of life'),
      t('Emprender un negocio', 'Start a business'),
    ],
    confidence: 0.7,
    advance: false,
  }
}

function buildIdentifyGapsPlan(state, memory, lang, t) {
  let nextAction
  if (!state.hasDebtData && !state.hasExpenseData) {
    nextAction = t(
      `Para entender mejor tu situación—¿tienes deudas actualmente? No importa el monto, es bueno saberlo para planificar.`,
      `To better understand your situation—do you currently have any debt? The amount doesn't matter, it's good to know for planning.`
    )
  } else if (state.hasDebtData && !state.hasExpenseData) {
    nextAction = t(
      `Entiendo que tienes deudas. ¿Y cómo son tus gastos mensuales? Aproximadamente—no necesitas los números exactos.`,
      `I see you have debts. And what are your monthly expenses like? Approximately—you don't need exact numbers.`
    )
  } else {
    nextAction = t(
      `Ya tengo una idea más clara de tu situación. El siguiente paso es identificar qué acción concreta puedes tomar esta semana para acercarte a tu meta.`,
      `I have a clearer picture of your situation. The next step is to identify one concrete action you can take this week to move toward your goal.`
    )
  }

  return {
    currentStage: PLAN_STAGES.IDENTITY_GAPS,
    nextAction,
    reasoning: t(
      'Identificando brechas de información para completar el panorama financiero del usuario.',
      'Identifying information gaps to complete the user financial picture.'
    ),
    alternatives: [
      t('Sí, tengo deudas', 'Yes, I have debts'),
      t('No tengo deudas', "I don't have debts"),
      t('Mis gastos son altos', 'My expenses are high'),
    ],
    confidence: 0.75,
    advance: state.hasDebtData && state.hasExpenseData,
  }
}

function buildSuggestActionPlan(state, memory, lang, t) {
  const hasFinancialStress = state.isStressed && state.hasDebtData

  let nextAction
  if (hasFinancialStress) {
    nextAction = t(
      `Aquí está mi sugerencia—basado en lo que me has contado:\n\n` +
      `1. **Prioridad inmediata**: enfócate en tu deuda con el interés más alto.\n` +
      `2. **Esta semana**: revisa tus gastos y encuentra UN gasto que puedas reducir.\n` +
      `3. **Próximo mes**: establece un presupuesto simple.\n\n` +
      `¿Quieres que empecemos con el paso 1?`,
      `Here's my suggestion—based on what you've told me:\n\n` +
      `1. **Immediate priority**: focus on your highest-interest debt.\n` +
      `2. **This week**: review your expenses and find ONE expense you can reduce.\n` +
      `3. **Next month**: set up a simple budget.\n\n` +
      `Want to start with step 1?`
    )
  } else {
    nextAction = t(
      `Basado en lo que me has compartido, esto es lo que sugiero:\n\n` +
      `**Acción para esta semana:**\n` +
      `Identifica una pequeña acción que puedas tomar. Algo específico, medible.\n\n` +
      `Por ejemplo: "Ahorrar L 200 esta semana" o "Actualizar mi currículum".\n\n` +
      `¿Qué te parece?`,
      `Based on what you've shared, here's what I suggest:\n\n` +
      `**Action for this week:**\n` +
      `Identify one small action you can take. Something specific, measurable.\n\n` +
      `For example: "Save $10 this week" or "Update my resume".\n\n` +
      `What do you think?`
    )
  }

  return {
    currentStage: PLAN_STAGES.SUGGEST_ACTION,
    nextAction,
    reasoning: t(
      'Suficiente información recopilada. Sugiriendo acciones concretas basadas en el perfil del usuario.',
      'Enough information gathered. Suggesting concrete actions based on user profile.'
    ),
    alternatives: [
      t('Empecemos con la deuda', "Let's start with the debt"),
      t('Ayúdame a hacer un presupuesto', 'Help me make a budget'),
      t('Prefiero enfocarme en ingresos', 'I prefer to focus on income'),
    ],
    confidence: 0.8,
    advance: false,
  }
}

function buildStructurePlan(state, memory, lang, t) {
  return {
    currentStage: PLAN_STAGES.BUILD_STRUCTURE,
    nextAction: t(
      `Tengo suficiente información para darte una estructura general.\n\n` +
      `**Tu panorama actual:**\n` +
      `- Ingresos: identificados\n` +
      `- Gastos: identificados\n` +
      `- Metas: claras\n\n` +
      `**Sugerencia:** creemos un plan en tres partes:\n` +
      `1. Estabilizar (reducir gastos, crear fondo mínimo)\n` +
      `2. Crecer (aumentar ingresos, desarrollar habilidades)\n` +
      `3. Prosperar (invertir en metas a largo plazo)\n\n` +
      `¿Por dónde te gustaría empezar?`,
      `I have enough information to give you a general structure.\n\n` +
      `**Your current picture:**\n` +
      `- Income: identified\n` +
      `- Expenses: identified\n` +
      `- Goals: clear\n\n` +
      `**Suggestion:** let's create a three-part plan:\n` +
      `1. Stabilize (reduce expenses, create minimum fund)\n` +
      `2. Grow (increase income, develop skills)\n` +
      `3. Thrive (invest in long-term goals)\n\n` +
      `Where would you like to start?`
    ),
    reasoning: t(
      'Perfil de usuario suficientemente completo. Ofreciendo estructura de plan con opciones.',
      'User profile sufficiently complete. Offering plan structure with options.'
    ),
    alternatives: [
      t('Quiero estabilizar primero', 'I want to stabilize first'),
      t('Quiero crecer / aumentar ingresos', 'I want to grow / increase income'),
      t('Meta a largo plazo', 'Long-term goals'),
    ],
    confidence: 0.85,
    advance: false,
  }
}

function buildReviewPlan(state, memory, lang, t) {
  const completed = memory.currentPlan?.completed || []
  const progress = completed.length > 0
    ? `${completed.length} ${t('etapa(s) completada(s)', 'stage(s) completed')}`
    : t('apenas comenzando', 'just starting')

  return {
    currentStage: PLAN_STAGES.REVIEW,
    nextAction: t(
      `Hasta ahora has avanzado: ${progress}.\n\n` +
      `¿Quieres revisar lo que hemos hablado, ajustar algo, o seguir adelante?`,
      `So far you've progressed: ${progress}.\n\n` +
      `Would you like to review what we've discussed, adjust something, or move forward?`
    ),
    reasoning: t(
      'Revisión de progreso del plan. El usuario decide si continuar o ajustar.',
      'Plan progress review. User decides whether to continue or adjust.'
    ),
    alternatives: [
      t('Seguir adelante', 'Move forward'),
      t('Revisar lo que hemos hablado', 'Review what we discussed'),
      t('Ajustar mis metas', 'Adjust my goals'),
    ],
    confidence: 0.9,
    advance: false,
  }
}

export function getPlannerResponse(memory, context = {}) {
  const plan = generateAdaptivePlan(memory, context)
  return {
    insights: `Planner stage: ${plan.currentStage}`,
    suggestedAction: plan.nextAction,
    priority: plan.confidence || 0.6,
    plan,
  }
}

export { generateAdaptivePlan, PLAN_STAGES }
