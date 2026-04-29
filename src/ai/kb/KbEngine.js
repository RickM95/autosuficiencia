import masterIndex from './index/master_index.json'
import financesCore from './core/finances.json'
import wellbeingCore from './core/wellbeing.json'
import goalsCore from './core/goals.json'
import primaryRules from './rules/rules.json'
import secondaryRules from './rules/overrides.json'
import planSchema from './schemas/plan.json'
import planTemplateSingle from './templates/plan_template.json'
import planTemplatesMulti from './templates/plan_templates.json'
import ingestionRules from './ingestion/extraction_rules.json'

import { initializeKB } from './loader.js'
import { setQueryIndexes } from './queryEngine.js'

const DOMAINS = {
  finances: financesCore,
  wellbeing: wellbeingCore,
  goals: goalsCore,
}

const KB_GAP_DETECTED = 'KB_GAP_DETECTED'
const KB_STRUCTURE_ERROR = 'KB_STRUCTURE_ERROR'

export default class KbEngine {
  constructor() {
    this.index = masterIndex
    this.domains = DOMAINS
    this.rules = [...(primaryRules.rules || []), ...(secondaryRules.rules || [])]
    this.schemas = { plan: planSchema }
    this.planTemplateSingle = planTemplateSingle
    this.planTemplatesMulti = planTemplatesMulti
    this.ingestion = ingestionRules
    this.ready = false
    this.lastValidationResult = null
    this._initPromise = null
  }

  async init(debugMode = false) {
    if (this.ready) return { success: true }
    if (this._initPromise) return this._initPromise

    this._initPromise = this._initialize(debugMode)
    return this._initPromise
  }

  async _initialize(debugMode) {
    const result = await initializeKB(debugMode)

    if (result.success) {
      setQueryIndexes(result.indexes)
      this.ready = true
      this.lastValidationResult = result.validation

      const idx = result.indexes
      console.log(`[KbEngine] Ready: ${idx.domainCount} domains, ${idx.actionCount} actions, ${idx.triggerCount} trigger mappings, ${idx.ruleCount} rules`)
    } else {
      console.error('[KbEngine] Initialization FAILED — KB validation errors detected')
      this.ready = false
      this.lastValidationResult = result.validation
    }

    return result
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 1 — CONTEXT ANALYSIS
  // ═══════════════════════════════════════════════════════════════

  analyzeContext(userMessage, formData = {}, memory = {}) {
    const lower = (userMessage || '').toLowerCase()
    const intent = this.findIntent(userMessage)
    const trigger = intent ? this.index.triggers[intent] : null
    const isQuestion = /[¿?]/.test(userMessage || '')
    const isCommand = /^(quiero|necesito|puedes|ayúdame|help|i need|can you|generate|crea|haz)/i.test(userMessage || '')
    const urgency = this._detectUrgency(userMessage || '', formData)

    return {
      raw: userMessage,
      intent,
      domain: trigger ? trigger.domain : null,
      action: trigger ? trigger.action : null,
      stage: trigger ? trigger.stage : null,
      keywords: trigger ? trigger.keywords.filter(k => lower.includes(k)) : [],
      isQuestion,
      isCommand,
      urgency,
      memorySentiment: memory.sentiment || 'neutral',
    }
  }

  _detectUrgency(message, formData) {
    const urgencyWords = /urge|emergency|emergencia|crisis|urgente|inmediato|now|ahora|hoy|today|ayuda|help/i.test(message)
    if (urgencyWords) return 'high'
    if (formData.foodSecurity && formData.foodSecurity <= 2) return 'high'
    if (formData.housingSecurity && formData.housingSecurity <= 2) return 'high'
    return 'normal'
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2 — RULE ENGINE (RUN FIRST, ALWAYS OVERRIDES)
  // ═══════════════════════════════════════════════════════════════

  executeRuleEngine(context) {
    const matched = []
    const sorted = [...this.rules].sort((a, b) => (a.priority || 99) - (b.priority || 99))

    for (const rule of sorted) {
      if (rule.active === false) continue
      try {
        const conditionMet = this._evaluateTrigger(rule.condition, context)
        if (conditionMet) {
          matched.push(rule)
        }
      } catch (e) {
        console.warn(`Rule evaluation error [${rule.id}]:`, e.message)
      }
    }
    return matched
  }

  applyOverrides(activeRules, currentState) {
    let finalStage = currentState.stage
    let finalAction = currentState.action
    const warnings = []
    let forcedLanguage = null

    for (const rule of activeRules) {
      const stageMatch = rule.override && rule.override.match(/force_stage\((\w+)\)/)
      if (stageMatch) finalStage = stageMatch[1]

      const actionMatch = rule.override && rule.override.match(/force_action\((\w+)\)/)
      if (actionMatch) finalAction = actionMatch[1]

      const langMatch = rule.override && rule.override.match(/force_language\((\w+)\)/)
      if (langMatch) forcedLanguage = langMatch[1]

      const warnMatch = rule.override && rule.override.match(/add_warning\((.+)\)/)
      if (warnMatch) warnings.push(warnMatch[1])

      const redirectMatch = rule.override && rule.override.match(/redirect_to\((\w+),\s*'([^']+)'\)/)
      if (redirectMatch) {
        finalStage = redirectMatch[1]
        warnings.push(redirectMatch[2])
      }
    }

    return { stage: finalStage, action: finalAction, warnings, language: forcedLanguage }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 3 — KB QUERY
  // ═══════════════════════════════════════════════════════════════

  kbQuery(intent, domainName, triggerContext = {}) {
    const result = { actions: [], principles: [], decisionTrees: [], metrics: {} }

    if (intent) {
      const indexEntry = this.queryIndex(intent)
      if (indexEntry) {
        domainName = domainName || Object.keys(this.domains).find(k => this.domains[k] === indexEntry.domain)
      }
    }

    const domain = domainName ? this.getDomain(domainName) : null
    if (!domain) {
      const fallbackDomain = Object.values(this.domains)[0]
      if (fallbackDomain) {
        result.principles = fallbackDomain.principles || []
        result.decisionTrees = fallbackDomain.decision_trees || []
        result.metrics = fallbackDomain.metrics || {}
        result.actions = fallbackDomain.actions || []
        result._fallbackDomain = true
      }
      return result
    }

    result.principles = domain.principles || []
    result.decisionTrees = domain.decision_trees || []
    result.metrics = domain.metrics || {}

    const allActions = domain.actions || []
    const triggerKeys = Object.keys(triggerContext).filter(k => triggerContext[k] !== undefined)
    if (triggerKeys.length === 0) {
      result.actions = allActions
    } else {
      result.actions = allActions.filter(action => {
        if (!action.triggers || action.triggers.length === 0) return false
        return action.triggers.some(t => this._evaluateTrigger(t, triggerContext))
      })
      if (result.actions.length === 0) {
        result.actions = allActions
      }
    }

    return result
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 4 — DECISION LOGIC
  // ═══════════════════════════════════════════════════════════════

  evaluateDecisionTrees(trees, context) {
    const results = []
    for (const tree of trees) {
      try {
        const outcome = this._walkTree(tree.root, context)
        if (outcome) {
          results.push({
            treeId: tree.id,
            action: outcome.action,
            metrics: outcome.metrics || [],
            path: outcome.path || [],
          })
        }
      } catch (e) {
        console.warn(`Decision tree error [${tree.id}]:`, e.message)
      }
    }
    return results
  }

  _walkTree(node, context) {
    if (!node) return null
    if (!node.condition) return { action: node.action, metrics: node.metrics, path: [] }

    const conditionMet = this._evaluateTrigger(node.condition, context)
    const branch = conditionMet ? node.true_branch : node.false_branch
    if (!branch) return null

    const path = [conditionMet ? 'true' : 'false']
    if (branch.action) {
      return { action: branch.action, metrics: branch.metrics || [], path }
    }
    const deeper = this._walkTree(branch, context)
    if (deeper) {
      deeper.path = [...path, ...(deeper.path || [])]
      return deeper
    }
    return null
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 5 — RESPONSE ASSEMBLY SUPPORT
  // ═══════════════════════════════════════════════════════════════

  generateActions(kbResult, overrides, userContext) {
    const actions = []

    for (const action of kbResult.actions) {
      if (!action.id && !action.steps_en && !action.steps_es) continue
      const steps = userContext.language === 'es'
        ? (action.steps_es || action.steps || action.en)
        : (action.steps_en || action.steps || action.es)

      actions.push({
        actionId: action.id || 'dynamic_action',
        steps: typeof steps === 'string' ? steps.split('\n').filter(Boolean) : (steps || []),
        metrics: action.metrics || [],
        priority: action.priority || 99,
      })
    }

    for (const warning of overrides.warnings) {
      actions.push({
        actionId: 'rule_override_warning',
        steps: [warning],
        priority: 0,
      })
    }

    return actions.sort((a, b) => a.priority - b.priority)
  }

  buildResponse(analysis, actions, principles, decisionPaths, overrides, lang) {
    const parts = []

    if (overrides.warnings.length > 0) {
      parts.push(lang === 'es' ? '⚡ **Intervención del sistema:**' : '⚡ **System intervention:**')
      for (const w of overrides.warnings) parts.push(`- ${w}`)
      parts.push('')
    }

    if (principles.length > 0) {
      const p = principles[0]
      parts.push(`📐 **${lang === 'es' ? 'Principio rector' : 'Governing principle'}:** ${lang === 'es' ? p.es : p.en}`)
      parts.push('')
    }

    if (actions.length > 0) {
      parts.push(lang === 'es' ? '**Acciones precisas requeridas:**' : '**Required precision actions:**')
      let stepNum = 0
      for (const action of actions) {
        if (!action.steps || action.steps.length === 0) continue
        for (const step of action.steps) {
          stepNum++
          parts.push(`${stepNum}. ${step}`)
          if (stepNum >= 6) break
        }
        if (stepNum >= 6) break
      }
      parts.push('')
    }

    if (decisionPaths.length > 0) {
      parts.push(lang === 'es' ? '🔍 **Árbol de decisión aplicado:**' : '🔍 **Decision tree applied:**')
      for (const d of decisionPaths) {
        parts.push(`  - ${d.treeId}: ${d.action}`)
      }
      parts.push('')
    }

    if (parts.length === 0) {
      return null
    }

    const prefix = lang === 'es'
      ? `**Nephi — Análisis**\n\n`
      : `**Nephi — Analysis**\n\n`
    return prefix + parts.join('\n').trim()
  }

  // ═══════════════════════════════════════════════════════════════
  // FULL PIPELINE EXECUTION
  // ═══════════════════════════════════════════════════════════════

  executePipeline(userMessage, formData, memory, analysis) {
    if (!this.ready) {
      return {
        context: { intent: null, domain: null, urgency: 'normal' },
        activeRules: [],
        overrides: { stage: 'WELCOME', action: null, warnings: ['KB not initialized — run engine.init() first'] },
        kbResult: { actions: [], principles: [], decisionTrees: [], metrics: {} },
        decisionResults: [],
        actions: [],
        responseText: null,
        validation: { valid: false, issues: ['KB_NOT_READY'] },
        log: { steps: ['ERROR:KB_NOT_INITIALIZED'] },
        kbGapDetected: true,
        structureError: true,
      }
    }

    const contextLog = { steps: [], warnings: [], errors: [] }

    const context = this.analyzeContext(userMessage, formData, memory)
    contextLog.steps.push('STEP1:context_analysis')
    contextLog.steps.push(`intent=${context.intent || 'none'}, urgency=${context.urgency}`)

    const ruleContext = {
      ...(analysis || {}),
      memory: { sentiment: memory.sentiment || 'neutral', language: memory.language || 'es', consecutiveOffTopic: memory.consecutiveOffTopic || 0 },
      stage: memory.stage || 'WELCOME',
      action: context.action,
    }
    const activeRules = this.executeRuleEngine(ruleContext)
    if (activeRules.length > 0) {
      contextLog.steps.push(`STEP2:rules_matched=${activeRules.length}`)
      contextLog.steps.push(activeRules.map(r => r.id).join(','))
    } else {
      contextLog.steps.push('STEP2:no_rules_matched')
    }

    const overrides = this.applyOverrides(activeRules, {
      stage: memory.stage || 'WELCOME',
      action: context.action,
    })
    if (overrides.stage !== memory.stage) {
      contextLog.steps.push(`override:stage=${overrides.stage}`)
    }
    if (overrides.action && overrides.action !== context.action) {
      contextLog.steps.push(`override:action=${overrides.action}`)
    }

    const triggerCtx = {}
    if (analysis) {
      if (analysis.financialAnalysis) Object.assign(triggerCtx, analysis.financialAnalysis)
      if (analysis.needsAnalysis) Object.assign(triggerCtx, analysis.needsAnalysis)
      if (analysis.goalsAnalysis) Object.assign(triggerCtx, analysis.goalsAnalysis)
      if (analysis.completeness) Object.assign(triggerCtx, analysis.completeness)
    }
    const effectiveDomain = overrides.action
      ? this._domainForAction(overrides.action)
      : context.domain

    const kbResult = this.kbQuery(context.intent, effectiveDomain, triggerCtx)
    const hasKbData = kbResult.actions.length > 0 || kbResult.principles.length > 0
    contextLog.steps.push(`STEP3:kb_query domain=${effectiveDomain || 'none'} hits=${kbResult.actions.length}actions+${kbResult.principles.length}principles`)

    const decisionResults = this.evaluateDecisionTrees(kbResult.decisionTrees, triggerCtx)
    if (decisionResults.length > 0) {
      contextLog.steps.push(`STEP4:decision_trees=${decisionResults.map(d => d.treeId).join(',')}`)
    } else {
      contextLog.steps.push('STEP4:no_decision_trees_fired')
    }

    const actions = this.generateActions(kbResult, overrides, {
      language: memory.language || 'es',
    })

    const responseText = this.buildResponse(analysis, actions, kbResult.principles, decisionResults, overrides, memory.language || 'es')
    contextLog.steps.push(`STEP5:response generated=${!!responseText}`)

    const validationResult = this.validateResponse({ actions, principles: kbResult.principles, decisionTrees: kbResult.decisionTrees })

    return {
      context,
      activeRules,
      overrides,
      kbResult,
      decisionResults,
      actions,
      responseText,
      validation: validationResult,
      log: contextLog,
      kbGapDetected: !hasKbData,
      structureError: !validationResult.valid,
    }
  }

  _domainForAction(actionId) {
    for (const [domainName, domain] of Object.entries(this.domains)) {
      const hasAction = (domain.actions || []).some(a => a.id === actionId)
      if (hasAction) return domainName
    }
    return null
  }

  // ═══════════════════════════════════════════════════════════════
  // DOUBLE-CHECK VALIDATION
  // ═══════════════════════════════════════════════════════════════

  validateResponse(response) {
    const issues = []

    if (!response.actions || response.actions.length === 0) {
      issues.push('NO_ACTIONS: response contains zero action items')
    } else {
      const validIds = response.actions.filter(a => a.actionId && a.actionId !== 'dynamic_action')
      if (validIds.length === 0 && response.actions.length > 0) {
        const hasSteps = response.actions.some(a => a.steps && a.steps.length > 0)
        if (!hasSteps) {
          issues.push('INVALID_ACTIONS: actions exist but have no steps or valid IDs')
        }
      }
    }

    if (!response.principles || response.principles.length === 0) {
      issues.push('NO_PRINCIPLES: no KB principles referenced in response')
    }

    this.lastValidationResult = { valid: issues.length === 0, issues, timestamp: Date.now() }
    return this.lastValidationResult
  }

  validateMasterIndex() {
    const issues = []
    for (const [intent, config] of Object.entries(this.index.triggers)) {
      if (!config.domain) issues.push(`MISSING_DOMAIN: trigger "${intent}" has no domain`)
      if (!config.action) issues.push(`MISSING_ACTION: trigger "${intent}" has no action`)
      if (!config.keywords || config.keywords.length === 0) {
        issues.push(`MISSING_KEYWORDS: trigger "${intent}" has no keywords`)
      }
      if (!this.domains[config.domain]) {
        issues.push(`UNKNOWN_DOMAIN: trigger "${intent}" references domain "${config.domain}" which does not exist in /core`)
      }
    }

    for (const [stage, mapConfig] of Object.entries(this.index.stage_map || {})) {
      if (!mapConfig.priority) issues.push(`MISSING_PRIORITY: stage "${stage}" has no priority`)
    }

    return {
      valid: issues.length === 0,
      issues,
      timestamp: Date.now(),
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ERROR MODES
  // ═══════════════════════════════════════════════════════════════

  get kbGapDetected() { return KB_GAP_DETECTED }
  get kbStructureError() { return KB_STRUCTURE_ERROR }

  // ═══════════════════════════════════════════════════════════════
  // LEGACY QUERY METHODS (preserved for backward compatibility)
  // ═══════════════════════════════════════════════════════════════

  queryIndex(intent) {
    const trigger = this.index.triggers[intent]
    if (!trigger) return null
    return {
      domain: this.getDomain(trigger.domain),
      action: trigger.action,
      weight: trigger.weight,
      stage: trigger.stage,
    }
  }

  findIntent(userMessage) {
    const lower = (userMessage || '').toLowerCase()
    let bestMatch = null
    let bestWeight = 0
    for (const [intent, config] of Object.entries(this.index.triggers)) {
      for (const keyword of config.keywords) {
        if (lower.includes(keyword.toLowerCase())) {
          if (config.weight > bestWeight) {
            bestWeight = config.weight
            bestMatch = intent
          }
          break
        }
      }
    }
    return bestMatch
  }

  getDomain(name) { return this.domains[name] || null }
  getPrinciples(domainName) { const d = this.domains[domainName]; return d ? d.principles || [] : [] }
  getDecisionTrees(domainName) { const d = this.domains[domainName]; return d ? d.decision_trees || [] : [] }

  getActions(domainName, triggerContext = {}) {
    const domain = this.domains[domainName]
    if (!domain) return []
    const actions = domain.actions || []
    const triggerKeys = Object.keys(triggerContext)
    if (triggerKeys.length === 0) return actions
    return actions.filter(action => {
      if (!action.triggers) return false
      return action.triggers.some(t => this._evaluateTrigger(t, triggerContext))
    })
  }

  getMetrics(domainName) { const d = this.domains[domainName]; return d ? d.metrics || {} : {} }
  getTemplate(templateId) {
    if (templateId === 'plan' || templateId === 'plan_template') return this.planTemplateSingle
    if (templateId === 'plan_templates') return this.planTemplatesMulti
    return this.planTemplateSingle
  }
  getPlanTemplate() { return this.planTemplateSingle }
  getPlanTemplates() { return this.planTemplatesMulti }
  getTriggerForStage(stage) { return this.index.stage_map[stage] || null }
  getCategorizationRules() { return this.ingestion.categorization }
  getExtractionPatterns() { return this.ingestion.extraction_patterns }

  evaluateRules(context) {
    const matched = []
    for (const rule of this.rules) {
      if (rule.active === false) continue
      if (this._evaluateTrigger(rule.condition, context)) matched.push(rule)
    }
    return matched.sort((a, b) => (a.priority || 99) - (b.priority || 99))
  }

  findCategoryForContent(content) {
    const cat = this.ingestion.categorization
    const lower = content.toLowerCase()
    const scores = {}
    for (const [pattern, category] of Object.entries(cat.keyword_map)) {
      const matches = lower.match(new RegExp(pattern, 'gi'))
      if (matches) scores[category] = (scores[category] || 0) + matches.length * 2
    }
    const wordCount = lower.split(/\s+/).length
    for (const c of Object.keys(scores)) scores[c] = scores[c] / Math.max(1, wordCount / 100)
    let best = cat.fallback_category
    let bestScore = 0
    for (const [c, s] of Object.entries(scores)) { if (s > bestScore) { bestScore = s; best = c } }
    return bestScore > cat.minimum_keyword_score ? best : cat.fallback_category
  }

  // ═══════════════════════════════════════════════════════════════
  // TRIGGER EVALUATION ENGINE
  // ═══════════════════════════════════════════════════════════════

  _evaluateTrigger(trigger, context) {
    if (!trigger || !context) return false

    const operators = {
      '==': (a, b) => String(a) === String(b),
      '!=': (a, b) => String(a) !== String(b),
      '>': (a, b) => parseFloat(a) > parseFloat(b),
      '<': (a, b) => parseFloat(a) < parseFloat(b),
      '>=': (a, b) => parseFloat(a) >= parseFloat(b),
      '<=': (a, b) => parseFloat(a) <= parseFloat(b),
    }

    if (trigger === 'IS SET' || trigger.includes(' IS SET')) {
      const parts = trigger.split(' IS SET')
      if (parts.length === 2) {
        const val = this._resolvePath(context, parts[0].trim())
        return val !== undefined && val !== null && val !== ''
      }
    }

    const simpleMatch = trigger.match(/^(\w[\w.]*)\s*(==|!=|>|<|>=|<=)\s*(.+)$/)
    if (simpleMatch) {
      const [, key, op, valueStr] = simpleMatch
      const value = valueStr.trim().replace(/^'|'$/g, '').replace(/^"|"$/g, '')
      const ctxVal = this._resolvePath(context, key)
      if (ctxVal === undefined) return false
      const opFn = operators[op]
      return opFn ? opFn(ctxVal, isNaN(value) ? value : (value === 'true' ? true : value === 'false' ? false : parseFloat(value))) : false
    }

    if (trigger.startsWith('any_') && trigger.endsWith('_score <= 2')) {
      const field = trigger.replace('any_', '').replace('_score <= 2', '')
      const val = this._resolvePath(context, field)
      return val !== undefined && val <= 2
    }

    const orParts = trigger.split(' OR ')
    if (orParts.length > 1) return orParts.some(p => this._evaluateTrigger(p.trim(), context))

    const andParts = trigger.split(' AND ')
    if (andParts.length > 1) return andParts.every(p => this._evaluateTrigger(p.trim(), context))

    const simpleVal = this._resolvePath(context, trigger)
    return simpleVal !== undefined && simpleVal !== null && simpleVal !== false
  }

  _resolvePath(obj, path) {
    if (!obj || !path) return undefined
    return path.split('.').reduce((acc, part) => {
      if (acc === null || acc === undefined) return undefined
      if (Array.isArray(acc)) {
        const idx = parseInt(part)
        return isNaN(idx) ? acc[part] : acc[idx]
      }
      return (typeof acc === 'object') ? acc[part] : undefined
    }, obj)
  }
}
