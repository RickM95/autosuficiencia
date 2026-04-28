import { getBudgetAdvice, getDebtAdvice, getSavingsAdvice, getIncomeAdvice } from './advice/finances.js'
import { getNeedsAdvice, getStressAdvice, getResourcesAdvice } from './advice/wellbeing.js'
import { getGoalsAdvice } from './advice/goals.js'
import { analyzeCompleteness } from './Analyzer.js'
import { generatePlan } from './PlanGenerator.js'
import KbEngine from './kb/KbEngine.js'

const kb = new KbEngine()

const WELCOME_MESSAGES = {
  es: {
    first: `👋 **¡Hola! Soy Asesor AS**, tu asistente experto en autosuficiencia, bienestar emocional y finanzas personales.\n\nPuedo ayudarte a:\n- 📊 **Analizar tu situación** — evaluar tus necesidades y finanzas\n- 🎯 **Crear metas** — establecer objetivos SMART alcanzables\n- 💰 **Manejar tu dinero** — presupuesto, deudas, ahorro\n- 📋 **Generar tu plan** — un plan de autosuficiencia profesional\n- 📚 **Importar conocimiento** — sube PDFs, artículos o enlaces para enriquecer mi base de datos\n\n¿En qué te puedo ayudar hoy?`,
    returning: `👋 **¡Hola de nuevo!** ¿Cómo puedo ayudarte hoy a avanzar en tu plan de autosuficiencia?`,
  },
  en: {
    first: `👋 **Hello! I'm Asesor AS**, your expert assistant in self-sufficiency, emotional wellbeing, and personal finance.\n\nI can help you:\n- 📊 **Analyze your situation** — assess your needs and finances\n- 🎯 **Create goals** — set achievable SMART objectives\n- 💰 **Manage your money** — budget, debt, savings\n- 📋 **Generate your plan** — a professional self-sufficiency plan\n- 📚 **Import knowledge** — upload PDFs, articles, or links to enrich my database\n\nHow can I help you today?`,
    returning: `👋 **Welcome back!** How can I help you move forward with your self-sufficiency plan today?`,
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
  const validation = kb.validateResponse({
    actions: [{ actionId: 'fallback', steps: [response.substring(0, 100)] }],
    principles: [],
  })

  if (!validation.valid) {
    return kb.kbStructureError + '\n\n' + response
  }

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
    ? `\n\n📋 **Acción de referencia:** ${actionId}`
    : `\n\n📋 **Reference action:** ${actionId}`
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

  const lines = []
  if (lang === 'es') {
    lines.push('📋 **Revisión de tu Progreso**\n')
    lines.push(`**Completitud del formulario:** ${completeness.percent}%`)
    lines.push(`**Necesidades:** ${needs.score}/100 — ${needs.critical.length > 0 ? `${needs.critical.length} crítica(s)` : 'Estable'}${needs.warnings.length > 0 ? `, ${needs.warnings.length} área(s) pendiente(s)` : ''}`)
    lines.push(`**Finanzas:** ${finances.score}/100 — ${finances.isDeficit ? 'Déficit mensual' : 'Equilibrado'}${finances.hasDebt ? `, ${finances.debts.length} deuda(s)` : ''}`)
    lines.push(`**Metas:** ${goals.score}/100 — ${goals.totalGoals} meta(s) definidas`)
    lines.push('')
    const suggestions = []
    if (finances.needsEmergencyFund) suggestions.push('Construir fondo de emergencia (cubre 3-6 meses de gastos)')
    if (finances.isDeficit) suggestions.push('Reducir gastos o aumentar ingresos para eliminar el déficit')
    if (goals.score < 50) suggestions.push('Agregar pasos específicos y fechas límite a tus metas')
    if (completeness.missing.includes('commitmentStatement')) suggestions.push('Completar tu declaración de compromiso')
    if (suggestions.length > 0) {
      lines.push('**Sugerencias para mejorar:**')
      for (const s of suggestions) lines.push(`- ${s}`)
      lines.push('')
    }
    lines.push('¿Quieres que genere una versión mejorada del plan o te ayudo con algún aspecto específico?')
  } else {
    lines.push('📋 **Progress Review**\n')
    lines.push(`**Form completeness:** ${completeness.percent}%`)
    lines.push(`**Needs:** ${needs.score}/100 — ${needs.critical.length > 0 ? `${needs.critical.length} critical` : 'Stable'}${needs.warnings.length > 0 ? `, ${needs.warnings.length} pending` : ''}`)
    lines.push(`**Finances:** ${finances.score}/100 — ${finances.isDeficit ? 'Monthly deficit' : 'Balanced'}${finances.hasDebt ? `, ${finances.debts.length} debt(s)` : ''}`)
    lines.push(`**Goals:** ${goals.score}/100 — ${goals.totalGoals} goal(s) defined`)
    lines.push('')
    const suggestions = []
    if (finances.needsEmergencyFund) suggestions.push('Build emergency fund (cover 3-6 months of expenses)')
    if (finances.isDeficit) suggestions.push('Reduce expenses or increase income to eliminate the deficit')
    if (goals.score < 50) suggestions.push('Add specific steps and deadlines to your goals')
    if (completeness.missing.includes('commitmentStatement')) suggestions.push('Complete your commitment statement')
    if (suggestions.length > 0) {
      lines.push('**Suggestions to improve:**')
      for (const s of suggestions) lines.push(`- ${s}`)
      lines.push('')
    }
    lines.push('Would you like me to generate an improved plan or help with a specific aspect?')
  }
  return lines.join('\n')
}

function getFollowUpAdvice(analysis, formData, lang) {
  const completeness = analyzeCompleteness(formData)
  const needs = analysis.needsAnalysis

  if (completeness.percent < 30) {
    return lang === 'es'
      ? `📝 **Sigamos adelante.** Veo que aún no has completado el formulario de autosuficiencia. ¿Te gustaría que te guíe paso a paso? Podemos empezar con tu información personal.`
      : `📝 **Let's keep going.** I see you haven't completed the self-sufficiency form yet. Would you like me to guide you through it step by step? We can start with your personal information.`
  }
  if (needs.critical.length > 0) {
    return lang === 'es'
      ? `🤗 **¿Cómo estás hoy?** Recuerda que las áreas críticas que identificamos son importantes. ¿Has podido avanzar en alguna de ellas? No importa si es un paso pequeño — cada paso cuenta.`
      : `🤗 **How are you today?** Remember the critical areas we identified are important. Have you been able to make progress on any of them? It doesn't matter if it's a small step — every step counts.`
  }
  const goals = analysis.goalsAnalysis
  if (goals.totalGoals > 0 && goals.score < 50) {
    return lang === 'es'
      ? `🎯 **Revisemos tus metas.** Tienes ${goals.totalGoals} meta(s) definidas, pero algunas les faltan pasos o fechas. ¿Quieres que te ayude a detallar una?`
      : `🎯 **Let's review your goals.** You have ${goals.totalGoals} goal(s) defined, but some are missing steps or deadlines. Would you like help detailing one?`
  }
  return lang === 'es'
    ? `💪 **¡Sigue así!** Has avanzado bien. ¿Hay algo específico en lo que pueda ayudarte hoy para seguir progresando?`
    : `💪 **Keep it up!** You've made good progress. Is there anything specific I can help you with today to keep moving forward?`
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
