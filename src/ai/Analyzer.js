import { NEEDS_DOMAINS, INCOME_FIELDS, EXPENSE_FIELDS, COMPLETENESS_WEIGHTS } from './config/domains.js'

export function analyzeNeeds(formData) {
  if (!formData) return { critical: [], warnings: [], ok: [], score: 0 }
  const d = formData
  const critical = []
  const warnings = []
  const ok = []

  for (const check of NEEDS_DOMAINS) {
    const val = d[check.key]
    if (val === undefined || val === null) {
      warnings.push({ area: check.labelEn, value: null, message: 'Not assessed' })
      continue
    }
    if (val <= check.critical) critical.push({ area: check.labelEn, value: val, message: `${check.labelEn} is critical (${val}/5)` })
    else if (val <= check.warn) warnings.push({ area: check.labelEn, value: val, message: `${check.labelEn} needs attention (${val}/5)` })
    else ok.push({ area: check.labelEn, value: val, message: `${check.labelEn} is stable (${val}/5)` })
  }

  const total = NEEDS_DOMAINS.reduce((s, c) => s + (parseInt(d[c.key]) || 0), 0)
  const max = NEEDS_DOMAINS.length * 5
  const score = Math.round((total / max) * 100)

  return { critical, warnings, ok, score }
}

export function analyzeFinances(formData) {
  if (!formData) return { score: 0, income: 0, expenses: 0, balance: 0, metrics: {} }
  const d = formData

  const income = INCOME_FIELDS.reduce((s, f) => s + (parseFloat(d[f]) || 0), 0)
  const expenses = EXPENSE_FIELDS.reduce((s, f) => s + (parseFloat(d[f]) || 0), 0)
  const balance = income - expenses

  const debts = (d.debts || []).filter(debt => parseFloat(debt.balance) > 0)
  const totalDebt = debts.reduce((s, debt) => s + (parseFloat(debt.balance) || 0), 0)
  const totalDebtPayment = debts.reduce((s, debt) => s + (parseFloat(debt.payment) || 0), 0)
  const emergencyFund = parseFloat(d.emergencyFund) || 0
  const totalSavings = parseFloat(d.totalSavings) || 0

  const debtToIncome = income > 0 ? (totalDebtPayment / income) * 100 : 0
  const savingsRate = income > 0 ? ((parseFloat(d.expSavings) || 0) / income) * 100 : 0
  const emergencyFundMonths = expenses > 0 ? emergencyFund / expenses : 0

  let score = 50
  if (balance > 0) score += 15
  if (balance > income * 0.2) score += 10
  if (debtToIncome < 15) score += 10
  if (debtToIncome < 5) score += 5
  if (emergencyFundMonths >= 3) score += 10
  if (emergencyFundMonths >= 6) score += 5
  if (savingsRate >= 10) score += 10
  if (savingsRate >= 20) score += 5
  if (totalDebt === 0) score += 10
  if (balance < 0) score -= 20
  if (debtToIncome > 30) score -= 15
  if (debtToIncome > 50) score -= 10
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    income,
    expenses,
    balance,
    totalDebt,
    totalDebtPayment,
    emergencyFund,
    totalSavings,
    emergencyFundMonths,
    debtToIncome,
    savingsRate,
    debts,
    isDeficit: balance < 0,
    hasDebt: totalDebt > 0,
    hasEmergencyFund: emergencyFund > 0,
    needsEmergencyFund: emergencyFundMonths < 3,
  }
}

export function analyzeGoals(formData) {
  if (!formData) return { score: 0, short: [], medium: [], long: [], completeness: 0 }
  const d = formData

  const short = (d.shortTermGoals || []).filter(g => g.goal)
  const medium = (d.mediumTermGoals || []).filter(g => g.goal)
  const long = (d.longTermGoals || []).filter(g => g.goal)
  const all = [...short, ...medium, ...long]

  if (all.length === 0) return { score: 0, short, medium, long, completeness: 0 }

  const withSteps = all.filter(g => g.steps && g.steps.trim())
  const withDeadlines = all.filter(g => g.deadline)
  const specific = all.filter(g => g.goal.length > 15)
  const smartCompleteness = (withSteps.length + withDeadlines.length + specific.length) / (all.length * 3)

  const hasShort = short.length > 0 ? 25 : 0
  const hasMedium = medium.length > 0 ? 25 : 0
  const hasLong = long.length > 0 ? 20 : 0
  const smart = Math.round(smartCompleteness * 30)

  const score = Math.min(100, hasShort + hasMedium + hasLong + smart)

  return { score, short, medium, long, completeness: all.length, totalGoals: all.length }
}

export function analyzeResources(formData) {
  if (!formData) return { score: 0, skills: [], communityResources: [], techAccess: {} }
  const d = formData

  const skills = (d.skills || []).length
  const community = (d.communityResources || []).length
  const techScore = [d.hasPhone, d.hasInternet, d.hasComputer, d.hasBankAccount].filter(Boolean).length

  const score = Math.min(100, skills * 10 + community * 8 + techScore * 10)
  return {
    score,
    skillsCount: skills,
    communityCount: community,
    techScore,
    hasFamilySupport: !!d.familySupport,
    languages: d.languages || '',
  }
}

export function analyzeCompleteness(formData) {
  if (!formData) return { percent: 0, missing: [], total: 0, filled: 0 }
  const d = formData

  const fields = COMPLETENESS_WEIGHTS

  let totalWeight = 0
  let filledWeight = 0
  const missing = []

  for (const field of fields) {
    totalWeight += field.weight
    const val = d[field.key]
    const filled = val !== undefined && val !== null && val !== '' &&
      !(Array.isArray(val) && val.length === 0) &&
      !(Array.isArray(val) && val.every(g => !g.goal))
    if (filled) {
      filledWeight += field.weight
    } else {
      missing.push(field.key)
    }
  }

  return {
    percent: totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0,
    missing,
    filled: filledWeight,
    total: totalWeight,
  }
}

export function identifyRisks(formData) {
  if (!formData) return { criticalRisks: [], warnings: [], summary: '' }
  const d = formData
  const criticalRisks = []
  const warnings = []

  if ((d.foodSecurity || 5) <= 2) criticalRisks.push('Food insecurity — may not have reliable access to sufficient food')
  if ((d.housingSecurity || 5) <= 2) criticalRisks.push('Housing instability — at risk of losing shelter')
  if ((d.mentalHealth || 5) <= 2) criticalRisks.push('Significant emotional distress — may need counseling')
  if (d.housingSituation === 'homeless') criticalRisks.push('Currently without housing — needs immediate shelter assistance')

  const income = ['incSalary', 'incSpouse', 'incBusiness', 'incRent', 'incRemittance', 'incGovAid', 'incFamily', 'incOther']
    .reduce((s, f) => s + (parseFloat(d[f]) || 0), 0)
  const expenses = ['expHousing', 'expFood', 'expTransport', 'expUtilities', 'expHealth', 'expClothing', 'expEducation', 'expDebt', 'expSavings', 'expTithes', 'expPersonal', 'expOther']
    .reduce((s, f) => s + (parseFloat(d[f]) || 0), 0)

  if (income > 0 && expenses > income) criticalRisks.push('Monthly budget deficit — spending exceeds income')
  if (income === 0 && expenses === 0) warnings.push('No financial data provided — income and expenses not recorded')

  const totalDebt = (d.debts || []).reduce((s, debt) => s + (parseFloat(debt.balance) || 0), 0)
  if (totalDebt > income * 6) warnings.push('Debt is more than 6x monthly income — high debt burden')
  if (totalDebt > 0 && (!d.emergencyFund || parseFloat(d.emergencyFund) === 0)) {
    warnings.push('Has debt but no emergency fund — any unexpected expense may require more debt')
  }

  const emergencyFundMonths = expenses > 0 ? (parseFloat(d.emergencyFund) || 0) / expenses : 0
  if (emergencyFundMonths < 1 && income > 0) warnings.push('Emergency fund covers less than 1 month of expenses (target: 3-6 months)')

  const summary = criticalRisks.length > 0
    ? `${criticalRisks.length} critical risk(s) identified — address these first`
    : warnings.length > 0
      ? `${warnings.length} area(s) need attention`
      : 'No critical risks detected'

  return { criticalRisks, warnings, summary }
}

export function analyzeMessage(message) {
  const msg = message.toLowerCase()

  const topics = {
    budget: /presupuesto|budget|gasto|expense|gastar|spend|dinero|money|costo/i,
    debt: /deuda|debt|préstamo|loan|tarjeta|credit|adeudado|owing|interest|interés/i,
    emergency: /emergencia|emergency|ahorro|saving|fondo|fund|ahorrar|save/i,
    stress: /estrés|stress|ansiedad|anxiety|deprim|triste|overwhelm|agobiado|preocupado|worried/i,
    income: /trabajo|work|empleo|job|ganar|earn|negocio|business|ingreso|income|salario|salary/i,
    goals: /meta|goal|objetivo|plan|futuro|future|sueño|dream|aspiración|aspiration/i,
    housing: /vivienda|housing|casa|house|alquiler|rent|hogar|home/i,
    food: /comida|food|alimentación|alimentación|nutrición|cocina|cooking|huerto|garden/i,
    education: /educación|education|estudio|study|curso|course|carrera|degree|capacitación|training/i,
    resources: /recurso|resource|ayuda|help|programa|program|gobierno|government|ong|ngo|iglesia|church/i,
    health: /salud|health|médico|medical|medicina|medicine|doctor|enfermedad|illness/i,
    plan: /plan|generate|generar|crear|create|hacer|make|documento|document|print|imprimir/i,
  }

  for (const [topic, pattern] of Object.entries(topics)) {
    if (pattern.test(msg)) return topic
  }
  return 'general'
}

export function detectLanguage(message) {
  const spanishWords = /\b(el|la|los|las|un|una|que|de|en|y|es|por|con|para|como|qué|cómo|tengo|quiero|necesito|ayuda|dinero|familia|más|pero|este|esta|puedo|hacer|soy|eres|estoy|está|son|han|he|has|me|te|se|lo|su|mis|tus|sus|nos|le|les|del|al|del|muy|bien|mal|ahora|siempre|nunca|también|entonces|porque|cuando|donde|quien|todo|cada|otro|mismo|así|solo|aunque|sin|entre|durante|después|antes|hasta|contra|mediante|según|salvo|excepto)\b/i
  return spanishWords.test(message) ? 'es' : 'en'
}
