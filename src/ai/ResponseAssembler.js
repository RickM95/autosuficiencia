import { getBudgetAdvice, getDebtAdvice, getSavingsAdvice, getIncomeAdvice } from './advice/finances.js'
import { getNeedsAdvice, getStressAdvice, getResourcesAdvice } from './advice/wellbeing.js'
import { getGoalsAdvice } from './advice/goals.js'
import { analyzeCompleteness } from './Analyzer.js'
import { generatePlan } from './PlanGenerator.js'
import { isDevRequest, routeDevRequest, buildModuleRegistry, buildPackageJson, classifyAndRoute } from './devAgent/index.js'
import KbEngine from './kb/KbEngine.js'

const kb = new KbEngine()

const PRECISION_PREFIX = '⚡'

function nephiFrame(text, lang) {
  const prefix = lang === 'es'
    ? `${PRECISION_PREFIX} **Nephi Dev Agent — Análisis**\n\n`
    : `${PRECISION_PREFIX} **Nephi Dev Agent — Analysis**\n\n`
  return prefix + text
}

const WELCOME_MESSAGES = {
  es: {
    first: `${PRECISION_PREFIX} **Nephi Dev Agent** — Asesor AS\n\nSoy un motor de razonamiento determinístico basado en una base de conocimiento estructurada. No soy un chatbot genérico.\n\n**Capacidades:**\n- 📊 **Analizar situación** — evaluar necesidades y finanzas\n- 🎯 **Crear metas** — objetivos SMART con pasos precisos\n- 💰 **Gestión financiera** — presupuesto, deudas, ahorro\n- 📋 **Generar plan** — plan de autosuficiencia profesional\n- 📚 **Importar conocimiento** — PDFs, enlaces, documentos\n\n¿En qué área necesitas intervención precisa?`,
    returning: `${PRECISION_PREFIX} **Nephi Dev Agent** — ¿Qué requieres analizar o modificar en tu plan de autosuficiencia?`,
  },
  en: {
    first: `${PRECISION_PREFIX} **Nephi Dev Agent** — Asesor AS\n\nI am a deterministic reasoning engine operating on a structured Knowledge Base. I am NOT a generic chatbot.\n\n**Capabilities:**\n- 📊 **Analyze situation** — assess needs and finances\n- 🎯 **Create goals** — SMART objectives with precise steps\n- 💰 **Manage money** — budget, debt, savings\n- 📋 **Generate plan** — professional self-sufficiency plan\n- 📚 **Import knowledge** — PDFs, links, documents\n\nWhat area requires precise intervention?`,
    returning: `${PRECISION_PREFIX} **Nephi Dev Agent** — What requires analysis or modification in your self-sufficiency plan?`,
  },
}

export function buildWelcomeMessage(memory, formData, lang) {
  const name = formData?.name || ''
  if (memory.interactionCount === 0) return WELCOME_MESSAGES[lang || 'es'].first
  const greeting = name ? (lang === 'es' ? `👋 **¡Hola ${name}!** ` : `👋 **Hello ${name}!** `) : ''
  return greeting + WELCOME_MESSAGES[lang || 'es'].returning
}

// ═══════════════════════════════════════════════════════════════
// PRIMARY ENTRY POINT — Validation-gated response assembly
// ═══════════════════════════════════════════════════════════════

export function assembleResponse(stage, analysis, formData, budgetData, memory, userMessage, lang) {
  if (analysis.structureError) {
    return kb.kbStructureError + '\n\n' + (lang === 'es'
      ? '⚠️ Error en la estructura de la base de conocimiento. Por favor contacta al administrador.'
      : '⚠️ Knowledge base structure error. Please contact the administrator.')
  }

  if (userMessage && isDevRequest(userMessage)) {
    const routing = classifyAndRoute(userMessage)
    if (routing.shouldBlockDevTrigger) {
      const response = buildEmotionalResponse(routing, userMessage, lang)
      if (response) return response
    }
    return _handleDevRequest(userMessage, lang)
  }

  if (analysis.kbDrivenResponse) {
    return analysis.kbDrivenResponse
  }

  if (analysis.kbGapDetected) {
    const fallback = _buildFallbackResponse(stage, analysis, formData, budgetData, memory, userMessage, lang)
    return kb.kbGapDetected + '\n\n' + fallback
  }

  if (stage === 'WELCOME' && memory.interactionCount <= 1) {
    return buildWelcomeMessage(memory, formData, lang)
  }

  const response = _buildFallbackResponse(stage, analysis, formData, budgetData, memory, userMessage, lang)
  return response
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK RESPONSE BUILDER (when KB pipeline returns null)
// ═══════════════════════════════════════════════════════════════

function _buildFallbackResponse(stage, analysis, formData, budgetData, memory, userMessage, lang) {
  const topic = analysis.topic || 'general'

  if (stage === 'WELCOME' && memory.interactionCount <= 1) {
    return buildWelcomeMessage(memory, formData, lang)
  }

  switch (stage) {
    case 'NEEDS_CRITICAL':
      return _ensureActionRef(getNeedsAdvice(analysis.needsAnalysis, formData, lang), 'critical_needs_response', lang)

    case 'FINANCIAL_REVIEW': {
      if (topic === 'debt' || (userMessage || '').toLowerCase().includes('debt') || (userMessage || '').toLowerCase().includes('deuda')) {
        return _ensureActionRef(getDebtAdvice(analysis.financialAnalysis, formData, lang), 'debt_snowball', lang)
      }
      if (topic === 'emergency' || (userMessage || '').toLowerCase().includes('ahorr') || (userMessage || '').toLowerCase().includes('sav')) {
        return _ensureActionRef(getSavingsAdvice(analysis.financialAnalysis, formData, lang), 'no_emergency_fund', lang)
      }
      if (topic === 'income' || (userMessage || '').toLowerCase().includes('ingreso') || (userMessage || '').toLowerCase().includes('income') || (userMessage || '').toLowerCase().includes('trabajo') || (userMessage || '').toLowerCase().includes('work')) {
        return _ensureActionRef(getIncomeAdvice(analysis.financialAnalysis, formData, lang), 'income_diversification', lang)
      }
      if (analysis.financialAnalysis.hasDebt) {
        return _ensureActionRef(getDebtAdvice(analysis.financialAnalysis, formData, lang), 'debt_snowball', lang)
      }
      return _ensureActionRef(getBudgetAdvice(analysis.financialAnalysis, formData, lang), 'deficit_response', lang)
    }

    case 'GOALS_REVIEW':
      return _ensureActionRef(getGoalsAdvice(analysis.goalsAnalysis, formData, lang), 'goal_introduction', lang)

    case 'TOPIC_ADVICE': {
      memory.recordAdvice(topic, userMessage)
      switch (topic) {
        case 'budget': return _ensureActionRef(getBudgetAdvice(analysis.financialAnalysis, formData, lang), 'deficit_response', lang)
        case 'debt': return _ensureActionRef(getDebtAdvice(analysis.financialAnalysis, formData, lang), 'debt_snowball', lang)
        case 'emergency': return _ensureActionRef(getSavingsAdvice(analysis.financialAnalysis, formData, lang), 'no_emergency_fund', lang)
        case 'stress': return _ensureActionRef(getStressAdvice(lang), 'immediate_stress_relief', lang)
        case 'income': return _ensureActionRef(getIncomeAdvice(analysis.financialAnalysis, formData, lang), 'income_diversification', lang)
        case 'goals': return _ensureActionRef(getGoalsAdvice(analysis.goalsAnalysis, formData, lang), 'goal_introduction', lang)
        case 'housing': case 'food': case 'health':
          return _ensureActionRef(getNeedsAdvice(analysis.needsAnalysis, formData, lang), 'critical_needs_response', lang)
        case 'resources': return _ensureActionRef(getResourcesAdvice(lang), 'resource_referral', lang)
        case 'education': return _ensureActionRef(getIncomeAdvice(analysis.financialAnalysis, formData, lang), 'income_diversification', lang)
        case 'plan': {
          const plan = generatePlan(formData, budgetData, lang)
          memory.stage = 'PLAN_REVIEW'
          return renderPlanInChat(plan, lang)
        }
        default:
          if (analysis.goalsAnalysis.totalGoals > 0) return _ensureActionRef(getGoalsAdvice(analysis.goalsAnalysis, formData, lang), 'goal_review', lang)
          if (analysis.financialAnalysis.hasDebt) return _ensureActionRef(getDebtAdvice(analysis.financialAnalysis, formData, lang), 'debt_snowball', lang)
          if (analysis.financialAnalysis.income > 0) return _ensureActionRef(getBudgetAdvice(analysis.financialAnalysis, formData, lang), 'deficit_response', lang)
          return _ensureActionRef(getNeedsAdvice(analysis.needsAnalysis, formData, lang), 'critical_needs_response', lang)
      }
    }

    case 'PLAN_BUILD': {
      const plan = generatePlan(formData, budgetData, lang)
      memory.stage = 'PLAN_REVIEW'
      memory.updatePlanProgress('needs', 100)
      memory.updatePlanProgress('finances', 100)
      memory.updatePlanProgress('goals', analysis.goalsAnalysis.totalGoals > 0 ? 100 : 50)
      return renderPlanInChat(plan, lang)
    }

    case 'PLAN_REVIEW':
      return getReviewAdvice(analysis, formData, budgetData, lang)

    case 'KNOWLEDGE_IMPORT':
      return lang === 'es'
        ? '📚 **Importar Conocimiento**\n\nPuedes arrastrar y soltar archivos aquí o pegar enlaces para que aprenda de ellos.\n\nFormatos aceptados: PDF, TXT, CSV, enlaces web.\n\n¿Qué te gustaría compartir conmigo?'
        : '📚 **Import Knowledge**\n\nYou can drag and drop files here or paste links for me to learn from them.\n\nAccepted formats: PDF, TXT, CSV, web links.\n\nWhat would you like to share with me?'

    case 'FOLLOW_UP':
      return getFollowUpAdvice(analysis, formData, lang)

    default:
      return WELCOME_MESSAGES[lang || 'es'].returning
  }
}

// ═══════════════════════════════════════════════════════════════
// ACTION REFERENCE ENFORCEMENT — ensures every response has an action ID
// ═══════════════════════════════════════════════════════════════

function _ensureActionRef(responseText, actionId, lang) {
  if (!actionId) return responseText
  const actionRefFootnote = lang === 'es'
    ? `\n\n📐 **Acción de referencia Nephi:** ${actionId}`
    : `\n\n📐 **Nephi reference action:** ${actionId}`
  return responseText + actionRefFootnote
}

// ═══════════════════════════════════════════════════════════════
// REVIEW AND FOLLOW-UP
// ═══════════════════════════════════════════════════════════════

function getReviewAdvice(analysis, formData, budgetData, lang) {
  const completeness = analysis.completeness
  const needs = analysis.needsAnalysis
  const finances = analysis.financialAnalysis
  const goals = analysis.goalsAnalysis

  const lines = [lang === 'es'
    ? `⚡ **Nephi Dev Agent — Revisión de progreso**`
    : `⚡ **Nephi Dev Agent — Progress review**`
  ]
  lines.push('')
  lines.push(lang === 'es'
    ? `**Completitud del formulario:** ${completeness.percent}%`
    : `**Form completeness:** ${completeness.percent}%`
  )
  lines.push(lang === 'es'
    ? `**Necesidades:** ${needs.score}/100 — ${needs.critical.length > 0 ? `${needs.critical.length} crítica(s)` : 'Estable'}${needs.warnings.length > 0 ? `, ${needs.warnings.length} pendiente(s)` : ''}`
    : `**Needs:** ${needs.score}/100 — ${needs.critical.length > 0 ? `${needs.critical.length} critical` : 'Stable'}${needs.warnings.length > 0 ? `, ${needs.warnings.length} pending` : ''}`
  )
  lines.push(lang === 'es'
    ? `**Finanzas:** ${finances.score}/100 — ${finances.isDeficit ? 'Déficit mensual' : 'Equilibrado'}${finances.hasDebt ? `, ${finances.debts.length} deuda(s)` : ''}`
    : `**Finances:** ${finances.score}/100 — ${finances.isDeficit ? 'Monthly deficit' : 'Balanced'}${finances.hasDebt ? `, ${finances.debts.length} debt(s)` : ''}`
  )
  lines.push(lang === 'es'
    ? `**Metas:** ${goals.score}/100 — ${goals.totalGoals} meta(s) definidas`
    : `**Goals:** ${goals.score}/100 — ${goals.totalGoals} goal(s) defined`
  )
  lines.push('')

  const suggestions = []
  if (finances.needsEmergencyFund) suggestions.push(lang === 'es' ? 'Construir fondo de emergencia (3-6 meses de gastos)' : 'Build emergency fund (3-6 months of expenses)')
  if (finances.isDeficit) suggestions.push(lang === 'es' ? 'Eliminar déficit — reducir gastos o aumentar ingresos' : 'Eliminate deficit — reduce expenses or increase income')
  if (goals.score < 50) suggestions.push(lang === 'es' ? 'Agregar pasos y fechas a las metas' : 'Add steps and deadlines to goals')
  if (completeness.missing.includes('commitmentStatement')) suggestions.push(lang === 'es' ? 'Completar declaración de compromiso' : 'Complete commitment statement')

  if (suggestions.length > 0) {
    lines.push(lang === 'es' ? '**Intervenciones requeridas:**' : '**Required interventions:**')
    for (const s of suggestions) lines.push(`- ${s}`)
    lines.push('')
  }

  lines.push(lang === 'es'
    ? '¿Requieres generación de plan mejorado o intervención en algún aspecto específico?'
    : 'Do you require improved plan generation or intervention in a specific aspect?'
  )

  return lines.join('\n')
}

function getFollowUpAdvice(analysis, formData, lang) {
  const completeness = analyzeCompleteness(formData)
  const needs = analysis.needsAnalysis

  if (completeness.percent < 30) {
    return nephiFrame(lang === 'es'
      ? `**Estado:** Formulario incompleto (${completeness.percent}%)\n**Acción requerida:** Completar secciones restantes del formulario de autosuficiencia.\n**Prioridad:** Alta — sin datos completos no es posible generar un plan preciso.\n\n¿Deseas que guíe la recolección de datos paso a paso?`
      : `**Status:** Incomplete form (${completeness.percent}%)\n**Required action:** Complete remaining self-sufficiency form sections.\n**Priority:** High — without complete data, a precise plan cannot be generated.\n\nShall I guide data collection step by step?`,
      lang)
  }
  if (needs.critical.length > 0) {
    return nephiFrame(lang === 'es'
      ? `**Estado:** ${needs.critical.length} área(s) crítica(s) detectadas\n**Acción requerida:** Abordar necesidades críticas antes de planificación avanzada.\n**Prioridad:** Inmediata.\n\n¿Has podido avanzar en alguna de estas áreas desde nuestra última intervención?`
      : `**Status:** ${needs.critical.length} critical area(s) detected\n**Required action:** Address critical needs before advanced planning.\n**Priority:** Immediate.\n\nHave you made progress on any of these areas since our last intervention?`,
      lang)
  }
  const goals = analysis.goalsAnalysis
  if (goals.totalGoals > 0 && goals.score < 50) {
    return nephiFrame(lang === 'es'
      ? `**Estado:** ${goals.totalGoals} meta(s) definidas, puntaje SMART ${goals.score}/100\n**Acción requerida:** Agregar pasos específicos y fechas límite a las metas existentes.\n**Prioridad:** Media.\n\n¿Requieres asistencia para detallar alguna meta en particular?`
      : `**Status:** ${goals.totalGoals} goal(s) defined, SMART score ${goals.score}/100\n**Required action:** Add specific steps and deadlines to existing goals.\n**Priority:** Medium.\n\nDo you require assistance detailing a specific goal?`,
      lang)
  }
  return nephiFrame(lang === 'es'
    ? `**Estado:** Progreso estable\n**Acción:** No se detectan intervenciones urgentes.\n**Recomendación:** Continuar con el plan actual y programar revisión en 30 días.\n\n¿Hay algún aspecto específico que requiera análisis adicional?`
    : `**Status:** Stable progress\n**Action:** No urgent interventions detected.\n**Recommendation:** Continue with current plan and schedule review in 30 days.\n\nIs there any specific aspect requiring additional analysis?`,
    lang)
}

// ═══════════════════════════════════════════════════════════════
// PLAN RENDERING (template-driven)
// ═══════════════════════════════════════════════════════════════

export function renderPlanInChat(plan, lang) {
  const t = (es, en) => lang === 'es' ? es : en
  const scoreColor = s => s >= 70 ? '✅' : s >= 40 ? '⚠️' : '🔴'

  const template = kb.getPlanTemplate()
  if (template && template.sections) {
    const output = []
    for (const section of template.sections) {
      if (section.type === 'static') {
        output.push(t(section.content_es || section.es, section.content_en || section.en))
        continue
      }
      if (section.type === 'dynamic' || section.type === 'array' || section.type === 'numbered_array') {
        const source = section.data_source.replace('plan.', '')
        const data = plan[source]
        if (!data) continue
        if (Array.isArray(data)) {
          const items = data.map((item, i) => {
            let itemText = t(section.item_template_es || section.item_template || '', section.item_template_en || section.item_template || '')
            for (const [k, v] of Object.entries(item)) {
              itemText = itemText.replace(`{${k}}`, String(v))
            }
            return itemText.replace('{i}', String(i + 1))
          }).join('\n')
          const header = t(section.header_es || section.template_es || '', section.header_en || section.template_en || '')
          output.push(header.replace('{items}', '\n' + items))
        } else {
          let text = t(section.template_es || section.content_es || '', section.template_en || section.content_en || '')
          if (section.fields) {
            for (const [fname, fconfig] of Object.entries(section.fields)) {
              const fsource = fconfig.source.replace('plan.', '')
              const fval = fsource.split('.').reduce((o, k) => (o || {})[k], plan)
              text = text.replace(`{${fname}}`, String(fval !== undefined ? fval : ''))
            }
          }
          text = text.replace('{scoreColor}', scoreColor(plan.overallScore))
          text = text.replace('{score}', String(plan.overallScore))
          if (plan.scores) {
            text = text.replace('{needs}', String(plan.scores.needs))
              .replace('{finances}', String(plan.scores.finances))
              .replace('{goals}', String(plan.scores.goals))
          }
          output.push(text)
        }
      }
    }
    return output.join('\n')
  }

  const lines = [
    `╔═══════════════════════════════════════════════════╗`,
    `║      ${t('PLAN DE AUTOSUFICIENCIA', 'SELF-SUFFICIENCY PLAN').padEnd(42)}║`,
    `╚═══════════════════════════════════════════════════╝`,
    '',
    `${scoreColor(plan.overallScore)} **${t('Puntaje General', 'Overall Score')}: ${plan.overallScore}/100**`,
    `   ${t('Necesidades', 'Needs')}: ${plan.scores.needs}/100  |  ${t('Finanzas', 'Finances')}: ${plan.scores.finances}/100  |  ${t('Metas', 'Goals')}: ${plan.scores.goals}/100`,
    '',
    `1️⃣ ${t('Evaluación de Necesidades', 'Needs Assessment')}`,
    ...plan.needsAssessment.map(n => `   ${n.emoji} ${n.area}: ${n.score}/5 — ${n.status}`),
    '',
    `2️⃣ ${t('Salud Financiera', 'Financial Health')}`,
    `   ${t('Ingresos', 'Income')}: ${plan.financeDetails.income}  |  ${t('Gastos', 'Expenses')}: ${plan.financeDetails.expenses}`,
    `   ${t('Balance', 'Balance')}: ${plan.financeDetails.balance}  |  ${t('Deuda total', 'Total debt')}: ${plan.financeDetails.totalDebt}`,
    ...(plan.financeDetails.emergencyFundMonths !== undefined ? [`   ${t('Fondo emergencia', 'Emergency fund')}: ${plan.financeDetails.emergencyFundMonths} ${t('mese(s)', 'month(s)')}`] : []),
    '',
    `3️⃣ ${t('Metas SMART', 'SMART Goals')}`,
    ...plan.goals.map(g => `   ${g.emoji} **${g.timeframe}:** ${g.goal}`),
    '',
    `4️⃣ ${t('Plan de Acción', 'Action Plan')} — ${t('Prioridades', 'Priorities')}`,
    ...plan.actionItems.map((a, i) => `   ${i + 1}. ${a.emoji} **${a.action}** — ${a.detail}`),
    '',
    `5️⃣ ${t('Análisis de Riesgos', 'Risk Analysis')}`,
    ...plan.risks.map(r => `   ${r.emoji} ${r.risk}`),
    '',
    `📅 ${t('Próxima revisión recomendada', 'Next review recommended')}: ${plan.nextReviewDate}`,
    '',
    t('¿Quieres que detalle alguna sección o ajuste algo?', 'Would you like me to detail any section or adjust something?'),
  ]
  return lines.join('\n')
}

function buildEmotionalResponse(routing, userMessage, lang) {
  const strategy = routing.responseStrategy
  if (!strategy) return null

  const template = strategy.templates
    ? (strategy.templates[lang] || strategy.templates.en)
    : null
  if (!template || template.length === 0) return null

  const selected = template[Math.floor(Math.random() * template.length)]

  const modeLabel = lang === 'es'
    ? (routing.mode === 'EMOTIONAL_SUPPORT_MODE' ? 'Modo apoyo emocional' : 'Modo reflexión')
    : (routing.mode === 'EMOTIONAL_SUPPORT_MODE' ? 'Emotional Support Mode' : 'Reflection Mode')

  const prefix = `⚡ **Nephi Dev Agent — ${modeLabel}**\n\n`

  return prefix + selected
}

function _handleDevRequest(userMessage, lang) {
  const registry = buildModuleRegistry()
  const packageJson = buildPackageJson()
  const result = routeDevRequest(userMessage, registry, packageJson)
  const t = (es, en) => lang === 'es' ? es : en

  const header = `⚡ **Nephi Dev Agent — ${t('Análisis de código', 'Code Analysis')}**\n`

  switch (result.type) {
    case 'inspect': {
      if (result.error) {
        return `${header}\n${t('Error', 'Error')}: ${result.error}\n\n${t('Módulos disponibles', 'Available modules')}: ${result.registry.join(', ')}`
      }
      if (result.target) {
        return `${header}\n**${t('Módulo', 'Module')}:** ${result.target}\n${t('Exportaciones', 'Exports')}: ${(result.exports || []).join(', ') || t('Ninguna', 'None')}\n${t('Importaciones', 'Imports')}: ${(result.imports || []).join(', ') || t('Ninguna', 'None')}\n${t('Tamaño', 'Size')}: ${result.size} ${t('líneas', 'lines')}\n${t('Dependencias', 'Dependencies')}: ${(result.dependencies || []).join(', ') || t('Ninguna', 'None')}`
      }
      return `${header}\n${t('Registro de módulos', 'Module registry')}: ${result.count} ${t('módulos', 'modules')}\n${Object.keys(registry).join(', ')}`
    }

    case 'dependency': {
      const lines = [header]
      if (result.scan) {
        lines.push(`\n**${t('Escaneo de dependencias', 'Dependency scan')}**`)
        lines.push(`${t('Instaladas', 'Installed')}: ${result.scan.installedDependencies.length}`)
        lines.push(`${t('Faltantes', 'Missing')}: ${result.scan.missingDependencies.length}`)
      }
      if (result.advice && result.advice.recommendations) {
        lines.push(`\n**${t('Recomendaciones', 'Recommendations')}:**`)
        for (const r of result.advice.recommendations) {
          lines.push(`  \`${r.installCmd}\` ${r.viteCompatible ? '✅' : '⚠️'}`)
        }
      }
      if (result.viteIssues && result.viteIssues.warnings) {
        lines.push(`\n**${t('Advertencias Vite', 'Vite warnings')}:**`)
        for (const w of result.viteIssues.warnings) {
          lines.push(`  ⚠️ ${w.detail}`)
        }
      }
      return lines.join('\n')
    }

    case 'patch': {
      if (result.error) {
        return `${header}\n**${t('Error de validación', 'Validation error')}:** ${result.error}`
      }
      return `${header}\n✅ ${t('Parche aprobado — listo para ejecución', 'Patch approved — ready for execution')}\n${t('Ejecutar', 'Run')}: \`npm install\` ${t('si hay dependencias pendientes', 'if dependencies are pending')}`
    }

    case 'validate': {
      if (!result.validation) return `${header}\n${t('Sin resultados de validación', 'No validation results')}`
      return `${header}\n✅ ${t('Seguro', 'Safe')}: ${result.validation.safe}\n${t('Errores', 'Errors')}: ${(result.validation.errors || []).join('; ') || t('Ninguno', 'None')}\n${t('Advertencias', 'Warnings')}: ${(result.validation.warnings || []).join('; ') || t('Ninguna', 'None')}`
    }

    case 'explain': {
      if (result.error) return `${header}\n${t('Error', 'Error')}: ${result.error}`
      return `${header}\n${result.details || result.message}`
    }

    default:
      return `${header}\n${t('No se pudo determinar el tipo de solicitud de desarrollo.', 'Could not determine development request type.')}\n${t('Tipos soportados', 'Supported types')}: inspect, patch, dependency, validate, explain`
  }
}
