/**
 * ✅ EMOTIONAL CONTEXT ENGINE
 * Nephi AS - Persistent Emotional Continuity System
 * 
 * Prevents context loss, maintains emotional awareness across turns,
 * and ensures human-like conversational presence.
 * 
 * This module is the single source of truth for all emotional state
 * management. NO other module may modify emotional state directly.
 */

export const MODES = {
  EMOTIONAL_SUPPORT: 'EMOTIONAL_SUPPORT',
  REFLECTION: 'REFLECTION',
  PLANNING: 'PLANNING',
  INFORMATION: 'INFORMATION',
  DEV: 'DEV',
  DEFAULT: 'DEFAULT'
}

export const EMOTIONAL_STATES = {
  OVERWHELMED: 'overwhelmed',
  SAD: 'sad',
  LOST: 'lost',
  ANXIOUS: 'anxious',
  FRUSTRATED: 'frustrated',
  HOPEFUL: 'hopeful',
  CALM: 'calm',
  NEUTRAL: 'neutral'
}

export class EmotionalContextEngine {
  constructor(memory) {
    this.memory = memory
    this.MODE_PERSISTENCE_BASE = 3 // Minimum turns mode stays active
    this.SHORT_INPUT_THRESHOLD = 12 // Characters
    this.SHORT_INPUT_WORD_THRESHOLD = 3 // Words
  }

  /**
   * Main entry point - called before any reasoning
   */
  evaluate(userMessage, intentResult, emotionalAnalysis) {
    const currentMode = this.memory.currentMode

    // ✅ RULE 1: SHORT INPUT + ACTIVE MODE = STAY
    if (this.isShortInput(userMessage) && this.shouldPreserveMode()) {
      this.extendModePersistence()
      return {
        preserveMode: true,
        mode: currentMode.type,
        action: 'CONTINUE'
      }
    }

    // ✅ RULE 2: EMOTIONAL CRISIS DETECTED
    if (emotionalAnalysis.interventionNeed === 'IMMEDIATE') {
      this.enterMode(MODES.EMOTIONAL_SUPPORT, 0.95, 6)
      this.setEmotionalState(EMOTIONAL_STATES.OVERWHELMED, emotionalAnalysis.intensity || 0.8)
      return {
        preserveMode: false,
        mode: MODES.EMOTIONAL_SUPPORT,
        action: 'ENTER_SUPPORT_MODE'
      }
    }

    // ✅ RULE 3: STRONG INTENT TO CHANGE TOPIC
    if (this.isExplicitTopicShift(intentResult)) {
      const newMode = this.mapIntentToMode(intentResult.primaryIntent)
      if (newMode !== currentMode.type) {
        this.exitCurrentMode()
        this.enterMode(newMode, intentResult.confidence, 2)
        return {
          preserveMode: false,
          mode: newMode,
          action: 'TRANSITION_MODE'
        }
      }
    }

    // ✅ RULE 4: DEFAULT - MAINTAIN CURRENT STATE
    if (currentMode.type) {
      this.decreasePersistence()
      return {
        preserveMode: true,
        mode: currentMode.type,
        action: 'CONTINUE'
      }
    }

    return {
      preserveMode: false,
      mode: MODES.DEFAULT,
      action: 'DEFAULT'
    }
  }

  enterMode(modeType, confidence = 0.8, persistence = 3) {
    this.memory.currentMode = {
      type: modeType,
      confidence,
      persistence,
      enteredAt: Date.now(),
      lastUpdated: Date.now()
    }
    this.memory.lastMode = modeType
  }

  exitCurrentMode() {
    if (this.memory.currentMode.type) {
      this.memory.previousModes = this.memory.previousModes || []
      this.memory.previousModes.push({ ...this.memory.currentMode, exitedAt: Date.now() })
    }

    this.memory.currentMode = {
      type: null,
      confidence: 0,
      persistence: 0,
      enteredAt: null,
      lastUpdated: null
    }
  }

  extendModePersistence() {
    this.memory.currentMode.lastUpdated = Date.now()
    if (this.memory.currentMode.persistence < this.MODE_PERSISTENCE_BASE) {
      this.memory.currentMode.persistence = this.MODE_PERSISTENCE_BASE
    }
  }

  decreasePersistence() {
    if (this.memory.currentMode.persistence > 0) {
      this.memory.currentMode.persistence--
    }

    if (this.memory.currentMode.persistence <= 0) {
      this.exitCurrentMode()
    }
  }

  setEmotionalState(state, intensity = 0.5) {
    this.memory.emotionalState = this.memory.emotionalState || { history: [] }
    
    this.memory.emotionalState.history.push({
      state: this.memory.emotionalState.state,
      intensity: this.memory.emotionalState.intensity,
      timestamp: Date.now()
    })

    if (this.memory.emotionalState.history.length > 10) {
      this.memory.emotionalState.history.shift()
    }

    this.memory.emotionalState.state = state
    this.memory.emotionalState.intensity = intensity
  }

  isShortInput(text) {
    if (!text) return true
    const cleaned = text.trim().toLowerCase()
    return cleaned.length < this.SHORT_INPUT_THRESHOLD 
        || cleaned.split(' ').filter(w => w.length > 0).length < this.SHORT_INPUT_WORD_THRESHOLD
  }

  shouldPreserveMode() {
    const mode = this.memory.currentMode

    if (!mode.type) return false
    if (mode.persistence <= 0) return false

    // Active modes that require strong intent to exit
    return mode.type === MODES.EMOTIONAL_SUPPORT 
        || mode.type === MODES.REFLECTION
  }

  isExplicitTopicShift(intentResult) {
    if (!intentResult || !intentResult.primaryIntent) return false
    return intentResult.confidence > 0.75
  }

  mapIntentToMode(intent) {
    const mapping = {
      'immediate_crisis': MODES.EMOTIONAL_SUPPORT,
      'emotional_overwhelm': MODES.EMOTIONAL_SUPPORT,
      'stressed_and_struggling': MODES.EMOTIONAL_SUPPORT,
      'financial_planning': MODES.PLANNING,
      'goal_setting': MODES.PLANNING,
      'general_information': MODES.INFORMATION,
      'dev_request': MODES.DEV,
      'reflection': MODES.REFLECTION
    }

    return mapping[intent] || MODES.DEFAULT
  }

  getResponseGuidance() {
    const state = this.memory.emotionalState
    const mode = this.memory.currentMode

    return {
      mode: mode.type,
      emotionalState: state?.state,
      intensity: state?.intensity,
      guidelines: this.getModeGuidelines(mode.type, state)
    }
  }

  getModeGuidelines(mode, emotionalState) {
    switch(mode) {
      case MODES.EMOTIONAL_SUPPORT:
        return {
          keepResponsesShort: true,
          avoidLists: true,
          avoidSolutions: emotionalState?.intensity > 0.7,
          focusOnValidation: true,
          followUpNaturally: true
        }
      
      case MODES.REFLECTION:
        return {
          askOpenQuestions: true,
          avoidJudgement: true,
          slowPace: true
        }

      default:
        return {}
    }
  }

  isConversationActive() {
    return this.memory.interactionCount > 2 || this.memory.currentMode.type !== null
  }

  shouldBlockWelcomeFallback() {
    return this.isConversationActive() || this.memory.lastMode
  }
}

export default EmotionalContextEngine