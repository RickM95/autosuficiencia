import {
  validateKBStructure, validateActions, validateIndex, validateRules,
  validateSchemas, validateBilingualFields, validateTriggers,
} from './validator.js'
import { getIndexes, getDomains, getMasterIndex, getRules, getSchemas } from './loader.js'

const SEVERITY_WEIGHTS = { low: 3, medium: 8, high: 15, critical: 25 }

// ═══════════════════════════════════════════════════════════════
// 1. analyzeKB() — Full structured diagnostic
// ═══════════════════════════════════════════════════════════════

export function analyzeKB() {
  const domains = getDomains()
  const masterIndex = getMasterIndex()
  const rules = getRules()
  const indexes = getIndexes()
  const schemas = getSchemas()

  const issues = []
  const warnings = []
  const orphanActions = []
  const missingReferences = []
  const bilingualGaps = []
  const triggerConflicts = []
  const schemaViolations = []
  const structureErrors = []
  const ruleIssues = []

  const structureResult = validateKBStructure(domains)
  for (const err of structureResult.errors) structureErrors.push(err)
  for (const warn of structureResult.warnings) warnings.push(warn)

  const actionsResult = validateActions(domains)
  const knownIds = actionsResult.actionIds
  for (const err of actionsResult.errors) issues.push(err)
  for (const warn of actionsResult.warnings) warnings.push(warn)

  const indexResult = validateIndex(masterIndex, knownIds)
  for (const err of indexResult.errors) {
    issues.push(err)
    if (err.includes('ORPHAN_ACTION_REF')) missingReferences.push(err)
  }
  for (const warn of indexResult.warnings) {
    warnings.push(warn)
    if (warn.includes('ORPHAN_ACTION')) orphanActions.push(warn)
  }

  const rulesResult = validateRules(rules)
  for (const err of rulesResult.errors) ruleIssues.push(err)
  for (const warn of rulesResult.warnings) warnings.push(warn)

  const bilingualResult = validateBilingualFields(domains)
  for (const err of bilingualResult.errors) bilingualGaps.push(err)

  const triggerResult = validateTriggers(masterIndex, knownIds)
  for (const err of triggerResult.errors) triggerConflicts.push(err)

  const schemaResult = validateSchemas(schemas)
  for (const err of schemaResult.errors) schemaViolations.push(err)
  for (const warn of schemaResult.warnings) warnings.push(warn)

  if (indexes) {
    const stageMap = masterIndex ? masterIndex.stage_map : null
    if (stageMap) {
      for (const [stage, config] of Object.entries(stageMap)) {
        if (!config.priority) warnings.push(`STAGE_NO_PRIORITY: Stage "${stage}" has no priority`)
        if (!config.fallback_domain) warnings.push(`STAGE_NO_FALLBACK: Stage "${stage}" has no fallback domain`)
      }
    }
  }

  return {
    issues,
    warnings,
    orphanActions,
    missingReferences,
    bilingualGaps,
    triggerConflicts,
    schemaViolations,
    structureErrors,
    ruleIssues,
    totalIssues: issues.length + structureErrors.length + ruleIssues.length,
    totalWarnings: warnings.length,
    checkedAt: Date.now(),
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. classifyIssues() — Classifies every issue with metadata
// ═══════════════════════════════════════════════════════════════

const CLASSIFIERS = [
  {
    pattern: /^(MISSING_ES|MISSING_EN|MISSING_NAME_ES|MISSING_NAME_EN|MISSING_TREE_ES|MISSING_TREE_EN)/,
    classify: (match) => ({
      type: 'error',
      severity: 'medium',
      location: match[0].includes('TREE') ? 'domain.decision_trees[]' : 'domain.actions[].steps_en/es',
      impact: 'User-facing text will be missing for one language group. Bilingual users will see incomplete content.',
    }),
  },
  {
    pattern: /^MISSING_ACTION_REF:/,
    classify: () => ({
      type: 'error', severity: 'high', location: 'master_index.json triggers[]',
      impact: 'A trigger references a non-existent action — user intent will map to nothing, causing silent fallback.',
    }),
  },
  {
    pattern: /^ORPHAN_ACTION_REF:/,
    classify: () => ({
      type: 'error', severity: 'high', location: 'master_index.json → /core domains cross-ref',
      impact: 'master_index references action ID that has no matching definition in any /core domain file. This trigger will never produce a valid response.',
    }),
  },
  {
    pattern: /^ORPHAN_ACTION:/,
    classify: () => ({
      type: 'warning', severity: 'low', location: '/core domains → master_index.json cross-ref',
      impact: 'Action exists in domain but no trigger can reach it. Action is dead code and unreachable by users.',
    }),
  },
  {
    pattern: /^MISSING_DOMAIN:/,
    classify: () => ({
      type: 'error', severity: 'high', location: 'master_index.json → /core/ directory',
      impact: 'Trigger references a domain directory that does not exist — all actions in that domain are unreachable.',
    }),
  },
  {
    pattern: /^MISSING_ACTION_FIELD:/,
    classify: (match) => {
      const field = match[2] || 'unknown'
      const sev = ['id', 'triggers', 'priority'].includes(field) ? 'high' : 'medium'
      return {
        type: 'error', severity: sev, location: `domain.actions[].${field}`,
        impact: sev === 'high'
          ? `Action is missing required field "${field}" — system may fail to load or execute this action.`
          : `Action is missing "${field}" — behavior may degrade.`,
      }
    },
  },
  {
    pattern: /^NO_TRIGGERS:/,
    classify: () => ({
      type: 'warning', severity: 'medium', location: 'domain.actions[].triggers',
      impact: 'Action has no trigger conditions — it will never be selected by the trigger matching engine. Unreachable.',
    }),
  },
  {
    pattern: /^DUPLICATE_ID:/,
    classify: () => ({
      type: 'error', severity: 'high', location: 'domain.actions[].id',
      impact: 'Two or more actions share the same id — lookups will return unpredictable results. This will cause silent logic errors.',
    }),
  },
  {
    pattern: /^MISSING_KEY:/,
    classify: (match) => ({
      type: 'error', severity: 'high', location: `domain.${match[1] || 'unknown'}`,
      impact: `Domain is missing required section "${match[1] || 'unknown'}". Validation will reject this domain entirely.`,
    }),
  },
  {
    pattern: /^MISSING_CONDITION:/,
    classify: () => ({
      type: 'error', severity: 'high', location: 'rules[].condition',
      impact: 'Rule has no condition string — it can never evaluate. This rule is dead code.',
    }),
  },
  {
    pattern: /^MISSING_OVERRIDE:/,
    classify: () => ({
      type: 'error', severity: 'high', location: 'rules[].override',
      impact: 'Rule has no override action — even if condition matches, nothing happens. Rule is useless.',
    }),
  },
  {
    pattern: /^INVALID_PRIORITY:/,
    classify: () => ({
      type: 'error', severity: 'medium', location: 'domain.actions[].priority or rules[].priority',
      impact: 'Priority must be numeric. Non-numeric priority will sort to default (99), potentially changing execution order.',
    }),
  },
  {
    pattern: /^NONSTANDARD_ID:/,
    classify: () => ({
      type: 'warning', severity: 'low', location: 'domain.actions[].id',
      impact: 'ID does not follow "domain.name" convention. This will not break execution but may confuse developers.',
    }),
  },
  {
    pattern: /^NO_DOMAINS:/,
    classify: () => ({
      type: 'error', severity: 'critical', location: '/core/ directory',
      impact: 'No domain files found. The KB is completely empty — system cannot function.',
    }),
  },
  {
    pattern: /^MISSING_TRIGGERS:/,
    classify: () => ({
      type: 'error', severity: 'critical', location: 'master_index.json',
      impact: 'master_index.json has no triggers section — no user intent can be routed to any action. System is non-functional.',
    }),
  },
  {
    pattern: /^MISSING_STAGE_MAP:/,
    classify: () => ({
      type: 'warning', severity: 'low', location: 'master_index.json',
      impact: 'No stage_map defined — all states will fall back to WELCOME. State transitions will degrade.',
    }),
  },
  {
    pattern: /^MISSING_RULE_ID:/,
    classify: () => ({
      type: 'warning', severity: 'low', location: 'rules[].id',
      impact: 'Rule without an id cannot be referenced in logs or debugging output.',
    }),
  },
  {
    pattern: /^NO_SCHEMAS:/,
    classify: () => ({
      type: 'warning', severity: 'low', location: '/schemas/ directory',
      impact: 'No schema files found. Plan generation will lack validation but still produce output.',
    }),
  },
  {
    pattern: /^STAGE_NO_PRIORITY:/,
    classify: (match) => ({
      type: 'warning', severity: 'low', location: `master_index.json stage_map.${match[1] || 'unknown'}`,
      impact: 'Stage without priority cannot participate in priority-based stage transitions.',
    }),
  },
]

export function classifyIssues(issueText) {
  for (const classifier of CLASSIFIERS) {
    const match = issueText.match(classifier.pattern)
    if (match) {
      const base = classifier.classify(match)
      const location = base.location || 'unknown'
      const explanation = base.impact
        ? `${base.impact} (${issueText.substring(0, 120)})`
        : issueText.substring(0, 200)

      return {
        type: base.type,
        severity: base.severity,
        location,
        explanation,
        impact: base.impact || 'Unknown impact — review manually',
        weight: SEVERITY_WEIGHTS[base.severity] || 5,
      }
    }
  }

  return {
    type: 'unknown',
    severity: 'medium',
    location: 'unresolved',
    explanation: issueText.substring(0, 200),
    impact: 'Could not auto-classify — requires manual review',
    weight: 5,
  }
}

export function classifyAll(analysisResult) {
  const allIssues = [
    ...(analysisResult.issues || []),
    ...(analysisResult.structureErrors || []),
    ...(analysisResult.ruleIssues || []),
    ...(analysisResult.schemaViolations || []),
    ...(analysisResult.warnings || []).map(w => `WARNING: ${w}`),
  ]
  return allIssues.map(i => classifyIssues(i))
}

// ═══════════════════════════════════════════════════════════════
// 3. suggestFixes() — Root cause, steps, corrected JSON
// ═══════════════════════════════════════════════════════════════

export function suggestFixes(issue) {
  const suggestions = []

  if (issue.includes('MISSING_ES') || issue.includes('MISSING_EN')) {
    const actionId = (issue.match(/Action "([^"]+)"/) || [])[1] || 'unknown'
    const isSteps = issue.includes('steps')
    const isEs = issue.includes('MISSING_ES')
    const missingField = isSteps ? (isEs ? 'steps_es' : 'steps_en') : (isEs ? 'name_es' : 'name_en')
    const presentField = isSteps ? (isEs ? 'steps_en' : 'steps_es') : (isEs ? 'name_en' : 'name_es')
    const lang = isEs ? 'Spanish' : 'English'
    suggestions.push({
      rootCause: `Action "${actionId}" has "${presentField}" but is missing "${missingField}". A "${missingField}" array is required for ${lang} language support.`,
      fixSteps: [
        `Locate action "${actionId}" in the appropriate /core domain file`,
        `Add the missing "${missingField}" field as an array of strings`,
        `Translate each step from ${isEs ? 'English' : 'Spanish'} to ${lang}`,
        `Verify the array length matches "${presentField}"`,
      ],
      correctedJson: `"${missingField}": [${isSteps ? `\n  "${isEs ? 'Translated step 1' : 'Step 1 in English'}",\n  "${isEs ? 'Translated step 2' : 'Step 2 in English'}"\n` : ' "Translated name"\n'}]`,
    })
  }

  if (issue.includes('ORPHAN_ACTION_REF')) {
    const actionId = (issue.match(/references action "([^"]+)"/) || [])[1] || 'unknown'
    const domainGuess = actionId.includes('.') ? actionId.split('.')[0] : 'unknown'
    suggestions.push({
      rootCause: `master_index.json trigger references action "${actionId}" which has no definition in any /core/*.json domain file. The trigger can never produce a response.`,
      fixSteps: [
        `Decide: should action "${actionId}" be created, or should the trigger point to an existing action?`,
        `To create: add an action with id "${actionId}" to the "${domainGuess}" domain in /core/${domainGuess}.json`,
        `To re-route: change the "action" field in master_index.json to an existing action id`,
        `Run validation again to confirm the fix`,
      ],
      correctedJson: `// Option A: Add to core action\n{ "id": "${actionId}", "triggers": ["trigger_condition"], "steps_en": ["Step 1"], "steps_es": ["Paso 1"], "priority": 5 }\n\n// Option B: Fix trigger reference\n"${(issue.match(/Trigger "([^"]+)"/) || [])[1] || 'trigger_name'}": { "domain": "${domainGuess}", "action": "existing_action_id", ... }`,
    })
  }

  if (issue.includes('ORPHAN_ACTION:')) {
    const actionId = (issue.match(/Action "([^"]+)"/) || [])[1] || 'unknown'
    suggestions.push({
      rootCause: `Action "${actionId}" exists in a /core domain file but no trigger in master_index.json references it. It is unreachable by users.`,
      fixSteps: [
        `Identify the intent this action should respond to`,
        `Add a new trigger entry in master_index.json's "triggers" section`,
        `Set "action" to "${actionId}"`,
        `Add relevant keywords for intent matching`,
      ],
      correctedJson: `"auto_${actionId.replace(/[^a-z0-9_]/gi, '_')}": {\n  "domain": "${(issue.match(/exists in/) ? 'domain' : 'domain')}",\n  "action": "${actionId}",\n  "keywords": ["relevant", "keywords", "here"],\n  "stage": "TOPIC_ADVICE"\n}`,
    })
  }

  if (issue.includes('MISSING_DOMAIN:')) {
    const domainName = (issue.match(/Domain "([^"]+)"/) || [])[1] || 'unknown'
    suggestions.push({
      rootCause: `master_index.json references domain "${domainName}" but no file exists at /core/${domainName}.json. All triggers pointing to this domain will fail.`,
      fixSteps: [
        `Create file /core/${domainName}.json with the required KB structure`,
        `Include at minimum: domain, principles[], decision_trees[], actions[], metrics{}`,
        `Or: update the trigger to reference an existing domain like "finances", "wellbeing", or "goals"`,
      ],
      correctedJson: `{\n  "domain": "${domainName}",\n  "principles": [],\n  "decision_trees": [],\n  "actions": [],\n  "metrics": {}\n}`,
    })
  }

  if (issue.includes('MISSING_ACTION_FIELD:')) {
    const actionMatch = issue.match(/Action "([^"]+)" is missing "([^"]+)"/)
    const actionId = (actionMatch || [])[1] || 'unknown'
    const field = (actionMatch || [])[2] || 'unknown'
    const defaultValue = field === 'priority' ? '5' : field === 'triggers' ? '["condition_here"]' : '["value"]'
    suggestions.push({
      rootCause: `Action "${actionId}" is missing required field "${field}". The KB validation requires this field for the action to be loadable.`,
      fixSteps: [
        `Locate action "${actionId}" in the appropriate domain file`,
        `Add the "${field}" field with an appropriate value`,
        `For "${field}", a typical value is: ${defaultValue}`,
      ],
      correctedJson: `"${field}": ${defaultValue}`,
    })
  }

  if (issue.includes('NO_TRIGGERS:')) {
    const actionId = (issue.match(/Action "([^"]+)"/) || [])[1] || 'unknown'
    suggestions.push({
      rootCause: `Action "${actionId}" has no "triggers" array. The trigger engine cannot select this action because it has no conditions to evaluate.`,
      fixSteps: [
        `Define the condition(s) under which this action should fire`,
        `Add a "triggers" array with at least one string condition`,
        `Conditions use dot-path notation: "userField > value"`,
        `Multiple conditions can be combined with AND / OR`,
      ],
      correctedJson: `"triggers": ["analysisField > threshold"]`,
    })
  }

  if (issue.includes('DUPLICATE_ID:')) {
    const dupId = (issue.match(/id "([^"]+)"/) || [])[1] || 'unknown'
    suggestions.push({
      rootCause: `Two or more actions share the id "${dupId}". Action IDs must be globally unique across all domains.`,
      fixSteps: [
        `Search all /core/*.json files for "${dupId}"`,
        `Rename one of the actions to a unique id following "domain.unique_name" format`,
        `Update master_index.json if it references the renamed action`,
      ],
      correctedJson: `"id": "${dupId}_v2"  // or "${(getDomains() ? Object.keys(getDomains())[0] : 'domain')}.${dupId}"`,
    })
  }

  if (issue.includes('MISSING_KEY:')) {
    const key = (issue.match(/missing required key "([^"]+)"/) || [])[1] || 'unknown'
    const domainName = (issue.match(/Domain "([^"]+)"/) || [])[1] || 'unknown'
    const defaultValue = ['principles', 'decision_trees', 'actions'].includes(key) ? '[]' : '{}'
    suggestions.push({
      rootCause: `Domain "${domainName}" is missing the "${key}" section. Every domain file must include all required keys.`,
      fixSteps: [
        `Open /core/${domainName}.json`,
        `Add the "${key}" key with an appropriate value`,
        `For "${key}", use: ${defaultValue}`,
      ],
      correctedJson: `"${key}": ${defaultValue}`,
    })
  }

  if (issue.includes('MISSING_CONDITION:')) {
    const ruleId = (issue.match(/Rule "([^"]+)"/) || [])[1] || 'unknown'
    suggestions.push({
      rootCause: `Rule "${ruleId}" has an empty or missing "condition" field. Rules need conditions to evaluate.`,
      fixSteps: [
        `Locate rule "${ruleId}" in the rules file`,
        `Add a "condition" string that references available analysis fields`,
        `Use dot-path notation: "financialAnalysis.hasDebt == true"`,
        `Set "active": true when the rule is ready`,
      ],
      correctedJson: `"condition": "needsAnalysis.critical.length > 0"`,
    })
  }

  if (issue.includes('MISSING_OVERRIDE:')) {
    const ruleId = (issue.match(/Rule "([^"]+)"/) || [])[1] || 'unknown'
    suggestions.push({
      rootCause: `Rule "${ruleId}" has no "override" action. When a rule matches, the override determines what happens.`,
      fixSteps: [
        `Define what should happen when this rule triggers`,
        `Add an "override" string with one of: force_stage(NEW_STAGE), force_action(action_id), add_warning(text), redirect_to(STAGE, 'message')`,
        `Or set "active": false if the rule is not yet ready`,
      ],
      correctedJson: `"override": "force_stage(NEEDS_CRITICAL)"`,
    })
  }

  if (issue.includes('INVALID_PRIORITY:')) {
    const actionId = (issue.match(/Action "([^"]+)"/) || [])[1] || (issue.match(/Rule "([^"]+)"/) || [])[1] || 'unknown'
    suggestions.push({
      rootCause: `"${actionId}" has a non-numeric priority. Priorities must be integers.`,
      fixSteps: [
        `Set "priority" to a number between 1 (highest) and 99 (lowest)`,
        `Common ranges: 1-3 = critical, 4-6 = high, 7-10 = medium, 11+ = low`,
      ],
      correctedJson: `"priority": 5`,
    })
  }

  if (issue.includes('NONSTANDARD_ID:')) {
    const actionId = (issue.match(/Action "([^"]+)"/) || [])[1] || 'unknown'
    const domain = (getDomains ? Object.keys(getDomains() || {})[0] : 'domain') || 'domain'
    suggestions.push({
      rootCause: `Action "${actionId}" does not follow the "domain.unique_name" naming convention.`,
      fixSteps: [
        `Rename the action id to include the domain prefix`,
        `Example format: "${domain}.${actionId.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}"`,
        `Update master_index.json if it references this action`,
      ],
      correctedJson: `"id": "${domain}.${actionId.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}"`,
    })
  }

  if (issue.includes('NO_DOMAINS:')) {
    suggestions.push({
      rootCause: 'The /core directory contains no valid domain JSON files. The KB is completely empty.',
      fixSteps: [
        'Create at least one domain file in /core/ (e.g., core/finances.json)',
        'Each domain must have: domain name, principles[], decision_trees[], actions[], metrics{}',
        'See core/finances.json as a template',
      ],
      correctedJson: '{\n  "domain": "new_domain",\n  "principles": [],\n  "decision_trees": [],\n  "actions": [],\n  "metrics": {}\n}',
    })
  }

  if (issue.includes('MISSING_TRIGGERS:')) {
    suggestions.push({
      rootCause: 'master_index.json is missing the "triggers" object entirely. No user intent can be routed.',
      fixSteps: [
        'Open /index/master_index.json',
        'Add a "triggers" object with at least one intent mapping',
        'Each trigger needs: domain, action, keywords[], stage',
        'See the triggers structure in the existing file as reference',
      ],
      correctedJson: '"triggers": {\n  "greeting": {\n    "domain": "wellbeing",\n    "action": "needs_advice",\n    "keywords": ["hello", "hi", "help"],\n    "stage": "WELCOME"\n  }\n}',
    })
  }

  if (suggestions.length === 0) {
    suggestions.push({
      rootCause: `Unknown issue type: "${issue.substring(0, 80)}..."`,
      fixSteps: [
        'Review the KB file referenced in the error message',
        'Check for structural issues (missing brackets, invalid JSON)',
        'Ensure all cross-references between master_index.json and /core files are valid',
        'Run validateKB() again after making changes',
      ],
      correctedJson: '// Manual review required — see error details above',
    })
  }

  return suggestions
}

export function suggestAllFixes(diagnosticReport) {
  const issueSources = [
    ...(diagnosticReport.issues || []),
    ...(diagnosticReport.structureErrors || []),
    ...(diagnosticReport.ruleIssues || []),
    ...(diagnosticReport.schemaViolations || []),
  ]
  const allSuggestions = []
  for (const issue of issueSources) {
    allSuggestions.push(...suggestFixes(issue))
  }
  return allSuggestions
}

// ═══════════════════════════════════════════════════════════════
// 4. autoRepairKB() — SAFE MODE ONLY
// ═══════════════════════════════════════════════════════════════

export function autoRepairKB() {
  const domains = getDomains()
  const masterIndex = getMasterIndex()
  const repairs = []
  const skipped = []

  for (const [domainName, domain] of Object.entries(domains)) {
    const actions = domain.actions || []
    for (const action of actions) {
      if (!action.id) {
        skipped.push(`SKIPPED: Action without id in domain "${domainName}" — cannot auto-repair`)
        continue
      }

      if (action.steps_en && !action.steps_es) {
        action.steps_es = [...action.steps_en]
        repairs.push(`FIXED: Added missing steps_es to action "${action.id}" (copy from steps_en)`)
      }
      if (action.steps_es && !action.steps_en) {
        action.steps_en = [...action.steps_es]
        repairs.push(`FIXED: Added missing steps_en to action "${action.id}" (copy from steps_es)`)
      }
      if (action.name_en && !action.name_es) {
        action.name_es = action.name_en
        repairs.push(`FIXED: Added missing name_es to action "${action.id}"`)
      }
      if (action.name_es && !action.name_en) {
        action.name_en = action.name_es
        repairs.push(`FIXED: Added missing name_en to action "${action.id}"`)
      }
      if (action.priority === undefined || action.priority === null) {
        action.priority = 99
        repairs.push(`FIXED: Set default priority 99 for action "${action.id}"`)
      }
      if (!action.triggers || action.triggers.length === 0) {
        action.triggers = ['true']
        repairs.push(`FIXED: Added default trigger 'true' for action "${action.id}" — action is now always selectable`)
      }
    }

    const trees = domain.decision_trees || []
    for (const tree of trees) {
      if (tree.en && !tree.es) {
        tree.es = tree.en
        repairs.push(`FIXED: Added missing es text to decision_tree "${tree.id}"`)
      }
      if (tree.es && !tree.en) {
        tree.en = tree.es
        repairs.push(`FIXED: Added missing en text to decision_tree "${tree.id}"`)
      }
    }
  }

  if (masterIndex && masterIndex.triggers) {
    for (const [intent, config] of Object.entries(masterIndex.triggers)) {
      if (!config.stage) {
        config.stage = 'TOPIC_ADVICE'
        repairs.push(`FIXED: Set default stage "TOPIC_ADVICE" for trigger "${intent}"`)
      }
      if (!config.weight) {
        config.weight = 0.5
        repairs.push(`FIXED: Set default weight 0.5 for trigger "${intent}"`)
      }
    }
  }

  return {
    repaired: repairs.length > 0,
    repairs,
    skipped,
    count: repairs.length,
    skippedCount: skipped.length,
    message: repairs.length > 0
      ? `${repairs.length} issue(s) auto-repaired${skipped.length > 0 ? `, ${skipped.length} skipped` : ''}`
      : 'No repairs needed',
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. generateHealthReport()
// ═══════════════════════════════════════════════════════════════

export function generateHealthReport() {
  const domains = getDomains()
  const masterIndex = getMasterIndex()
  const indexes = getIndexes()
  const diagnosis = analyzeKB()

  const totalActions = indexes ? indexes.actionCount : 0
  const totalRules = indexes ? indexes.ruleCount : 0
  const totalTriggers = masterIndex ? Object.keys(masterIndex.triggers || {}).length : 0

  let healthScore = 100
  healthScore -= diagnosis.totalIssues * 8
  healthScore -= diagnosis.bilingualGaps.length * 3
  healthScore -= diagnosis.missingReferences.length * 15
  healthScore -= diagnosis.orphanActions.length * 2
  healthScore -= diagnosis.schemaViolations.length * 4
  healthScore -= diagnosis.triggerConflicts.length * 10
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)))

  const systemStatus = healthScore >= 80 ? 'healthy'
    : healthScore >= 50 ? 'degraded'
    : healthScore >= 25 ? 'critical'
    : 'broken'

  return {
    health_score: healthScore,
    critical_issues: diagnosis.totalIssues,
    warnings: diagnosis.totalWarnings,
    orphan_count: diagnosis.orphanActions.length,
    system_status: systemStatus,
    readiness: healthScore >= 80,
    details: {
      domains: Object.keys(domains || {}).length,
      actions: totalActions,
      rules: totalRules,
      triggers: totalTriggers,
      bilingualGaps: diagnosis.bilingualGaps.length,
      missingReferences: diagnosis.missingReferences.length,
      triggerConflicts: diagnosis.triggerConflicts.length,
      schemaViolations: diagnosis.schemaViolations.length,
    },
    diagnosis,
    generatedAt: Date.now(),
  }
}

// ═══════════════════════════════════════════════════════════════
// DIAGNOSTIC SUMMARY
// ═══════════════════════════════════════════════════════════════

export function getDiagnosticSummary() {
  const report = generateHealthReport()
  const statusSymbol = report.system_status === 'healthy' ? '✅'
    : report.system_status === 'degraded' ? '⚠️'
    : report.system_status === 'critical' ? '🔴'
    : '⛔'

  return {
    summary: `${statusSymbol} KB is ${report.system_status} (score: ${report.health_score}/100) — ${report.critical_issues} issues, ${report.warnings} warnings`,
    health_score: report.health_score,
    status: report.system_status,
    readiness: report.readiness,
    details: `Domains: ${report.details.domains}, Actions: ${report.details.actions}, Rules: ${report.details.rules}, Triggers: ${report.details.triggers}`,
    issuesFound: report.critical_issues > 0 || report.warnings > 0,
    recommendations: report.critical_issues > 0
      ? 'Run autoRepairKB() or manually fix the reported issues before production use'
      : report.warnings > 0
        ? 'KB is functional but has warnings that should be reviewed'
        : 'No issues detected',
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. REACT DASHBOARD DATA MODEL
// ═══════════════════════════════════════════════════════════════

export function getDashboardData() {
  const report = generateHealthReport()
  const classified = classifyAll(report.diagnosis)

  const bySeverity = { low: [], medium: [], high: [], critical: [], unknown: [] }
  for (const item of classified) {
    const sev = item.severity || 'unknown'
    if (bySeverity[sev]) bySeverity[sev].push(item)
    else bySeverity.unknown.push(item)
  }

  const severityBreakdown = {}
  for (const [sev, items] of Object.entries(bySeverity)) {
    severityBreakdown[sev] = items.length
  }

  const moduleStatus = {
    core: { loaded: Object.keys(getDomains() || {}).length > 0, count: Object.keys(getDomains() || {}).length },
    rules: { loaded: (getRules() || []).length > 0, count: (getRules() || []).length },
    index: { loaded: !!getMasterIndex(), triggers: Object.keys(getMasterIndex()?.triggers || {}).length },
    schemas: { loaded: Object.keys(getSchemas() || {}).length > 0, count: Object.keys(getSchemas() || {}).length },
    indexes: { built: !!getIndexes(), actionCount: getIndexes()?.actionCount || 0 },
  }

  return {
    healthMeter: {
      score: report.health_score,
      status: report.system_status,
      color: report.health_score >= 80 ? '#22c55e'
        : report.health_score >= 50 ? '#eab308'
        : report.health_score >= 25 ? '#f97316'
        : '#ef4444',
    },
    issueSummary: {
      total: report.critical_issues + report.warnings,
      critical: report.critical_issues,
      warnings: report.warnings,
      bySeverity: severityBreakdown,
      bySeverityOrdered: Object.entries(severityBreakdown).sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3, unknown: 4 }
        return (order[a[0]] || 99) - (order[b[0]] || 99)
      }),
    },
    moduleStatus,
    lastValidation: report.generatedAt,
    classifiedIssues: classified.slice(0, 50),
    readiness: report.readiness,
    summary: report.system_status === 'healthy'
      ? 'All KB modules are healthy and ready'
      : `${report.critical_issues} issue(s) requiring attention — KB is ${report.system_status}`,
  }
}
