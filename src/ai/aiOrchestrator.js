import { emotionOverride } from './emotionOverride.js';

export function decideFinalResponse(input, memory, modulesOutput, progressState) {
  const {
    fusion,
    intent,
    lang,
    externalKnowledge,
    activeMode
  } = modulesOutput;

  const t = (es, en) => lang === 'es' ? es : en;

  // PHASE 8: Telemetry/Debug
  // This would ideally be emitted via AICore, but we can track state changes here
  const logDebug = (msg) => {
    if (typeof self !== 'undefined' && self.postMessage) {
      self.postMessage({ type: 'onDebug', payload: { phase: 'orchestrator', message: msg, mode: activeMode } });
    }
  };

  // 1. EMOTION OVERRIDE (HIGHEST PRIORITY)
  const emotionalDistress = emotionOverride.detectEmotionalPriority(input, lang);
  if (emotionalDistress.isCritical) {
    memory.activeMode = 'EMOTIONAL_SUPPORT';
    return emotionOverride.generateSupportResponse(emotionalDistress, lang);
  }

  // 2. KNOWLEDGE / ADVICE
  if (intent.intent === 'knowledge_query' || intent.intent === 'advice') {
    if (externalKnowledge) {
      return (lang === 'es' ? "Encontré esto: " : "I found this: ") + externalKnowledge;
    }
    return t(
      "No encontré información específica, pero puedo ayudarte a planificar tus pasos.",
      "I couldn't find specific info, but I can help you plan your next steps."
    );
  }

  // 3. MODE-AWARE GUIDANCE (PHASE 1)
  if (activeMode === 'FINANCIAL_REVIEW' || (intent.intent === 'financial' && fusion.domains.financial.urgency > 0.6)) {
    memory.activeMode = 'FINANCIAL_REVIEW';
    
    if (!progressState.hasIncome) {
      memory.lastQuestionContext = { domain: 'financial', field: 'income' };
      return t(
        "Para tu plan financiero, ¿tienes algún ingreso actualmente?",
        "For your financial plan, do you have any income currently?"
      );
    }
    
    if (!progressState.hasDebt) {
      memory.lastQuestionContext = { domain: 'financial', field: 'debt' };
      return t(
        "Entiendo. ¿Y tienes deudas que necesitemos priorizar?",
        "I see. And do you have any debts we need to prioritize?"
      );
    }
  }

  // 4. GENERAL PROGRESS
  if (!progressState.hasEmployment) {
    memory.activeMode = 'EMPLOYMENT_SEARCH';
    memory.lastQuestionContext = { domain: 'employment' };
    return t(
      "Veo que no mencionamos el trabajo. ¿Estás buscando empleo ahora?",
      "I see we haven't mentioned work. Are you looking for a job now?"
    );
  }

  // Default Fallback
  memory.activeMode = null;
  memory.lastQuestionContext = null;
  return t(
    "Cuéntame más sobre tus metas de autosuficiencia.",
    "Tell me more about your self-sufficiency goals."
  );
}
