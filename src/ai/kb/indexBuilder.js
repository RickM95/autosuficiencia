export function buildIndexes({ domains, masterIndex, rules }) {
  const triggerToActions = new Map()
  const actionById = new Map()
  const domainToActions = new Map()
  const priorityGroups = new Map()
  const triggerToDomain = new Map()
  const stageToActions = new Map()
  const intentToAction = new Map()

  for (const [domainName, domain] of Object.entries(domains)) {
    const domainActions = domain.actions || []
    domainToActions.set(domainName, domainActions)

    for (const action of domainActions) {
      if (!action.id) continue

      actionById.set(action.id, {
        ...action,
        _domain: domainName,
      })

      const p = action.priority || 99
      if (!priorityGroups.has(p)) priorityGroups.set(p, [])
      priorityGroups.get(p).push(action)

      if (action.triggers) {
        for (const trigger of action.triggers) {
          if (!triggerToActions.has(trigger)) triggerToActions.set(trigger, [])
          triggerToActions.get(trigger).push(action)
          triggerToDomain.set(trigger, domainName)
        }
      }
    }
  }

  if (masterIndex) {
    for (const [intent, config] of Object.entries(masterIndex.triggers || {})) {
      if (config.action) {
        intentToAction.set(intent, config.action)
      }
      if (config.stage) {
        if (!stageToActions.has(config.stage)) stageToActions.set(config.stage, [])
        const action = actionById.get(config.action)
        if (action) stageToActions.get(config.stage).push(action)
      }
    }
  }

  for (const rule of rules || []) {
    if (rule.override) {
      const actionMatch = rule.override.match(/force_action\((\w+)\)/)
      if (actionMatch) {
        const forcedActionId = actionMatch[1]
        if (!triggerToActions.has(`rule:${rule.id}`)) triggerToActions.set(`rule:${rule.id}`, [])
        const action = actionById.get(forcedActionId) || { id: forcedActionId, _domain: 'rules', priority: rule.priority || 99 }
        triggerToActions.get(`rule:${rule.id}`).push(action)
      }
    }
  }

  const sortedPriorities = [...priorityGroups.keys()].sort((a, b) => a - b)

  return {
    triggerToActions,
    actionById,
    domainToActions,
    priorityGroups,
    sortedPriorities,
    triggerToDomain,
    stageToActions,
    intentToAction,
    actionCount: actionById.size,
    domainCount: domainToActions.size,
    triggerCount: triggerToActions.size,
    ruleCount: rules ? rules.length : 0,
    buildTime: Date.now(),
  }
}

export function getActionsByTrigger(indexes, triggerString) {
  if (!indexes || !indexes.triggerToActions) return []
  return indexes.triggerToActions.get(triggerString) || []
}

export function getActionsByDomain(indexes, domainName) {
  if (!indexes || !indexes.domainToActions) return []
  return indexes.domainToActions.get(domainName) || []
}

export function getHighPriorityActions(indexes, limit = 5) {
  if (!indexes || !indexes.sortedPriorities) return []
  const results = []
  for (const priority of indexes.sortedPriorities) {
    const actions = indexes.priorityGroups.get(priority) || []
    for (const action of actions) {
      results.push(action)
      if (results.length >= limit) return results
    }
  }
  return results
}

export function getActionById(indexes, actionId) {
  if (!indexes || !indexes.actionById) return null
  return indexes.actionById.get(actionId) || null
}

export function queryByTriggers(indexes, triggerContext = {}) {
  if (!indexes || !indexes.triggerToActions) return []
  const matched = []
  const seen = new Set()

  const triggerKeys = Object.keys(triggerContext)
  if (triggerKeys.length === 0) {
    return getHighPriorityActions(indexes, 5)
  }

  for (const [, actions] of indexes.triggerToActions.entries()) {
    for (const action of actions) {
      if (seen.has(action.id)) continue
      matched.push(action)
      seen.add(action.id)
    }
  }

  return matched.sort((a, b) => (a.priority || 99) - (b.priority || 99)).slice(0, 10)
}

export function getStageActions(indexes, stage) {
  if (!indexes || !indexes.stageToActions) return []
  return indexes.stageToActions.get(stage) || []
}

export function getActionsByIntent(indexes, intent) {
  if (!indexes || !indexes.intentToAction) return []
  const actionId = indexes.intentToAction.get(intent)
  if (!actionId) return []
  const action = indexes.actionById.get(actionId)
  return action ? [action] : []
}

export function getCriticalActions(indexes, threshold = 3) {
  if (!indexes || !indexes.priorityGroups) return []
  const results = []
  for (const p of indexes.sortedPriorities) {
    if (p > threshold) break
    const actions = indexes.priorityGroups.get(p) || []
    results.push(...actions)
  }
  return results
}
