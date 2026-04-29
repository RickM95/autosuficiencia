/**
 * ✅ USER RELATIONSHIP MODEL
 * 
 * Tracks and evolves the relationship between Nephi and the user
 * Learns user preferences, patterns and styles over time
 * Adapts behavior gradually and consistently
 */

export class UserRelationshipModel {
  constructor(memory) {
    this.memory = memory

    if (!this.memory.relationship) {
      this.memory.relationship = {
        trustLevel: 25,
        interactionCount: 0,
        communicationPreference: 'mixed',
        depthPreference: 'balanced',
        recurringThemes: [],
        stressPatterns: [],
        positiveMoments: [],
        emotionalHistory: [],
        evolutionHistory: []
      }
    }
  }

  recordInteraction(context) {
    this.memory.relationship.interactionCount++

    // Track emotional patterns
    if (context.emotionalState) {
      this.memory.relationship.emotionalHistory.push({
        state: context.emotionalState.state,
        intensity: context.emotionalState.intensity,
        timestamp: Date.now()
      })

      if (context.emotionalState.intensity > 0.7) {
        this.memory.relationship.stressPatterns.push({
          trigger: context.input,
          timestamp: Date.now()
        })
      }
    }

    // Evolve trust gradually
    if (this.memory.relationship.trustLevel < 100) {
      this.memory.relationship.trustLevel += 0.5
    }
  }

  getAdaptationGuidance() {
    const rel = this.memory.relationship

    return {
      trustLevel: rel.trustLevel,
      openess: Math.min(1, rel.trustLevel / 75),
      preferredStyle: rel.communicationPreference,
      depth: rel.depthPreference,
      shouldShareVulnerability: rel.trustLevel > 50,
      shouldBeDirect: rel.trustLevel > 70
    }
  }

  detectRecurringPatterns() {
    // Detect repeated stress triggers
    const stressFrequency = {}
    this.memory.relationship.stressPatterns.forEach(pattern => {
      const key = pattern.trigger.substring(0, 20)
      stressFrequency[key] = (stressFrequency[key] || 0) + 1
    })

    return Object.entries(stressFrequency)
      .filter(([k, v]) => v >= 2)
      .map(([trigger, count]) => ({ trigger, count }))
  }
}

export default UserRelationshipModel