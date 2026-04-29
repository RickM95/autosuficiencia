/**
 * EmotionalIntelligence.js
 * 
 * Detects emotional state, intensity, and coping capacity.
 * Routes to appropriate intervention level based on emotional assessment.
 */

export class EmotionalIntelligence {
  static detect(userMessage, context = {}) {
    const emotions = this.detectEmotions(userMessage)
    const intensity = this.calculateIntensity(emotions, context)
    const copingCapacity = this.estimateCopingCapacity(context)
    const interventionNeed = this.determineInterventionNeed(intensity, copingCapacity)

    return {
      emotions,
      intensity,
      copingCapacity,
      interventionNeed,
      recommendations: this.getInterventionRecommendations(interventionNeed)
    }
  }

  static detectEmotions(message) {
    const msg = (message || '').toLowerCase()
    const emotions = []

    const patterns = {
      DESPERATION: {
        keywords: ['give up', 'surrender', "can't do it", 'hopeless', 'point of breaking', 'punto de quiebre', 'rendirse', 'no puedo', 'desesperado'],
        confidence: 0.9
      },
      ANXIETY: {
        keywords: ['worried', 'anxious', 'what if', 'afraid', 'preocupado', 'ansioso', 'miedo', 'qué pasa si'],
        confidence: 0.85
      },
      OVERWHELM: {
        keywords: ['too much', 'drowning', 'buried', 'overwhelmed', 'abrumado', 'enterrado', 'demasiado', 'sumergido'],
        confidence: 0.9
      },
      SHAME: {
        keywords: ['my fault', 'should have', 'fail', 'stupid', 'culpa mía', 'debería', 'fracaso', 'tonto'],
        confidence: 0.8
      },
      RESIGNATION: {
        keywords: ["doesn't matter", 'no use', 'what\'s the point', 'no sirve', 'para qué', 'no tiene sentido'],
        confidence: 0.85
      },
      FRUSTRATION: {
        keywords: ['frustrated', 'angry', 'fed up', 'furious', 'frustrado', 'enojado', 'harto'],
        confidence: 0.8
      },
      CONFUSION: {
        keywords: ['confused', 'don\'t understand', 'lost', 'unclear', 'confundido', 'no entiendo', 'perdido'],
        confidence: 0.75
      },
      HOPE: {
        keywords: ['can do', 'possible', 'maybe', 'try', 'puedo', 'posible', 'quizás', 'intentar'],
        confidence: 0.7
      },
      GRATITUDE: {
        keywords: ['thanks', 'appreciate', 'grateful', 'gracias', 'aprecio', 'agradecido'],
        confidence: 0.8
      }
    }

    for (const [emotion, config] of Object.entries(patterns)) {
      for (const keyword of config.keywords) {
        if (msg.includes(keyword)) {
          emotions.push({
            emotion,
            confidence: config.confidence,
            trigger: keyword
          })
          break
        }
      }
    }

    return emotions
  }

  static calculateIntensity(emotions, context = {}) {
    if (emotions.length === 0) return 0

    let totalIntensity = 0
    const weights = {
      DESPERATION: 10,
      OVERWHELM: 9,
      ANXIETY: 7,
      FRUSTRATION: 6,
      SHAME: 6,
      RESIGNATION: 8,
      CONFUSION: 5,
      HOPE: -2,
      GRATITUDE: -3
    }

    for (const em of emotions) {
      const weight = weights[em.emotion] || 5
      const confidence = em.confidence || 0.5
      totalIntensity += weight * confidence
    }

    // Boost intensity if context indicates crisis
    if (context.housingSecurity <= 1 || context.foodSecurity <= 1) totalIntensity += 3
    if (context.sentiment === 'CRISIS') totalIntensity += 5

    return Math.min(10, Math.round(totalIntensity * 10) / 10)
  }

  static estimateCopingCapacity(context = {}) {
    let capacity = 5 // Base capacity (scale 0-10)

    // Increase capacity if user has resources
    if (context.skills && context.skills.length > 0) capacity += 1
    if (context.communityResources && context.communityResources.length > 0) capacity += 1
    if (context.familySupport) capacity += 1.5
    if (context.hasJob) capacity += 1

    // Decrease capacity if user in stress
    if (context.sentiment === 'OVERWHELMED') capacity -= 2
    if (context.sentiment === 'CRISIS') capacity -= 3
    if (context.hasDebt) capacity -= 0.5
    if (!context.hasEmergencyFund) capacity -= 1

    return Math.max(0, Math.min(10, capacity))
  }

  static determineInterventionNeed(intensity, copingCapacity) {
    if (intensity >= 8 && copingCapacity < 4) {
      return 'IMMEDIATE'
    }
    if (intensity >= 6) {
      return 'IMPORTANT'
    }
    if (intensity >= 3) {
      return 'SUPPORTIVE'
    }
    return 'NORMAL'
  }

  static getInterventionRecommendations(interventionNeed) {
    const recommendations = {
      IMMEDIATE: [
        { action: 'VALIDATE', description: 'Normalize what they feel' },
        { action: 'EMPATHY', description: 'Show you understand the weight of their situation' },
        { action: 'SAFE_QUESTION', description: 'Ask what would help most right now' },
        { action: 'RESOURCE', description: 'Connect to stress/crisis resources' },
        { action: 'MICRO_ACTION', description: 'Suggest ONE small achievable thing' }
      ],
      IMPORTANT: [
        { action: 'VALIDATE', description: 'Acknowledge feelings directly' },
        { action: 'NORMALIZE', description: 'Show others in similar situation' },
        { action: 'EMPOWER', description: 'Remind of what they CAN control' },
        { action: 'SMALL_STEP', description: 'Suggest minimal action' }
      ],
      SUPPORTIVE: [
        { action: 'ACKNOWLEDGE', description: 'Brief validation' },
        { action: 'ENCOURAGE', description: 'Show confidence in their ability' }
      ],
      NORMAL: [
        { action: 'DIRECT', description: 'Normal response, no emotional buffer' }
      ]
    }

    return recommendations[interventionNeed] || recommendations.NORMAL
  }

  static shouldBlockDevAgent(emotions) {
    // If user is in emotional crisis, don't suggest code modifications
    const criticalEmotions = ['DESPERATION', 'OVERWHELM', 'RESIGNATION', 'CRISIS']
    return emotions.some(e => criticalEmotions.includes(e.emotion))
  }
}
