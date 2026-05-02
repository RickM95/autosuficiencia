/**
 * emotionOverride.js
 * Detects and handles critical emotional distress to interrupt task-based flow.
 */

const CRITICAL_EMOTIONS = {
  deprimido: { en: 'depressed', intensity: 0.9 },
  frustrado: { en: 'frustrated', intensity: 0.7 },
  solo: { en: 'lonely', intensity: 0.8 },
  abrumado: { en: 'overwhelmed', intensity: 0.85 },
  perdido: { en: 'lost', intensity: 0.75 },
  desesperado: { en: 'desperate', intensity: 1.0 },
  suicidio: { en: 'suicidal', intensity: 1.0 },
  morir: { en: 'die', intensity: 1.0 }
};

export class EmotionOverride {
  constructor() {
    this.emotionState = {
      lastEmotion: "",
      escalationLevel: 0,
      consecutiveDistress: 0
    };
  }

  detectEmotionalPriority(input, lang = 'es') {
    const text = (input || '').toLowerCase();
    let detected = {
      isCritical: false,
      emotion: "",
      intensity: 0
    };

    for (const [es, data] of Object.entries(CRITICAL_EMOTIONS)) {
      if (text.includes(es) || text.includes(data.en)) {
        detected.isCritical = true;
        detected.emotion = lang === 'es' ? es : data.en;
        detected.intensity = data.intensity;
        break;
      }
    }

    // Update escalation tracking
    if (detected.isCritical) {
      if (detected.emotion === this.emotionState.lastEmotion) {
        this.emotionState.escalationLevel += 1;
      } else {
        this.emotionState.escalationLevel = 0;
      }
      this.emotionState.lastEmotion = detected.emotion;
      this.emotionState.consecutiveDistress += 1;
    } else {
      // Decay distress count slowly if user seems okay
      this.emotionState.consecutiveDistress = Math.max(0, this.emotionState.consecutiveDistress - 0.5);
      if (this.emotionState.consecutiveDistress === 0) {
        this.emotionState.lastEmotion = "";
        this.emotionState.escalationLevel = 0;
      }
    }

    return detected;
  }

  generateSupportResponse(detected, lang = 'es') {
    const { emotion } = detected;
    
    const es_responses = {
      deprimido: "Siento mucho que estés pasando por esto. Sentirse así es realmente pesado y agobiante.",
      frustrado: "Es totalmente comprensible que te sientas así. La frustración es una respuesta natural a estos desafíos.",
      solo: "No tienes que pasar por esto en total soledad. Reconocer cómo te sientes es el primer paso.",
      abrumado: "Parece que hay demasiado sobre tus hombros ahora mismo. Vamos a pausar todo lo demás.",
      perdido: "Está bien no tener todas las respuestas ahora mismo. No estás solo en esta búsqueda.",
      desesperado: "Te escucho. Esa sensación de desesperación es muy intensa y merece ser atendida con calma."
    };

    const en_responses = {
      depressed: "I'm so sorry you're feeling this way. It sounds incredibly heavy and overwhelming.",
      frustrated: "It's completely understandable that you feel this way. Frustration is a natural response to these challenges.",
      lonely: "You don't have to go through this entirely alone. Acknowledging how you feel is the first step.",
      overwhelmed: "It sounds like there's too much on your shoulders right now. Let's pause everything else.",
      lost: "It's okay not to have all the answers right now. You're not alone in this search.",
      desperate: "I hear you. That feeling of desperation is very intense and deserves to be met with calm."
    };

    const acknowledgement = lang === 'es' 
      ? (es_responses[emotion] || "Entiendo que estás pasando por un momento difícil.")
      : (en_responses[emotion] || "I understand you're going through a difficult time.");

    const pauseBridge = lang === 'es'
      ? "\n\nNo vamos a hablar de finanzas ni metas por ahora."
      : "\n\nWe're not going to talk about finances or goals right now.";

    const stabilize = lang === 'es'
      ? "\n\nLo más importante es tu bienestar inmediato."
      : "\n\nThe most important thing is your immediate wellbeing.";

    const nextStep = lang === 'es'
      ? "\n\nDime, ¿tienes a alguien cerca con quien puedas hablar sobre cómo te sientes hoy?"
      : "\n\nTell me, do you have someone nearby you can talk to about how you're feeling today?";

    return acknowledgement + pauseBridge + stabilize + nextStep;
  }

  isEscalating() {
    return this.emotionState.escalationLevel > 1 || this.emotionState.consecutiveDistress > 2;
  }
}

export const emotionOverride = new EmotionOverride();
