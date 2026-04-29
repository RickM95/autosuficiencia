export default class ConversationMemory {
  constructor() {
    this.MAX_ADVICE_GIVEN = 20
    this.MAX_TOPICS = 30
    this.reset()
  }

  reset() {
    this.facts = {}
    this.stage = 'WELCOME'
    this.discussedTopics = new Set()
    this.adviceGiven = []
    this.unresolvedNeeds = []
    this.sentiment = 'neutral'
    this.planProgress = { needs: 0, finances: 0, goals: 0, resources: 0, commitment: 0 }
    this.interactionCount = 0
    this.lastTopic = null
    this.consecutiveOffTopic = 0
    this.language = 'es'
    
    // ✅ STICKY MODE IMPLEMENTATION
    this.currentMode = {
      type: null,
      confidence: 0,
      lastUpdated: null
    }
    
    // ✅ PERSISTENT CONTEXT
    this.lastEmotionalState = null
    this.lastUserIntent = null
    this.lastValidStage = 'WELCOME'
    
    // NEW: Enhanced reasoning tracking
    this.recordedTopics = []
    this.recordedIntents = []
    this.recordedSubtexts = []
    this.recordedResponseModes = []
  }

  setLanguage(lang) {
    this.language = lang === 'en' ? 'en' : 'es'
  }

  recordInteraction(role, content, topic) {
    this.interactionCount++
    if (role === 'user') {
      if (topic) {
        this.discussedTopics.add(topic)
        if (this.discussedTopics.size > this.MAX_TOPICS) {
          const first = this.discussedTopics.values().next().value
          this.discussedTopics.delete(first)
        }
      }
      this.lastTopic = topic
      this._updateSentiment(content)
    }
  }

  _updateSentiment(text) {
    const overwhelmed = /overwhelm|estoy perdido|no sé|confused|depressed|stuck|no puedo|desesperado|crisis|estresado|ansioso/i.test(text)
    const positive = /gracias|ayudó|excelente|bueno|progreso|great|thanks|helpful|improve|better|lo logré/i.test(text)
    const neutral = /entiendo|ok|sí|no|quizá|tal vez|maybe|not sure/i.test(text)

    if (overwhelmed) {
      this.sentiment = 'overwhelmed'
      this.consecutiveOffTopic = 0
    } else if (positive) {
      this.sentiment = 'positive'
      this.consecutiveOffTopic = 0
    } else if (neutral) {
      if (this.sentiment === 'overwhelmed') this.sentiment = 'improving'
    }
  }

  addFact(key, value) {
    if (value !== undefined && value !== null && value !== '') {
      this.facts[key] = value
    }
  }

  extractFactsFromForm(formData) {
    if (!formData) return
    const d = formData
    this.addFact('name', d.name)
    this.addFact('location', d.location)
    this.addFact('age', d.age)
    this.addFact('dependents', d.dependents)
    this.addFact('employmentStatus', d.employmentStatus)
    this.addFact('education', d.education)
    this.addFact('maritalStatus', d.maritalStatus)

    const struggles = []
    if ((d.foodSecurity || 5) <= 2) struggles.push('food_insecurity')
    if ((d.housingSecurity || 5) <= 2) struggles.push('housing_instability')
    if ((d.mentalHealth || 5) <= 2) struggles.push('emotional_stress')
    if (d.totalIncome && d.totalExpenses && d.totalIncome < d.totalExpenses) struggles.push('budget_deficit')
    if ((d.debts || []).some(debt => parseFloat(debt.balance) > 0)) struggles.push('active_debts')
    if (struggles.length > 0) this.addFact('struggles', struggles)
  }

  recordAdvice(topic, advice) {
    this.adviceGiven.push({ topic, advice: advice.substring(0, 100), timestamp: Date.now() })
    if (this.adviceGiven.length > this.MAX_ADVICE_GIVEN) {
      this.adviceGiven.shift()
    }
  }

  hasDiscussed(topic) {
    return this.discussedTopics.has(topic)
  }

  addUnresolvedNeed(need) {
    if (!this.unresolvedNeeds.find(n => n === need)) {
      this.unresolvedNeeds.push(need)
    }
  }

  resolveNeed(need) {
    this.unresolvedNeeds = this.unresolvedNeeds.filter(n => n !== need)
  }

  updatePlanProgress(section, percent) {
    this.planProgress[section] = Math.min(100, Math.max(0, percent))
  }

  get overallPlanProgress() {
    const vals = Object.values(this.planProgress)
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }

  getStageAdvice() {
    const suggestions = {
      WELCOME: 'Ask about their current situation or guide them to start the assessment',
      NEEDS_CRITICAL: 'Focus on immediate survival needs — food, housing, health',
      FINANCIAL_REVIEW: 'Review income, expenses, debts, and savings',
      GOALS_REVIEW: 'Help set SMART goals for different timeframes',
      TOPIC_ADVICE: 'Provide targeted expert advice on the discussed topic',
      PLAN_BUILD: 'Generate a structured self-sufficiency plan',
      PLAN_REVIEW: 'Score and critique the existing plan',
      KNOWLEDGE_IMPORT: 'Process imported documents and update knowledge base',
      FOLLOW_UP: 'Check progress and offer encouragement',
    }
    return suggestions[this.stage] || ''
  }

  // NEW: Enhanced reasoning tracking
  recordIntents(intents) {
    this.recordedIntents.push({
      intents,
      timestamp: Date.now()
    })
    if (this.recordedIntents.length > 20) {
      this.recordedIntents.shift()
    }
  }

  recordSubtexts(subtexts) {
    this.recordedSubtexts.push({
      subtexts,
      timestamp: Date.now()
    })
    if (this.recordedSubtexts.length > 20) {
      this.recordedSubtexts.shift()
    }
  }

  recordResponseMode(responseMode) {
    this.recordedResponseModes.push({
      mode: responseMode,
      timestamp: Date.now()
    })
    if (this.recordedResponseModes.length > 20) {
      this.recordedResponseModes.shift()
    }
  }

  /**
   * ✅ STICKY MODE MANAGEMENT
   * Prevents unwanted mode resets on short / vague inputs
   */
  setActiveMode(type, confidence = 0.8) {
    this.currentMode = {
      type,
      confidence,
      lastUpdated: Date.now()
    }
    this.lastValidStage = this.stage
  }

  clearActiveMode() {
    this.currentMode = {
      type: null,
      confidence: 0,
      lastUpdated: null
    }
  }

  isInMode(modeType) {
    if (!this.currentMode.type) return false
    if (this.currentMode.type !== modeType) return false
    
    // Mode expires after 15 minutes of inactivity
    const age = Date.now() - this.currentMode.lastUpdated
    return age < 15 * 60 * 1000
  }

  isShortInput(text) {
    if (!text) return true
    const cleaned = text.trim().toLowerCase()
    return cleaned.length < 12 || cleaned.split(' ').length < 3
  }

  shouldPreserveMode() {
    return this.isInMode('EMOTIONAL_SUPPORT') || 
           this.isInMode('PLANNING') ||
           this.isInMode('REFLECTION')
  }

  getContextForNextResponse() {
    return {
      recentIntents: this.recordedIntents.slice(-3),
      recentSubtexts: this.recordedSubtexts.slice(-3),
      recentModes: this.recordedResponseModes.slice(-3),
      sentiment: this.sentiment,
      stage: this.stage,
      currentMode: this.currentMode,
      lastEmotionalState: this.lastEmotionalState
    }
  }
}
