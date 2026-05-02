/**
 * aiOrchestrator.js
 * Authoritative controller for Nephi's response pipeline.
 * Ensures a single decision point and context-aware responses.
 */

export function decideFinalResponse(input, memory, modulesOutput) {
  const {
    fusion,
    intent,
    planner,
    decision,
    emotion
  } = modulesOutput;

  const lang = memory.language || 'es';
  const t = (es, en) => lang === 'es' ? es : en;

  // 1. Context Injection
  const enrichedContext = {
    ...memory,
    currentInput: input,
    previousInputs: memory.userInputs || [],
    detectedDomains: fusion?.domains || {},
    emotionalIntensity: emotion?.intensity || 0,
  };

  // 2. Priority Ranking
  const candidates = [];

  // Critical User Data (Money, Debt, Crisis)
  if (fusion?.domains?.financial || fusion?.domains?.emotional?.some(e => e.signal === 'crisis')) {
    candidates.push({
      source: 'fusion',
      priority: 1.0,
      output: fusion,
      type: 'critical'
    });
  }

  // Direct User Questions / Intent
  if (intent && intent.confidence > 0.7 && !intent.isContinuation) {
    candidates.push({
      source: 'intent',
      priority: 0.9,
      output: intent,
      type: 'question'
    });
  }

  // Emotional Distress
  if (emotion && emotion.intensity > 6) {
    candidates.push({
      source: 'emotion',
      priority: 0.8,
      output: emotion,
      type: 'emotional'
    });
  }

  // Planner Suggestions
  if (planner && planner.priority > 0.4) {
    candidates.push({
      source: 'planner',
      priority: planner.priority || 0.6,
      output: planner,
      type: 'plan'
    });
  }

  // Decision Engine
  if (decision && decision.priority > 0.5) {
    candidates.push({
      source: 'decision',
      priority: decision.priority || 0.7,
      output: decision,
      type: 'action'
    });
  }

  // General Domain Fusion
  if (fusion && fusion.priorityDomain) {
    candidates.push({
      source: 'fusion',
      priority: 0.5,
      output: fusion,
      type: 'insight'
    });
  }

  // Fallback
  candidates.push({
    source: 'fallback',
    priority: 0.1,
    output: { text: t("Entiendo. Cuéntame más sobre eso.", "I understand. Tell me more about that.") },
    type: 'fallback'
  });

  // Sort by priority
  candidates.sort((a, b) => b.priority - a.priority);

  // Select winning module
  const winner = candidates[0];
  console.log("Final Decision Source:", winner.source, "(Priority:", winner.priority, ")");

  let finalResponse = "";

  // 3. Assemble Final Response
  if (winner.source === 'fusion') {
    finalResponse = winner.output.suggestedAction || winner.output.combinedInsight;
  } else if (winner.source === 'planner') {
    finalResponse = winner.output.suggestedAction;
  } else if (winner.source === 'decision') {
    finalResponse = winner.output.suggestedAction;
  } else if (winner.source === 'intent') {
    finalResponse = assembleIntentResponse(winner.output, enrichedContext, t);
  } else if (winner.source === 'emotion') {
    finalResponse = assembleEmotionResponse(winner.output, enrichedContext, t);
  } else {
    finalResponse = winner.output.text;
  }

  // 4. Loop Prevention
  if (preventReset(finalResponse, memory.userInputs || [])) {
    console.log("Loop detected. Blocking generic reset prompt.");
    // Force a more contextual fallback if a reset was attempted
    finalResponse = t(
      `Mencionaste antes que "${enrichedContext.previousInputs[0]?.content || 'querías mejorar tu situación'}". ¿Cómo va eso?`,
      `You mentioned before that "${enrichedContext.previousInputs[0]?.content || 'you wanted to improve your situation'}". How is that going?`
    );
  }

  // 5. Ensure context reference (if not already present and not a critical crisis)
  if (!finalResponse.includes(input.substring(0, 5)) && winner.priority < 0.9) {
    // Subtle context injection if the response feels too generic
    // (This is a simplified version, can be made smarter)
  }

  return finalResponse;
}

function assembleIntentResponse(intent, context, t) {
  // Logic to turn intent data into a response if the module didn't provide one
  // This helps centralize the "voice"
  switch (intent.intent) {
    case 'greeting':
      return t("¡Hola! Me alegra verte de nuevo. ¿En qué podemos avanzar hoy?", "Hello! Good to see you again. What can we work on today?");
    case 'how_it_works':
      return t("Nephi te ayuda a organizar tu camino a la autosuficiencia paso a paso. Analizamos tus ingresos, gastos y metas para crear un plan real.", "Nephi helps you organize your path to self-sufficiency step by step. We analyze your income, expenses, and goals to create a real plan.");
    default:
      return t("Entiendo tu interés en " + intent.intent + ". ¿Quieres profundizar en eso?", "I understand your interest in " + intent.intent + ". Want to go deeper into that?");
  }
}

function assembleEmotionResponse(emotion, context, t) {
  const topEmotion = emotion.emotions[0]?.emotion || 'stress';
  return t(
    `Veo que te sientes con algo de ${topEmotion}. No estás solo. Vamos a tomarlo con calma.`,
    `I see you're feeling some ${topEmotion}. You're not alone. Let's take it slow.`
  );
}

export function preventReset(response, history) {
  if (history.length === 0) return false;

  const resetPatterns = [
    /cuéntame sobre ti/i,
    /en qué puedo ayudarte/i,
    /tell me about yourself/i,
    /how can i help you/i,
    /qué te trae por aquí/i,
    /what brings you here/i
  ];

  const isResetPrompt = resetPatterns.some(pattern => pattern.test(response));
  const hasStarted = history.length >= 1;

  return isResetPrompt && hasStarted;
}
