import {
  getActionsByTrigger as idxGetActionsByTrigger,
  getActionsByDomain as idxGetActionsByDomain,
  getHighPriorityActions as idxGetHighPriorityActions,
  getActionById as idxGetActionById,
  queryByTriggers as idxQueryByTriggers,
  getStageActions as idxGetStageActions,
  getActionsByIntent as idxGetActionsByIntent,
} from './indexBuilder.js'

let _indexes = null

export function setQueryIndexes(indexes) {
  _indexes = indexes
}

export function getActionsByTrigger(trigger) {
  return idxGetActionsByTrigger(_indexes, trigger)
}

export function getActionsByDomain(domain) {
  return idxGetActionsByDomain(_indexes, domain)
}

export function getHighPriorityActions(limit = 5) {
  return idxGetHighPriorityActions(_indexes, limit)
}

export function getActionById(id) {
  return idxGetActionById(_indexes, id)
}

export function queryByTriggers(triggerContext = {}) {
  return idxQueryByTriggers(_indexes, triggerContext)
}

export function getStageActions(stage) {
  return idxGetStageActions(_indexes, stage)
}

export function getActionsByIntent(intent) {
  return idxGetActionsByIntent(_indexes, intent)
}

export function resolveActions(userInput, formData, memory) {
  const triggerCtx = {
    emergencyFundMonths: formData ? (parseFloat(formData.emergencyFund) || 0) / Math.max(1, parseFloat(formData.expFood) || 1) : undefined,
    hasDebt: formData && formData.debts ? formData.debts.some(d => parseFloat(d.balance) > 0) : undefined,
    sentiment: memory ? memory.sentiment : 'neutral',
    criticalCount: formData ? _countCriticalNeeds(formData) : 0,
  }

  const matched = queryByTriggers(triggerCtx)
  if (matched.length > 0) return matched

  return getHighPriorityActions(3)
}

function _countCriticalNeeds(formData) {
  if (!formData) return 0
  let count = 0
  if ((formData.foodSecurity || 5) <= 2) count++
  if ((formData.housingSecurity || 5) <= 2) count++
  if ((formData.healthStatus || 5) <= 2) count++
  if ((formData.mentalHealth || 5) <= 2) count++
  return count
}

export function getActionSummary(action) {
  if (!action) return null
  return {
    id: action.id,
    domain: action._domain || 'unknown',
    priority: action.priority || 99,
    triggers: action.triggers || [],
    stepsEn: Array.isArray(action.steps_en) ? action.steps_en.length : 0,
    stepsEs: Array.isArray(action.steps_es) ? action.steps_es.length : 0,
  }
}

export function getIndexStats() {
  if (!_indexes) {
    return { loaded: false, actionCount: 0, domainCount: 0, triggerCount: 0 }
  }
  return {
    loaded: true,
    actionCount: _indexes.actionCount,
    domainCount: _indexes.domainCount,
    triggerCount: _indexes.triggerCount,
    ruleCount: _indexes.ruleCount,
    buildTime: _indexes.buildTime,
  }
}

export function getCriticalActions(threshold = 3) {
  if (!_indexes || !_indexes.priorityGroups) return []
  const results = []
  for (const p of _indexes.sortedPriorities) {
    if (p > threshold) break
    const actions = _indexes.priorityGroups.get(p) || []
    results.push(...actions)
  }
  return results
}
