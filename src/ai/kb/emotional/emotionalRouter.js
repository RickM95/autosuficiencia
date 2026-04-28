import emotionalStates from './emotional_states.json'
import intentClassifier from './intent_classifier.json'
import preStateRouter from './pre_state_router.json'
import responseStrategies from './response_strategy_kb.json'
import modeSwitching from './conversational_mode_switching.json'

export class EmotionalRouter {
  constructor() {
    this.states = emotionalStates.states
    this.classifier = intentClassifier
    this.router = preStateRouter
    this.strategies = responseStrategies.strategies
    this.modes = modeSwitching.modes
    this.lastMode = null
  }

  route(input) {
    const classification = this._classifyIntent(input)
    const matchingStates = this._matchEmotionalStates(input)
    const routingDecision = this._applyPreStateRouter(classification, matchingStates)

    return {
      classification,
      matchingStates,
      routingDecision,
      mode: routingDecision.mode,
      shouldBlockDevTrigger: routingDecision.block_triggers.includes('dev_agent'),
      shouldBlockPlanForce: routingDecision.block_triggers.includes('plan_modification'),
      isEmotional: matchingStates.length > 0,
      responseStrategy: matchingStates.length > 0 ? this._getStrategy(matchingStates[0]) : null,
    }
  }

  _classifyIntent(input) {
    if (!input) return { intent: 'unknown', confidence: 0 }
    const lower = input.toLowerCase()

    for (const categoryName of this.classifier.classification_order) {
      const category = this.classifier.categories[categoryName]
      if (!category) continue

      let matchCount = 0
      for (const phrase of category.trigger_phrases) {
        if (lower.includes(phrase.toLowerCase())) {
          matchCount++
        }
      }

      if (matchCount > 0) {
        const confidenceRules = category.confidence_rules
        let maxConfidence = 0
        for (const [, val] of Object.entries(confidenceRules)) {
          maxConfidence = Math.max(maxConfidence, val)
        }
        const adjustedConfidence = Math.min(1, maxConfidence * (matchCount / Math.max(1, category.trigger_phrases.length * 0.3)))
        return { intent: categoryName, confidence: Math.round(adjustedConfidence * 100) / 100, matchCount, routing: category.routing_destination }
      }
    }

    return { intent: 'unknown', confidence: 0.4 }
  }

  _matchEmotionalStates(input) {
    if (!input) return []
    const lower = input.toLowerCase()
    const matched = []

    for (const state of this.states) {
      for (const signal of state.intent_signals) {
        if (lower.includes(signal.toLowerCase())) {
          matched.push(state.state)
          break
        }
      }
      if (!matched.includes(state.state)) {
        for (const indicator of state.indicators) {
          if (lower.includes(indicator.toLowerCase())) {
            matched.push(state.state)
            break
          }
        }
      }
    }

    return matched
  }

  _applyPreStateRouter(classification, matchedStates) {
    const classifiedIntent = classification.intent
    const isEmotional = matchedStates.length > 0
    const confidence = classification.confidence
    const routes = this.router.routing_rules.sort((a, b) => a.priority - b.priority)

    for (const rule of routes) {
      const condition = rule.condition
        .replace('classified_intent', `'${classifiedIntent}'`)
        .replace('no_emotional_signals == true', String(!isEmotional))
        .replace('confidence < 0.6', String(confidence < 0.6))
        .replace(' OR ', ' || ')
        .replace(' AND ', ' && ')

      try {
        const result = eval(condition)
        if (result) {
          const modeConfig = this.modes[rule.route_to]
          return {
            mode: rule.route_to,
            modeConfig: modeConfig || null,
            block_triggers: rule.block_triggers,
            enforce: rule.enforce,
            matched_rule: rule.id,
          }
        }
      } catch {
        // condition evaluation failed — skip rule
      }
    }

    const defaultRule = routes.find(r => r.id === 'unclear_default')
    const modeConfig = this.modes[defaultRule.route_to]
    return {
      mode: defaultRule.route_to,
      modeConfig: modeConfig || null,
      block_triggers: defaultRule.block_triggers,
      enforce: defaultRule.enforce,
      matched_rule: 'unclear_default',
    }
  }

  _getStrategy(stateName) {
    for (const [strategyId, strategy] of Object.entries(this.strategies)) {
      if (strategy.applicable_to && strategy.applicable_to.includes(stateName)) {
        return {
          id: strategyId,
          style: strategy.style,
          doNot: strategy.do_not,
          templates: strategy.response_templates,
          followUp: strategy.follow_up,
        }
      }
    }
    return null
  }

  getResponseTemplate(strategy, lang) {
    if (!strategy || !strategy.templates) return null
    const templates = strategy.templates[lang] || strategy.templates.en
    if (!templates || templates.length === 0) return null
    return templates[Math.floor(Math.random() * templates.length)]
  }
}
