/**
 * INTENT TREE — Replaces rigid 9-stage system
 * Weighted, hierarchical intent matching with multi-intent support
 * 
 * Benefits:
 * - No stage logic in ReasoningEngine
 * - Easy to add new intents (just extend tree)
 * - Multi-intent support (pick top 3)
 * - Clear decision reasoning
 */

export class IntentTree {
  static buildIntentTree() {
    return {
      root: {
        question: "What is the user's primary need?",
        branches: [
          // HIGHEST PRIORITY: Crisis/Immediate Safety
          {
            id: "immediate_crisis",
            label: "Immediate Crisis",
            triggers: [
              { condition: (ctx) => ctx.formData?.housing_security <= 1, weight: 100, description: "No housing" },
              { condition: (ctx) => ctx.formData?.food_security <= 1, weight: 100, description: "Food insecurity" },
              { condition: (ctx) => ctx.sentiment === 'CRISIS', weight: 90, description: "Crisis emotional state" },
              { condition: (ctx) => ctx.message?.includes('suicide') || ctx.message?.includes('suicidio'), weight: 100, description: "Self-harm mention" },
              { condition: (ctx) => ctx.message?.includes('give up') || ctx.message?.includes('me rindo'), weight: 80, description: "Giving up" }
            ],
            routing: "IMMEDIATE_SUPPORT",
            actions: ["validate_feelings", "acknowledge_crisis", "connect_resources", "micro_action"]
          },

          // HIGH PRIORITY: Emotional Overwhelm
          {
            id: "emotional_overwhelm",
            label: "Emotional Overwhelm",
            triggers: [
              { condition: (ctx) => ctx.sentiment === 'SEVERE_STRESS' || ctx.sentiment === 'HIGH_STRESS', weight: 85, description: "High stress detected" },
              { condition: (ctx) => /\b(don't know|confused|overwhelmed|buried|drowning|lost)\b/i.test(ctx.message), weight: 75, description: "Overwhelm keywords" },
              { condition: (ctx) => /\b(abrumado|perdido|no sé qué hacer|enterrado)\b/i.test(ctx.message), weight: 75, description: "Spanish overwhelm markers" }
            ],
            routing: "EMOTIONAL_FIRST",
            actions: ["validate_feelings", "normalize_situation", "ask_clarifying_question", "suggest_small_step"]
          },

          // MEDIUM-HIGH PRIORITY: Financial Crisis
          {
            id: "financial_crisis",
            label: "Financial Crisis (Current)",
            triggers: [
              { condition: (ctx) => ctx.analysis?.incomeVsExpenses < 0.8, weight: 70, description: "Severe overspending" },
              { condition: (ctx) => ctx.analysis?.debtPaymentRatio > 0.7, weight: 75, description: "Debt consuming 70%+ income" },
              { condition: (ctx) => ctx.message?.includes('debt') || ctx.message?.includes('deuda'), weight: 40, description: "Debt mentioned" }
            ],
            routing: "FINANCIAL_INTERVENTION",
            actions: ["assess_income_expenses", "identify_cuts", "build_debt_strategy", "set_targets"]
          },

          // MEDIUM PRIORITY: Emotional + Financial Combined
          {
            id: "stressed_and_struggling",
            label: "Stressed AND Financially Struggling",
            triggers: [
              { condition: (ctx) => ctx.sentiment !== 'NEUTRAL' && ctx.analysis?.incomeVsExpenses < 0.95, weight: 70, description: "Emotional + financial" }
            ],
            routing: "HOLISTIC_SUPPORT",
            actions: ["validate_stress", "acknowledge_financial_reality", "separate_immediate_from_planning", "offer_both_resources"]
          },

          // MEDIUM PRIORITY: Financial Planning (Healthy Situation)
          {
            id: "financial_planning",
            label: "Financial Planning & Improvement",
            triggers: [
              { condition: (ctx) => /\b(plan|budget|save|invest|goal|estrategia)\b/i.test(ctx.message), weight: 50, description: "Planning keywords" },
              { condition: (ctx) => /\b(plan|presupuesto|ahorrar|meta|estrategia)\b/i.test(ctx.message), weight: 50, description: "Spanish planning keywords" },
              { condition: (ctx) => ctx.analysis?.incomeVsExpenses > 1.0, weight: 60, description: "Income exceeds expenses (surplus)" }
            ],
            routing: "FINANCIAL_COACHING",
            actions: ["analyze_current_position", "identify_opportunities", "build_growth_plan", "set_milestones"]
          },

          // LOW-MEDIUM PRIORITY: Goal Setting
          {
            id: "goal_setting",
            label: "Goal Setting & Vision",
            triggers: [
              { condition: (ctx) => ctx.message?.includes('goal') || ctx.message?.includes('dream') || ctx.message?.includes('future'), weight: 40, description: "Future/goal talk" },
              { condition: (ctx) => ctx.message?.includes('meta') || ctx.message?.includes('sueño') || ctx.message?.includes('futuro'), weight: 40, description: "Spanish future talk" },
              { condition: (ctx) => ctx.formData?.goals_clarity > 0.7, weight: 50, description: "Goals already defined" }
            ],
            routing: "GOAL_COACHING",
            actions: ["clarify_vision", "make_goals_specific", "break_into_steps", "celebrate_progress"]
          },

          // LOW-MEDIUM PRIORITY: Knowledge/Learning Request
          {
            id: "learning_request",
            label: "Learning & Education",
            triggers: [
              { condition: (ctx) => /\b(how|why|teach|explain|learn|understand)\b/i.test(ctx.message), weight: 35, description: "Educational question" },
              { condition: (ctx) => /\b(cómo|por qué|enseña|explica|aprende|entiende)\b/i.test(ctx.message), weight: 35, description: "Spanish educational" }
            ],
            routing: "EDUCATIONAL",
            actions: ["explain_concept", "use_examples", "break_into_chunks", "offer_resources"]
          },

          // LOW PRIORITY: General Conversation/Check-in
          {
            id: "general_conversation",
            label: "General Conversation & Check-in",
            triggers: [
              { condition: (ctx) => ctx.message?.length < 20, weight: 10, description: "Very short message (likely check-in)" },
              { condition: (ctx) => ctx.interactionCount > 10, weight: 20, description: "Established conversation" }
            ],
            routing: "CONVERSATIONAL",
            actions: ["acknowledge_message", "check_progress", "offer_guidance", "ask_next_focus"]
          }
        ]
      }
    }
  }

  /**
   * Evaluate intent tree against context
   * Returns: array of matched intents, sorted by relevance score
   */
  evaluate(userMessage, formData, analysis, memory) {
    const context = {
      message: userMessage,
      formData,
      analysis,
      sentiment: analysis?.sentiment,
      interactionCount: memory?.interactionCount || 0
    }

    const matches = []

    // Walk tree and evaluate all triggers
    this.tree.root.branches.forEach(branch => {
      let branchScore = 0
      const triggersMatched = []

      branch.triggers.forEach(trigger => {
        try {
          const conditionMet = trigger.condition(context)
          if (conditionMet) {
            branchScore += trigger.weight
            triggersMatched.push(trigger.description)
          }
        } catch (err) {
          // Silent fail on condition evaluation
        }
      })

      if (branchScore > 0) {
        matches.push({
          id: branch.id,
          label: branch.label,
          routing: branch.routing,
          actions: branch.actions,
          score: branchScore,
          triggersMatched,
          confidence: Math.min(branchScore / 100, 1.0)  // Normalize to 0-1
        })
      }
    })

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score)
  }

  /**
   * Get top N intents, with weighting for multi-intent scenarios
   */
  getTopIntents(matches, count = 3) {
    if (matches.length === 0) {
      // Fallback intent (should rarely happen)
      return [{
        id: "conversation",
        label: "General Support",
        routing: "CONVERSATIONAL",
        actions: ["listen", "ask_clarifying_question"],
        score: 0,
        confidence: 0
      }]
    }

    return matches.slice(0, count)
  }

  /**
   * Determine PRIMARY intent for routing
   * (Uses top intent for initial routing decision)
   */
  getPrimaryIntent(matches) {
    return matches.length > 0 ? matches[0] : null
  }

  /**
   * Get intent explanation (for transparency in UI)
   */
  explainIntent(intent) {
    return {
      label: intent.label,
      why: intent.triggersMatched,
      confidence: Math.round(intent.confidence * 100),
      actions: intent.actions
    }
  }
}

// Export singleton instance
export const intentTree = new IntentTree()
