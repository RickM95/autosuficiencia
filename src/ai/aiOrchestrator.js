import { emotionOverride } from './emotionOverride.js';

export function decideFinalResponse(input, memory, modulesOutput, progressState) {
  const {
    fusion,
    intent,
    planner,
    decision,
    emotion,
    lang,
    externalKnowledge
  } = modulesOutput;

  const t = (es, en) => lang === 'es' ? es : en;

  // 1. EMOTION OVERRIDE (HIGHEST PRIORITY)
  const emotionalDistress = emotionOverride.detectEmotionalPriority(input, lang);
  if (emotionalDistress.isCritical) {
    return emotionOverride.generateSupportResponse(emotionalDistress, lang);
  }

  // Answer FIRST: Acknowledge what we just learned
  let acknowledgment = ""
  if (intent.intent === 'financial' && fusion.domains.financial.detected) {
    acknowledgment = lang === 'es' 
      ? "Entiendo lo que mencionas sobre tu situación financiera. "
      : "I understand what you're saying about your financial situation. "
  } else if (intent.intent === 'employment') {
    acknowledgment = lang === 'es'
      ? "Veo que el tema del empleo es lo que te ocupa ahora. "
      : "I see that employment is what's on your mind right now. "
  }

  // Guide SECOND: Move forward based on progressState
  let guidance = ""
  const missing = progressState.capturedFields || []
  
  if (!progressState.hasDebt) {
    guidance = t(
      "Para ayudarte mejor, ¿tienes alguna deuda que te preocupe ahora mismo?",
      "To help you better, do you have any debt worrying you right now?"
    )
  } else if (!progressState.hasIncome) {
    guidance = t(
      "Hablemos de ingresos—¿tienes alguna entrada de dinero actualmente?",
      "Let's talk about income—do you have any money coming in currently?"
    )
  } else if (!progressState.hasEmployment) {
    guidance = t(
      "¿Estás trabajando o buscando algo en este momento?",
      "Are you working or looking for something at the moment?"
    )
  } else {
    guidance = t(
      "Ya tenemos una base. Vamos a enfocarnos en el siguiente paso del plan.",
      "We have a foundation. Let's focus on the next step of the plan."
    )
  }

  // Special case: Debt + Unemployment (The User's specific scenario)
  const hasDebtKeywords = input.includes('deuda') || input.includes('debt')
  const hasWorkKeywords = input.includes('trabajo') || input.includes('empleo') || input.includes('job') || input.includes('work')

  if (fusion.domains.financial.detected && hasDebtKeywords && hasWorkKeywords) {
    return t(
      `Ok, eso ya me da una imagen clara:\n- tienes una deuda importante\n- no tienes ingresos ahora mismo\n\nNo vamos a seguir con preguntas generales—vamos a enfocarnos en el siguiente paso.\n\nPrimero necesitamos generar ingreso, aunque sea pequeño. Dime, ¿tienes acceso a teléfono o transporte?`,
      `Ok, that gives me a clear picture:\n- you have a significant debt\n- you have no income right now\n\nWe're not going to continue with general questions—we're going to focus on the next step.\n\nFirst, we need to generate income, even if it's small. Tell me, do you have access to a phone or transportation?`
    )
  }

  let finalResponse = acknowledgment + guidance

  // Append external knowledge if available
  if (externalKnowledge) {
    const bridge = lang === 'es' 
      ? "\n\nPor cierto, encontré esto que podría ser útil: " 
      : "\n\nBy the way, I found this which might be helpful: ";
    
    // Limit summary length for chat fluidity
    const summary = externalKnowledge.length > 200 
      ? externalKnowledge.substring(0, 200) + "..." 
      : externalKnowledge;
      
    finalResponse += bridge + summary;
  }

  return finalResponse
}
