import { analyzeNeeds, analyzeFinances, analyzeGoals, identifyRisks } from './Analyzer.js'
import { NEEDS_DOMAINS } from './config/domains.js'

export function generatePlan(formData, budgetData, lang = 'es') {
  const needs = analyzeNeeds(formData)
  const finances = analyzeFinances(formData)
  const goals = analyzeGoals(formData)
  const risks = identifyRisks(formData)

  const needsAssessment = buildNeedsAssessment(needs, formData, lang)
  const financeDetails = buildFinanceDetails(finances, formData, lang)
  const goalsList = buildGoalsList(goals, formData, lang)
  const actionItems = buildActionItems(needs, finances, goals, formData, lang)
  const riskItems = buildRiskItems(risks, lang)
  const scores = {
    needs: needs.score,
    finances: finances.score,
    goals: goals.score,
  }
  const overallScore = Math.round((needs.score + finances.score + goals.score) / 3)

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + 30)
  const nextReviewDate = nextReview.toLocaleDateString(lang === 'es' ? 'es-HN' : 'en-US')

  return {
    overallScore,
    scores,
    needsAssessment,
    financeDetails,
    goals: goalsList,
    actionItems,
    risks: riskItems,
    nextReviewDate,
    generatedAt: new Date().toISOString(),
  }
}

function buildNeedsAssessment(needs, formData, lang) {
  const allAreas = []
  const d = formData || {}

  for (const area of NEEDS_DOMAINS) {
    const val = parseInt(d[area.key])
    if (val === undefined || isNaN(val)) continue
    const status = val <= 2 ? (lang === 'es' ? '🔴 Crítico' : '🔴 Critical')
      : val <= 3 ? (lang === 'es' ? '🟡 Atención' : '🟡 Attention')
        : (lang === 'es' ? '🟢 Estable' : '🟢 Stable')
    allAreas.push({
      area: lang === 'es' ? area.labelEs : area.labelEn,
      score: val,
      status,
      emoji: area.emoji,
    })
  }

  return allAreas
}

function buildFinanceDetails(finances, formData, lang) {
  const fmt = amount => {
    const num = parseFloat(amount) || 0
    if (lang === 'es') return `L ${num.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  return {
    income: fmt(finances.income),
    expenses: fmt(finances.expenses),
    balance: fmt(finances.balance),
    totalDebt: fmt(finances.totalDebt),
    emergencyFundMonths: finances.emergencyFundMonths.toFixed(1),
    isDeficit: finances.isDeficit,
    debtToIncome: finances.debtToIncome.toFixed(0),
    savingsRate: finances.savingsRate.toFixed(0),
  }
}

function buildGoalsList(goals, formData, lang) {
  const result = []
  const d = formData || {}

  const short = (d.shortTermGoals || []).filter(g => g.goal)
  const medium = (d.mediumTermGoals || []).filter(g => g.goal)
  const long = (d.longTermGoals || []).filter(g => g.goal)

  for (const g of short) {
    result.push({
      timeframe: lang === 'es' ? 'Corto Plazo (0-3m)' : 'Short-term (0-3m)',
      goal: g.goal,
      steps: g.steps || (lang === 'es' ? 'Sin pasos definidos' : 'No steps defined'),
      deadline: g.deadline || (lang === 'es' ? 'Sin fecha' : 'No deadline'),
      emoji: '🎯',
    })
  }
  for (const g of medium) {
    result.push({
      timeframe: lang === 'es' ? 'Mediano Plazo (3-12m)' : 'Medium-term (3-12m)',
      goal: g.goal,
      steps: g.steps || (lang === 'es' ? 'Sin pasos definidos' : 'No steps defined'),
      deadline: g.deadline || (lang === 'es' ? 'Sin fecha' : 'No deadline'),
      emoji: '📋',
    })
  }
  for (const g of long) {
    result.push({
      timeframe: lang === 'es' ? 'Largo Plazo (1-5a)' : 'Long-term (1-5y)',
      goal: g.goal,
      steps: g.steps || (lang === 'es' ? 'Sin pasos definidos' : 'No steps defined'),
      deadline: g.deadline || (lang === 'es' ? 'Sin fecha' : 'No deadline'),
      emoji: '🌟',
    })
  }

  if (result.length === 0) {
    const suggestions = generateSmartGoalSuggestions(formData, lang)
    result.push(...suggestions)
  }

  return result
}

function generateSmartGoalSuggestions(formData, lang) {
  const d = formData || {}
  const fin = analyzeFinances(d)
  const suggestions = []

  const smallestDebt = (d.debts || [])
    .filter(debt => parseFloat(debt.balance) > 0)
    .sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance))[0]

  if (smallestDebt && lang === 'es') {
    suggestions.push({
      timeframe: 'Corto Plazo (0-3m)',
      goal: `Pagar deuda de ${smallestDebt.creditor || 'menor monto'} (L ${parseFloat(smallestDebt.balance).toFixed(0)})`,
      steps: 'Pagar cuota mínima en todas las deudas y destinar dinero extra a esta deuda',
      deadline: '',
      emoji: '🎯',
    })
  } else if (smallestDebt) {
    suggestions.push({
      timeframe: 'Short-term (0-3m)',
      goal: `Pay off ${smallestDebt.creditor || 'smallest'} debt (${parseFloat(smallestDebt.balance).toFixed(0)})`,
      steps: 'Pay minimum on all debts and put extra money toward this one',
      deadline: '',
      emoji: '🎯',
    })
  }

  if (fin.emergencyFundMonths < 3) {
    const target = fin.expenses * 3
    if (lang === 'es') {
      suggestions.push({
        timeframe: 'Corto Plazo (0-3m)',
        goal: `Crear fondo de emergencia de L ${Math.min(target, 5000).toFixed(0)}`,
        steps: 'Ahorrar L 500-1000 cada quincena en una cuenta separada',
        deadline: '',
        emoji: '🛡️',
      })
    } else {
      suggestions.push({
        timeframe: 'Short-term (0-3m)',
        goal: `Create emergency fund of ${Math.min(target, 5000).toFixed(0)}`,
        steps: 'Save 500-1000 every two weeks in a separate account',
        deadline: '',
        emoji: '🛡️',
      })
    }
  }

  if (suggestions.length === 0) {
    if (lang === 'es') {
      suggestions.push({
        timeframe: 'Corto Plazo (0-3m)',
        goal: 'Aumentar tasa de ahorro al 15% de los ingresos',
        steps: 'Automatizar transferencia de ahorro el día de cobro',
        deadline: '',
        emoji: '💰',
      })
    } else {
      suggestions.push({
        timeframe: 'Short-term (0-3m)',
        goal: 'Increase savings rate to 15% of income',
        steps: 'Automate savings transfer on payday',
        deadline: '',
        emoji: '💰',
      })
    }
  }

  return suggestions
}

function buildActionItems(needs, finances, goals, formData, lang) {
  const items = []

  for (const c of needs.critical) {
    items.push({
      action: lang === 'es' ? `Abordar ${c.area} (${c.value}/5)` : `Address ${c.area} (${c.value}/5)`,
      detail: c.message,
      emoji: '🔴',
      priority: 1,
    })
  }

  if (finances.isDeficit) {
    items.push({
      action: lang === 'es' ? 'Eliminar déficit mensual' : 'Eliminate monthly deficit',
      detail: lang === 'es'
        ? `Reducir gastos en L ${Math.abs(finances.balance).toFixed(0)}/mes o aumentar ingresos`
        : `Reduce expenses by ${Math.abs(finances.balance).toFixed(0)}/month or increase income`,
      emoji: '⚠️',
      priority: 2,
    })
  }

  if (finances.needsEmergencyFund) {
    items.push({
      action: lang === 'es' ? 'Construir fondo de emergencia' : 'Build emergency fund',
      detail: lang === 'es'
        ? `Meta: ${finances.emergencyFundMonths} → 3-6 meses de gastos (L ${(finances.expenses * 3).toFixed(0)})`
        : `Target: ${finances.emergencyFundMonths} → 3-6 months of expenses (${(finances.expenses * 3).toFixed(0)})`,
      emoji: '🛡️',
      priority: 3,
    })
  }

  if (finances.hasDebt && finances.debtToIncome > 0) {
    items.push({
      action: lang === 'es' ? 'Implementar plan de pago de deudas' : 'Implement debt payment plan',
      detail: lang === 'es'
        ? `${finances.debts.length} deuda(s) — usar método bola de nieve (de la más pequeña a la más grande)`
        : `${finances.debts.length} debt(s) — use snowball method (smallest to largest)`,
      emoji: '💳',
      priority: 4,
    })
  }

  if (finances.savingsRate < 10) {
    items.push({
      action: lang === 'es' ? 'Aumentar tasa de ahorro' : 'Increase savings rate',
      detail: lang === 'es'
        ? `Actual: ${finances.savingsRate}% → Meta: 10-20% de ingresos`
        : `Current: ${finances.savingsRate}% → Target: 10-20% of income`,
      emoji: '💰',
      priority: 5,
    })
  }

  const goalsTotal = goals.totalGoals
  if (goalsTotal === 0) {
    items.push({
      action: lang === 'es' ? 'Definir metas SMART' : 'Define SMART goals',
      detail: lang === 'es'
        ? 'Establecer metas específicas, medibles, alcanzables, relevantes y con plazo'
        : 'Set specific, measurable, achievable, relevant, time-bound goals',
      emoji: '🎯',
      priority: 6,
    })
  }

  items.push({
    action: lang === 'es' ? 'Programar revisión del plan' : 'Schedule plan review',
    detail: lang === 'es' ? 'Revisar progreso en 30 días y ajustar según sea necesario' : 'Review progress in 30 days and adjust as needed',
    emoji: '📅',
    priority: 7,
  })

  return items.sort((a, b) => a.priority - b.priority)
}

function buildRiskItems(risks, lang) {
  const items = []

  for (const risk of risks.criticalRisks) {
    items.push({
      risk,
      emoji: '🔴',
    })
  }
  for (const warning of risks.warnings) {
    items.push({
      risk: warning,
      emoji: '🟡',
    })
  }
  if (items.length === 0) {
    items.push({
      risk: lang === 'es' ? 'Sin riesgos críticos identificados' : 'No critical risks identified',
      emoji: '🟢',
    })
  }

  return items
}

export function scorePlan(plan) {
  let score = plan.overallScore

  const hasCritical = plan.risks.some(r => r.emoji === '🔴')
  if (hasCritical) score -= 10

  const hasAllGoals = plan.goals.length >= 3
  if (!hasAllGoals) score -= 5

  return {
    score: Math.max(0, Math.min(100, score)),
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
    needsImprovement: score < 70,
  }
}
