/**
 * ✅ FALLBACK GUARD SYSTEM
 * 
 * Blocks unwanted resets, prevents default fallbacks
 * Ensures system never shows default greeting mid-conversation
 */

export class FallbackGuard {
  constructor(memory) {
    this.memory = memory
  }

  shouldBlockFallback() {
    // Never show welcome fallback during active conversation
    if (this.memory.interactionCount > 2) return true
    if (this.memory.currentMode && this.memory.currentMode.type) return true
    if (this.memory.lastMode) return true
    if (this.memory.lastTopic) return true
    if (this.memory.emotionalState && this.memory.emotionalState.state !== 'neutral') return true
    
    return false
  }

  getFallbackReplacement() {
    if (this.memory.currentMode?.type === 'EMOTIONAL_SUPPORT') {
      return {
        type: 'EMOTIONAL_CONTINUATION',
        message: "I'm still here with you. Want to talk about what's going on?"
      }
    }

    if (this.memory.lastTopic) {
      return {
        type: 'TOPIC_CONTINUATION',
        message: `We were talking about ${this.memory.lastTopic}. Would you like to continue?`
      }
    }

    return {
      type: 'GENERAL_CONTINUATION',
      message: "I'm listening."
    }
  }

  preventWelcomeReset() {
    if (this.shouldBlockFallback()) {
      // Never allow reset to WELCOME state
      this.memory.stage = this.memory.lastValidStage || 'TOPIC_ADVICE'
      return true
    }
    return false
  }

  validateStageTransition(newStage) {
    if (newStage === 'WELCOME' && this.shouldBlockFallback()) {
      return this.memory.lastValidStage || 'TOPIC_ADVICE'
    }
    return newStage
  }
}

export default FallbackGuard