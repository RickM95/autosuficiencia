import { detectIntent } from './intentDetector.js'
import { isRepeatingResponse } from './loopGuard.js'
import { getPlannerResponse } from './autonomousPlanner.js'
import { generateDecisionResponse, advanceExecution, getExecutionStep } from './decisionEngine.js'
import { fuseDomains, generateDeepResponse, isShallowResponse } from './domainFusionEngine.js'

const ACTIONS = {
  EXPLAIN: 'explain',
  CLARIFY: 'clarify',
  EXPLORE: 'explore',
  GUIDE: 'guide',
  SUGGEST: 'suggest',
  REFLECT: 'reflect',
  ASK_FOLLOW_UP: 'ask_follow_up',
  VALIDATE: 'validate',
  ACKNOWLEDGE: 'acknowledge',
  PRESENCE: 'presence',
  SUPPORT: 'support',
  PLAN: 'plan',
  EXECUTE: 'execute',
}

const STRATEGY_PRIORITIES = {
  [ACTIONS.SUPPORT]: 1,
  [ACTIONS.VALIDATE]: 2,
  [ACTIONS.REFLECT]: 3,
  [ACTIONS.EXPLORE]: 4,
  [ACTIONS.CLARIFY]: 5,
  [ACTIONS.ACKNOWLEDGE]: 6,
  [ACTIONS.EXPLAIN]: 7,
  [ACTIONS.GUIDE]: 8,
  [ACTIONS.PLAN]: 8,
  [ACTIONS.EXECUTE]: 8,
  [ACTIONS.SUGGEST]: 9,
  [ACTIONS.ASK_FOLLOW_UP]: 10,
  [ACTIONS.PRESENCE]: 11,
}

function getRecentTopics(memory) {
  const recorded = memory.recordedTopics || []
  const discussed = memory.discussedTopics
  if (discussed && discussed.size > 0) {
    return Array.from(discussed).slice(-3)
  }
  return recorded.slice(-3)
}

function isFirstInteraction(memory) {
  return (memory.interactionCount || 0) <= 1
}

function hasActiveEmotionalMode(memory) {
  const mode = memory.currentMode
  return mode && (mode.type === 'EMOTIONAL_SUPPORT' || mode.type === 'REFLECTION')
}

export function decideNextAction(intent, memory, context = {}) {
  const detected = detectIntent(intent)
  const fusion = fuseDomains(intent, memory)
  const recentTopics = getRecentTopics(memory)
  const firstInteraction = isFirstInteraction(memory)
  const inEmotionalMode = hasActiveEmotionalMode(memory)
  const previousAction = memory.lastAction
  const turnCount = memory.interactionCount || 0

  const isShortContinuation = detected.isContinuation || (intent && intent.trim().split(/\s+/).length < 3)

  // Priority check: if execution is in progress, route to EXECUTE
  const lastDecision = memory.lastDecision
  if (lastDecision && (lastDecision.status === 'proposed' || lastDecision.status === 'in_progress' || lastDecision.status === 'fallback')) {
    const agreement = detected.intent === 'agreement' || detected.intent === 'gratitude'
    const progress = /\b(lo hice|done|listo|ready|completed|termin[eé]|hice|funcion[óo]|worked|funcionó|s[ií]|yes)\b/i.test(intent || '')
    const failure = /\b(no funcion[óo]|didn't work|no pude|couldn't|fall[óo]|failed|no sirvi[óo]|nadie|no one|no me|no quisieron|they didn|no hay)\b/i.test(intent || '')

    if (agreement || progress) {
      action = ACTIONS.EXECUTE
      reason = 'user progressing through execution'
    } else if (failure) {
      action = ACTIONS.EXECUTE
      reason = 'user reporting failure, triggering fallback'
    } else {
      action = ACTIONS.EXECUTE
      reason = 'execution in progress, continue guidance'
    }
    return buildExecuteDecision(action, reason, detected, lastDecision)
  }

  let action = ACTIONS.GUIDE
  let reason = 'default'

  if (inEmotionalMode) {
    if (detected.intent === 'emotional' || detected.intent === 'uncertainty') {
      action = ACTIONS.SUPPORT
      reason = 'in emotional mode, user expressing distress'
    } else if (isShortContinuation) {
      action = ACTIONS.VALIDATE
      reason = 'in emotional mode, short continuation input'
    } else {
      action = ACTIONS.ACKNOWLEDGE
      reason = 'in emotional mode, general continuation'
    }
  } else if (detected.intent === 'greeting' && firstInteraction) {
    action = ACTIONS.EXPLORE
    reason = 'first interaction, greeting detected'
  } else if (detected.intent === 'how_it_works') {
    action = ACTIONS.EXPLAIN
    reason = 'user asking how system works'
  } else if (detected.intent === 'what_to_do_first') {
    action = ACTIONS.GUIDE
    reason = 'user asking what to do first'
  } else if (detected.intent === 'agreement' || detected.intent === 'gratitude') {
    if (firstInteraction) {
      action = ACTIONS.EXPLORE
      reason = 'agreement on first interaction, explore situation'
    } else {
      const lastAction = memory.lastAction || ACTIONS.GUIDE
      if (lastAction === ACTIONS.ASK_FOLLOW_UP || lastAction === ACTIONS.EXPLORE) {
        action = ACTIONS.EXPLORE
        reason = 'agreement after question, continue exploring'
      } else {
        action = ACTIONS.ASK_FOLLOW_UP
        reason = 'agreement, move conversation forward'
      }
    }
  } else if (detected.intent === 'uncertainty') {
    if (turnCount > 3) {
      action = ACTIONS.PLAN
      reason = 'user still uncertain mid-conversation, switch to adaptive plan'
    } else {
      action = ACTIONS.EXPLORE
      reason = 'user uncertain, explore gently'
    }
  } else if (detected.intent === 'clarification') {
    action = ACTIONS.CLARIFY
    reason = 'user asking for clarification'
  } else if (detected.intent === 'emotional') {
    action = ACTIONS.SUPPORT
    reason = 'emotional content detected'
  } else if (detected.intent === 'financial') {
    action = ACTIONS.EXPLORE
    reason = 'financial topic, explore specifics'
  } else if (detected.intent === 'goals') {
    action = ACTIONS.PLAN
    reason = 'goals mentioned, generate adaptive plan'
  } else if (detected.intent === 'plan_request') {
    action = ACTIONS.PLAN
    reason = 'user requesting plan, generate adaptive plan'
  } else if (detected.intent === 'what_to_do_first') {
    action = ACTIONS.PLAN
    reason = 'user asking what to do, start adaptive plan'
  } else if (detected.intent === 'farewell') {
    action = ACTIONS.PRESENCE
    reason = 'user saying goodbye'
  } else if (detected.intent === 'topic_shift') {
    action = ACTIONS.EXPLORE
    reason = 'user shifting topic, explore new direction'
  } else if (isShortContinuation && turnCount > 1) {
    if (previousAction === ACTIONS.ASK_FOLLOW_UP || previousAction === ACTIONS.EXPLORE) {
      action = ACTIONS.ACKNOWLEDGE
      reason = 'short input after question, acknowledge and see'
    } else {
      action = ACTIONS.ASK_FOLLOW_UP
      reason = 'short input, ask gentle follow-up'
    }
  } else {
    action = ACTIONS.EXPLORE
    reason = 'general input, explore situation'
  }

  const conversationalStage = determineConversationalStage(detected, memory, context)

  return {
    action,
    reason,
    intent: detected,
    conversationalStage,
    strategyPriority: STRATEGY_PRIORITIES[action] || 99,
    isContinuation: isShortContinuation && turnCount > 1,
    shouldAnswerFirst: detected.intent === 'how_it_works' ||
      detected.intent === 'what_to_do_first' ||
      detected.intent === 'clarification' ||
      detected.intent === 'financial' ||
      detected.intent === 'plan_request' ||
      detected.intent === 'emotional',
    fusion,
  }
}

function buildExecuteDecision(action, reason, detected, lastDecision) {
  return {
    action,
    reason,
    intent: detected,
    conversationalStage: 'execution',
    strategyPriority: STRATEGY_PRIORITIES.EXECUTE || 8,
    isContinuation: true,
    shouldAnswerFirst: true,
    executionDecision: lastDecision,
    fusion: null,
  }
}

function determineConversationalStage(detected, memory, context) {
  if (detected.intent === 'emotional' || detected.intent === 'uncertainty') {
    return 'exploring_situation'
  }
  if (detected.intent === 'how_it_works') {
    return 'orientation'
  }
  if (detected.intent === 'what_to_do_first') {
    return 'initial_guidance'
  }
  if (detected.intent === 'plan_request') {
    return 'plan_discussion'
  }
  if (detected.intent === 'financial') {
    return 'financial_discussion'
  }
  if (detected.intent === 'goals') {
    return 'income_options'
  }

  const allText = (memory.userInputs || []).map(u => u.content).join(' ').toLowerCase()
  if (/\b(income|ingreso|trabajo|work|job|empleo|earn|ganar|money|dinero|plata|necesito dinero|i need money|no tengo trabajo|unemployed|desempleado)\b/i.test(allText)) {
    return 'income_options'
  }

  const count = memory.interactionCount || 0
  if (count <= 2) return 'getting_to_know'
  if (count <= 6) return 'exploring_situation'
  return 'deeper_conversation'
}

export function generateOrchestratorResponse(decision, memory, context = {}) {
  const { action, intent: detectedIntent, conversationalStage, isContinuation, fusion } = decision
  const rawInput = context.userMessage || ''
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en

  const responseHistory = memory.lastResponses || []

  const recentTopics = getRecentTopics(memory)

  if (action === 'execute') {
    const lastDecision = memory.lastDecision
    const agreement = detectedIntent.intent === 'agreement' || detectedIntent.intent === 'gratitude'
    const done = /\b(lo hice|done|listo|ready|completed|termin[eé]|complet[eé]|hice|ya|finished|acab[eé])\b/i.test(rawInput)
    const failure = /\b(no funcion[óo]|didn't work|no pude|couldn't|fall[óo]|failed|no sirvi[óo]|nadie|no one|no me|no quisieron|they didn|no hay|no result[óo]|no funcionó)\b/i.test(rawInput)

    if (done || (agreement && lastDecision && lastDecision.status === 'in_progress')) {
      const result = advanceExecution(memory, 'success')
      if (result) return result.text
    }

    if (failure) {
      const result = advanceExecution(memory, 'failed')
      if (result) return result.text
    }

    if (agreement && lastDecision && lastDecision.status === 'proposed') {
      lastDecision.status = 'in_progress'
    }

    const execResult = generateDecisionResponse(memory, context)
    if (execResult) return execResult.text

    if (lastDecision && lastDecision.status === 'proposed') {
      const step = lastDecision.executionPlan[0]
      return t(
        `${lastDecision.reasoning}\n\nVamos paso a paso.\n\n**Paso 1:** ${step.instruction}\n\nHaz esto y luego me cuentas cómo te fue.`,
        `${lastDecision.reasoning}\n\nLet's go step by step.\n\n**Step 1:** ${step.instruction}\n\nDo this and then tell me how it went.`
      )
    }
  }

  if (action === 'plan') {
    const planResult = getPlannerResponse(memory, context)
    memory.lastPlan = planResult.plan
    return planResult.text
  }

  if (action === 'explain') {
    return t(
      `Funciona de forma sencilla: hablamos sobre tu situación y poco a poco vamos armando un plan contigo. No necesitas tener todo listo desde el inicio.\n\n¿Quieres empezar contándome qué está pasando ahora mismo?`,
      `It's simple: we talk about your situation and gradually build a plan together. You don't need to have everything ready from the start.\n\nWant to start by telling me what's going on right now?`
    )
  }

  if (action === 'guide' && detectedIntent.intent === 'what_to_do_first') {
    return t(
      `Empecemos simple.\nCuéntame un poco sobre tu situación ahora mismo—¿qué es lo que más te ha estado preocupando?`,
      `Let's keep it simple.\nTell me a bit about your situation right now—what's been on your mind the most?`
    )
  }

  if (action === 'support') {
    if (fusion && fusion.priorityDomain) {
      return generateDeepResponse(rawInput, fusion, memory)
    }
    return t(
      `Escucho que estás pasando por un momento difícil. Antes de hablar de planes, dime—¿cómo estás ahora mismo?`,
      `I hear you're going through a hard time. Before talking about plans, tell me—how are you right now?`
    )
  }

  if (action === 'validate' && isContinuation) {
    if (fusion && fusion.priorityDomain) {
      return generateDeepResponse(rawInput, fusion, memory)
    }
    return t(
      `Entiendo. Sigue cuando gustes.`,
      `I understand. Go on whenever you like.`
    )
  }

  if (action === 'explore') {
    if (fusion && fusion.priorityDomain) {
      return generateDeepResponse(rawInput, fusion, memory)
    }
    if (conversationalStage === 'getting_to_know') {
      return t(
        `Cuéntame sobre ti—¿cómo es tu día a día en este momento?`,
        `Tell me about yourself—what's your day-to-day like right now?`
      )
    }
    if (detectedIntent.intent === 'financial') {
      return t(
        `Háblame más de eso—¿qué es lo que más te preocupa en términos financieros?`,
        `Tell me more about that—what worries you most financially?`
      )
    }
    if (detectedIntent.intent === 'goals') {
      return t(
        `Qué bueno que tienes metas en mente. Cuéntame más—¿qué te gustaría lograr?`,
        `It's great that you have goals in mind. Tell me more—what would you like to achieve?`
      )
    }
    if (detectedIntent.intent === 'agreement') {
      return t(
        `Bien, sigamos. ¿Qué es lo primero que te viene a la mente cuando piensas en tu situación actual?`,
        `Alright, let's continue. What's the first thing that comes to mind when you think about your current situation?`
      )
    }
    if (detectedIntent.intent === 'uncertainty') {
      return t(
        `No te preocupes, no hay prisa. A veces solo hablar ayuda a aclarar las cosas. ¿Qué te trajo aquí hoy?`,
        `Don't worry, there's no rush. Sometimes just talking helps clarify things. What brought you here today?`
      )
    }
    if (detectedIntent.intent === 'topic_shift') {
      return t(
        `Claro, cambiemos de tema. ¿Qué te gustaría explorar ahora?`,
        `Sure, let's change topics. What would you like to explore now?`
      )
    }
    if (recentTopics.length > 0) {
      return t(
        `Cuéntame más sobre ${recentTopics[recentTopics.length - 1]}—¿cómo te va con eso?`,
        `Tell me more about ${recentTopics[recentTopics.length - 1]}—how's that going?`
      )
    }
    return t(
      `Cuéntame más—¿qué está pasando en tu vida en este momento?`,
      `Tell me more—what's happening in your life right now?`
    )
  }

  if (action === 'clarify') {
    return t(
      `Claro, déjame explicarlo mejor. ¿Qué parte específicamente no quedó clara?`,
      `Sure, let me explain better. What part specifically wasn't clear?`
    )
  }

  if (action === 'suggest' && detectedIntent.intent === 'plan_request') {
    if (context.hasFormData) {
      return t(
        `Puedo generar un plan personalizado para ti. Antes de eso, ¿hay algún área específica en la que quieras enfocarte?`,
        `I can generate a personalized plan for you. Before that, is there a specific area you want to focus on?`
      )
    }
    return t(
      `Para darte un plan útil, necesito entender mejor tu situación. ¿Por dónde te gustaría empezar?`,
      `To give you a useful plan, I need to understand your situation better. Where would you like to start?`
    )
  }

  if (action === 'acknowledge') {
    if (fusion && fusion.priorityDomain) {
      return generateDeepResponse(rawInput, fusion, memory)
    }
    return t(
      `Entiendo. Sigue cuando gustes.`,
      `I understand. Go on whenever you like.`
    )
  }

  if (action === 'presence') {
    return t(
      `Estoy aquí cuando me necesites. Cuídate.`,
      `I'm here when you need me. Take care.`
    )
  }

  if (action === 'ask_follow_up') {
    if (recentTopics.length > 0) {
      return t(
        `Sobre lo que mencionabas de ${recentTopics[recentTopics.length - 1]}—¿quieres profundizar en eso o prefieres otro tema?`,
        `About what you mentioned regarding ${recentTopics[recentTopics.length - 1]}—want to go deeper into that or prefer another topic?`
      )
    }
    return t(
      `¿Hay algo más que quieras compartir o en lo que pueda ayudarte?`,
      `Is there anything else you'd like to share or that I can help with?`
    )
  }

  if (fusion && fusion.priorityDomain) {
    return generateDeepResponse(rawInput, fusion, memory)
  }

  return t(
    `Cuéntame cómo estás—¿qué ha sido lo más importante para ti últimamente?`,
    `Tell me how you're doing—what's been most important to you lately?`
  )
}

export function getResponseStrategy(decision) {
  const action = decision.action

  const strategies = {
    [ACTIONS.EXPLAIN]: {
      mode: 'informative',
      style: 'clear and welcoming',
      length: 'moderate',
    },
    [ACTIONS.CLARIFY]: {
      mode: 'clarifying',
      style: 'patient and open',
      length: 'short',
    },
    [ACTIONS.EXPLORE]: {
      mode: 'exploratory',
      style: 'curious and open-ended',
      length: 'short to moderate',
    },
    [ACTIONS.GUIDE]: {
      mode: 'directive',
      style: 'supportive and clear',
      length: 'moderate',
    },
    [ACTIONS.SUGGEST]: {
      mode: 'advisory',
      style: 'helpful and optional',
      length: 'moderate',
    },
    [ACTIONS.PLAN]: {
      mode: 'adaptive',
      style: 'step-by-step and supportive',
      length: 'moderate to long',
    },
    [ACTIONS.EXECUTE]: {
      mode: 'directive',
      style: 'step-by-step, guiding execution',
      length: 'short to moderate',
    },
    [ACTIONS.REFLECT]: {
      mode: 'reflective',
      style: 'empathetic and thoughtful',
      length: 'short',
    },
    [ACTIONS.ASK_FOLLOW_UP]: {
      mode: 'engagement',
      style: 'curious and gentle',
      length: 'short',
    },
    [ACTIONS.VALIDATE]: {
      mode: 'validating',
      style: 'warm and accepting',
      length: 'short',
    },
    [ACTIONS.ACKNOWLEDGE]: {
      mode: 'listening',
      style: 'present and attentive',
      length: 'minimal',
    },
    [ACTIONS.PRESENCE]: {
      mode: 'presence',
      style: 'gentle and available',
      length: 'minimal',
    },
    [ACTIONS.SUPPORT]: {
      mode: 'supportive',
      style: 'compassionate and calm',
      length: 'short',
    },
  }

  return strategies[action] || strategies[ACTIONS.GUIDE]
}
