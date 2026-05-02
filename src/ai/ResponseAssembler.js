/**
 * ResponseAssembler.js (Complete Rewrite)
 * Pure generator logic that avoids templates and redundant phrasing.
 */

export function assembleResponse(stage, analysis, formData, budgetData, memory, userMessage, lang) {
  if (stage === 'WELCOME') {
    return buildWelcomeMessage(memory, formData, lang)
  }

  if (!analysis || analysis.structureError) {
    return lang === 'es'
      ? 'Lo siento, hubo un error procesando tu mensaje. ¿Podrías repetirlo?'
      : 'Sorry, there was an error processing your message. Could you repeat that?'
  }

  // The Orchestrator has already decided the best response
  if (analysis.orchestratorResponse) {
    return analysis.orchestratorResponse
  }

  // Fallback if everything else fails
  return lang === 'es' 
    ? "Entiendo. Continuemos explorando tu situación."
    : "I understand. Let's continue exploring your situation."
}

export function buildWelcomeMessage(memory, formData, lang) {
  const name = formData?.name || ''
  if (memory.interactionCount === 0) {
    return lang === 'es'
      ? `Hola. Soy Nephi. He sido diseñado para ayudarte a navegar hacia la autosuficiencia. Cuéntame, ¿qué es lo más urgente para ti hoy?`
      : `Hello. I'm Nephi. I've been designed to help you navigate toward self-sufficiency. Tell me, what's most urgent for you today?`
  }
  
  const greeting = name ? (lang === 'es' ? `Hola de nuevo, ${name}. ` : `Hello again, ${name}. `) : (lang === 'es' ? 'Hola de nuevo. ' : 'Hello again. ')
  return greeting + (lang === 'es'
    ? `Continuemos desde donde nos quedamos. ¿En qué podemos avanzar?`
    : `Let's continue from where we left off. What can we move forward on?`)
}

export function renderPlanInChat(plan, lang = 'es') {
  if (!plan) return '';
  const title = lang === 'es' ? '╔════════ ESTADO DEL PLAN ════════╗' : '╔════════ PLAN STATUS ════════╗';
  const footer = '╚═════════════════════════════════╝';
  
  let output = `${title}\n`;
  if (plan.steps) {
    plan.steps.forEach((step, i) => {
      output += `  ${i + 1}. ${step.title || step}\n`;
    });
  } else if (plan.content) {
    output += `  ${plan.content}\n`;
  }
  output += footer;
  return output;
}
