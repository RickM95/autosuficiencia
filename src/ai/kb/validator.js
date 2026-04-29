const REQUIRED_DOMAIN_KEYS = ['domain', 'principles', 'decision_trees', 'actions', 'metrics']
const REQUIRED_ACTION_KEYS = ['id', 'triggers']

export function validateKBStructure(domains) {
  const errors = []
  const warnings = []

  if (!domains || Object.keys(domains).length === 0) {
    errors.push('NO_DOMAINS: No domain files found in /core')
    return { valid: false, errors, warnings }
  }

  for (const [name, domain] of Object.entries(domains)) {
    if (!domain || typeof domain !== 'object') {
      errors.push(`INVALID_DOMAIN: "${name}" is not a valid object`)
      continue
    }

    for (const key of REQUIRED_DOMAIN_KEYS) {
      if (!(key in domain)) {
        errors.push(`MISSING_KEY: Domain "${name}" is missing required key "${key}"`)
      }
    }

    if (!domain.principles || !Array.isArray(domain.principles)) {
      errors.push(`INVALID_PRINCIPLES: Domain "${name}" principles must be an array`)
    } else {
      for (let i = 0; i < domain.principles.length; i++) {
        const p = domain.principles[i]
        if (!p.id) errors.push(`MISSING_PRINCIPLE_ID: Domain "${name}" principle[${i}] has no id`)
        if (!p.en && !p.es) warnings.push(`MISSING_BILINGUAL: Domain "${name}" principle[${i}] missing en/es text`)
        if (!p.priority && p.priority !== 0) warnings.push(`MISSING_PRIORITY: Domain "${name}" principle[${i}] has no priority`)
      }
    }

    if (!domain.decision_trees || !Array.isArray(domain.decision_trees)) {
      errors.push(`INVALID_TREES: Domain "${name}" decision_trees must be an array`)
    } else {
      for (let i = 0; i < domain.decision_trees.length; i++) {
        const t = domain.decision_trees[i]
        if (!t.id) errors.push(`MISSING_TREE_ID: Domain "${name}" decision_tree[${i}] has no id`)
        if (!t.root) errors.push(`MISSING_ROOT: Domain "${name}" decision_tree[${i}] has no root node`)
      }
    }

    if (!domain.actions || !Array.isArray(domain.actions)) {
      errors.push(`INVALID_ACTIONS: Domain "${name}" actions must be an array`)
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateActions(domains) {
  const errors = []
  const warnings = []
  const actionIds = new Set()

  for (const [domainName, domain] of Object.entries(domains)) {
    const actions = domain.actions || []
    for (let i = 0; i < actions.length; i++) {
      const a = actions[i]

      if (!a.id) {
        errors.push(`MISSING_ID: Domain "${domainName}" action[${i}] has no id`)
        continue
      }

      if (actionIds.has(a.id)) {
        errors.push(`DUPLICATE_ID: Action id "${a.id}" appears more than once (domain: ${domainName})`)
      }
      actionIds.add(a.id)

      const idParts = a.id.split('.')
      if (idParts.length < 2) {
        warnings.push(`NONSTANDARD_ID: Action "${a.id}" does not follow "domain.name" format`)
      }

      for (const key of REQUIRED_ACTION_KEYS) {
        if (!(key in a)) {
          errors.push(`MISSING_ACTION_FIELD: Action "${a.id}" is missing "${key}"`)
        }
      }

      if (a.triggers) {
        if (!Array.isArray(a.triggers)) {
          errors.push(`INVALID_TRIGGERS: Action "${a.id}" triggers must be an array`)
        }
      } else {
        warnings.push(`NO_TRIGGERS: Action "${a.id}" has no triggers — will never be selected by trigger matching`)
      }

      const hasStepsEn = a.steps_en !== undefined
      const hasStepsEs = a.steps_es !== undefined
      const hasSteps = a.steps !== undefined

      if (hasStepsEn && !Array.isArray(a.steps_en)) {
        errors.push(`INVALID_STEPS_EN: Action "${a.id}" steps_en must be an array`)
      }
      if (hasStepsEs && !Array.isArray(a.steps_es)) {
        errors.push(`INVALID_STEPS_ES: Action "${a.id}" steps_es must be an array`)
      }
      if (hasSteps && !Array.isArray(a.steps)) {
        errors.push(`INVALID_STEPS: Action "${a.id}" steps must be an array`)
      }

      if (!hasStepsEn && !hasStepsEs && !hasSteps) {
        warnings.push(`NO_STEPS: Action "${a.id}" has no steps, steps_en, or steps_es — minimal guidance provided`)
      }

      if (a.priority === undefined || a.priority === null) {
        warnings.push(`MISSING_PRIORITY: Action "${a.id}" has no priority, defaulting to 99`)
      } else if (typeof a.priority !== 'number') {
        errors.push(`INVALID_PRIORITY: Action "${a.id}" priority must be a number`)
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings, actionIds }
}

export function validateIndex(masterIndex, knownActionIds) {
  const errors = []
  const warnings = []

  if (!masterIndex) {
    errors.push('MISSING_INDEX: master_index.json is null or undefined')
    return { valid: false, errors, warnings }
  }

  if (!masterIndex.triggers || typeof masterIndex.triggers !== 'object') {
    errors.push('MISSING_TRIGGERS: master_index.json has no "triggers" object')
  } else {
    const triggerActions = new Set()
    for (const [intent, config] of Object.entries(masterIndex.triggers)) {
      if (!config.action) {
        errors.push(`MISSING_ACTION_REF: Trigger "${intent}" has no action reference`)
      } else {
        triggerActions.add(config.action)
        if (knownActionIds && knownActionIds.size > 0) {
          if (!knownActionIds.has(config.action)) {
            errors.push(`ORPHAN_ACTION_REF: Trigger "${intent}" references action "${config.action}" which does not exist in any domain`)
          }
        }
      }
      if (!config.domain) warnings.push(`MISSING_DOMAIN: Trigger "${intent}" has no domain`)
      if (!config.keywords || config.keywords.length === 0) {
        warnings.push(`MISSING_KEYWORDS: Trigger "${intent}" has no keywords — will never match`)
      }
      if (!config.stage) warnings.push(`MISSING_STAGE: Trigger "${intent}" has no stage mapping`)
    }

    if (knownActionIds && knownActionIds.size > 0) {
      for (const actionId of knownActionIds) {
        if (!triggerActions.has(actionId)) {
          warnings.push(`ORPHAN_ACTION: Action "${actionId}" exists in /core but is not referenced by any trigger in master_index.json`)
        }
      }
    }
  }

  if (!masterIndex.stage_map || typeof masterIndex.stage_map !== 'object') {
    warnings.push('MISSING_STAGE_MAP: master_index.json has no "stage_map" — fallback to WELCOME for all stages')
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateRules(rules) {
  const errors = []
  const warnings = []

  if (!rules || !Array.isArray(rules)) {
    errors.push('INVALID_RULES: rules must be an array')
    return { valid: false, errors, warnings }
  }

  const ruleIds = new Set()
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i]

    if (!r.id) {
      errors.push(`MISSING_RULE_ID: rule[${i}] has no id`)
    } else {
      if (ruleIds.has(r.id)) warnings.push(`DUPLICATE_RULE_ID: Rule "${r.id}" appears more than once`)
      ruleIds.add(r.id)
    }

    if (!r.condition) errors.push(`MISSING_CONDITION: Rule "${r.id || i}" has no condition`)
    if (!r.override) errors.push(`MISSING_OVERRIDE: Rule "${r.id || i}" has no override action`)
    if (r.priority === undefined || r.priority === null) {
      warnings.push(`MISSING_PRIORITY: Rule "${r.id || i}" has no priority`)
    } else if (typeof r.priority !== 'number') {
      errors.push(`INVALID_PRIORITY: Rule "${r.id || i}" priority must be a number`)
    }

    if (r.description_en && !r.description_es) warnings.push(`MISSING_ES_DESC: Rule "${r.id || i}" missing Spanish description`)
    if (r.description_es && !r.description_en) warnings.push(`MISSING_EN_DESC: Rule "${r.id || i}" missing English description`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateSchemas(schemas) {
  const errors = []
  const warnings = []

  if (!schemas || Object.keys(schemas).length === 0) {
    warnings.push('NO_SCHEMAS: No schema files found')
    return { valid: true, errors, warnings }
  }

  for (const [name, schema] of Object.entries(schemas)) {
    if (!schema || typeof schema !== 'object') {
      errors.push(`INVALID_SCHEMA: "${name}" is not a valid object`)
      continue
    }
    if (!schema.$schema && !schema.version) {
      warnings.push(`MISSING_METADATA: Schema "${name}" has no $schema or version identifier`)
    }
    if (!schema.sections && !schema.fields && !schema.properties) {
      warnings.push(`NO_CONTENT: Schema "${name}" has no sections, fields, or properties`)
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateBilingualFields(domains) {
  const errors = []

  for (const [, domain] of Object.entries(domains)) {
    const actions = domain.actions || []
    for (const action of actions) {
      if (!action.id) continue
      if (action.steps_en && !action.steps_es) {
        errors.push(`MISSING_ES: Action "${action.id}" has steps_en but missing steps_es`)
      }
      if (action.steps_es && !action.steps_en) {
        errors.push(`MISSING_EN: Action "${action.id}" has steps_es but missing steps_en`)
      }
      if (action.name_en && !action.name_es) {
        errors.push(`MISSING_NAME_ES: Action "${action.id}" has name_en but missing name_es`)
      }
      if (action.name_es && !action.name_en) {
        errors.push(`MISSING_NAME_EN: Action "${action.id}" has name_es but missing name_en`)
      }
    }

    const trees = domain.decision_trees || []
    for (const tree of trees) {
      if (tree.en && !tree.es) errors.push(`MISSING_TREE_ES: Tree "${tree.id}" has en but no es`)
      if (tree.es && !tree.en) errors.push(`MISSING_TREE_EN: Tree "${tree.id}" has es but no en`)
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateTriggers(masterIndex, knownActionIds) {
  const errors = []

  if (!masterIndex || !masterIndex.triggers) {
    errors.push('NO_TRIGGERS: master_index.json has no triggers section')
    return { valid: false, errors }
  }

  for (const [intent, config] of Object.entries(masterIndex.triggers)) {
    if (!config.action) {
      errors.push(`TRIGGER_NO_ACTION: Trigger "${intent}" has no action mapping`)
      continue
    }
    if (knownActionIds && knownActionIds.size > 0 && !knownActionIds.has(config.action)) {
      errors.push(`TRIGGER_BROKEN_REF: Trigger "${intent}" → action "${config.action}" does not exist in any domain`)
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateAll(kbData) {
  const {
    domains = {},
    masterIndex = null,
    rules = [],
    schemas = {},
  } = kbData

  const allErrors = []
  const allWarnings = []
  let allValid = true

  const structureResult = validateKBStructure(domains)
  allErrors.push(...structureResult.errors)
  allWarnings.push(...structureResult.warnings)
  if (!structureResult.valid) allValid = false

  const actionsResult = validateActions(domains)
  allErrors.push(...actionsResult.errors)
  allWarnings.push(...actionsResult.warnings)
  const knownIds = actionsResult.actionIds
  if (!actionsResult.valid) allValid = false

  const indexResult = validateIndex(masterIndex, knownIds)
  allErrors.push(...indexResult.errors)
  allWarnings.push(...indexResult.warnings)
  if (!indexResult.valid) allValid = false

  const rulesResult = validateRules(rules)
  allErrors.push(...rulesResult.errors)
  allWarnings.push(...rulesResult.warnings)
  if (!rulesResult.valid) allValid = false

  const schemaResult = validateSchemas(schemas)
  allErrors.push(...schemaResult.errors)
  allWarnings.push(...schemaResult.warnings)

  const bilingualResult = validateBilingualFields(domains)
  allErrors.push(...bilingualResult.errors)
  allWarnings.push(...bilingualResult.errors)

  const triggerResult = validateTriggers(masterIndex, knownIds)
  allErrors.push(...triggerResult.errors)
  if (!triggerResult.valid) allValid = false

  return {
    valid: allValid,
    errors: allErrors,
    warnings: allWarnings,
    validationTime: Date.now(),
    summary: {
      errors: allErrors.length,
      warnings: allWarnings.length,
      domains: Object.keys(domains).length,
      actions: knownIds.size,
      rules: rules.length,
    },
  }
}

export function validateKB(domains, masterIndex, rules, schemas) {
  return validateAll({ domains, masterIndex, rules, schemas })
}
