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
  if (!message || typeof message !== 'string') return 'es'
  const text = message.trim()
  if (!text) return 'es'

  const distinctiveSpanish = [
    /\b(hola|gracias|por favor|buenos días|buenas|adiós|señor|señora|señores)\b/i,
    /\b(necesito|necesitas|necesita|necesitamos|necesitan|necesario)\b/i,
    /\b(quiero|quieres|quiere|queremos|quieren|quisiera|quisieras)\b/i,
    /\b(puedo|puedes|puede|podemos|pueden|pude|pudiste|pudo|pudimos|pudieron)\b/i,
    /\b(tengo|tienes|tiene|tenemos|tienen|tuve|tuviste|tuvo|tuvimos|tuvieron|tenía|tenías)\b/i,
    /\b(hago|haces|hace|hacemos|hacen|hice|hiciste|hizo|hicimos|hicieron)\b/i,
    /\b(estoy|estás|está|estamos|están|estuve|estuviste|estuvo|estuvimos|estuvieron)\b/i,
    /\b(soy|eres|somos|sois|sea|seas|seamos|seáis|sean|era|eras|éramos|eran|será|serán)\b/i,
    /\b(he|has|ha|hemos|habéis|han|había|habías|habíamos|habían|habrá|habrán)\b/i,
    /\b(dinero|presupuesto|deuda|trabajo|familia|casa|vida|tiempo|día|año|mes|semana|hora|momento)\b/i,
    /\b(gente|mundo|problema|situación|solución|ayuda|apoyo|cambio|mejora|oportunidad|futuro|meta|meta)\b/i,
    /\b(gracias|ayuda|favor|disculpa|perdón|permiso|claro|seguro|listo|bueno|malo|peor|mejor|mayor|menor)\b/i,
    /\b(entonces|también|tampoco|siempre|nunca|jamás|todavía|aún|ya|ahora|luego|después|antes|durante|mientras)\b/i,
    /\b(mucho|mucha|muchos|muchas|poco|poca|pocos|pocas|bastante|demasiado|suficiente|varios|variadas)\b/i,
    /\b(porque|por qué|cuándo|dónde|quién|cómo|cuál|cuáles|cuánto|cuántos|cuánta|cuántas|qué|quien|quienes)\b/i,
    /\b(mismo|misma|mismos|mismas|otro|otra|otros|otras|cada|todo|toda|todos|todas|ningún|ninguna|ningunos)\b/i,
    /\b(entre|durante|después|antes|hasta|desde|hacia|contra|mediante|según|salvo|excepto|sin|sobre|tras|ante|bajo)\b/i,
    /\b(cuando|donde|mientras|apenas|casi|quizá|quizás|acaso|ojalá|tal vez|a lo mejor)\b/i,
    /\b(además|asimismo|igualmente|asimismo|incluso|hasta|tampoco|también|menos|más)\b/i,
    /\b(ser|estar|tener|haber|hacer|poder|decir|poner|creer|pensar|sentir|vivir|hablar|trabajar|comer|beber|dormir|leer|escribir|viajar|estudiar|aprender|entender|seguir|salir|volver|entrar|dejar|llamar|encontrar)\b/i,
  ]

  const distinctiveEnglish = [
    /\b(hello|hi|hey|thanks|thank you|please|welcome|goodbye|bye)\b/i,
    /\b(the|a|an|this|that|these|those)\b/i,
    /\b(i|you|he|she|it|we|they|me|him|her|us|them)\b/i,
    /\b(i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'll|you'll|he'll|she'll|we'll|they'll)\b/i,
    /\b(is|are|was|were|be|been|being|have|has|had|do|does|did|doing)\b/i,
    /\b(will|would|shall|should|can|could|may|might|must|need|dare|ought|used)\b/i,
    /\b(don't|doesn't|didn't|won't|wouldn't|can't|couldn't|shouldn't|haven't|hasn't|hadn't|isn't|aren't|wasn't|weren't)\b/i,
    /\b(and|or|but|so|because|if|when|while|although|since|unless|until|after|before)\b/i,
    /\b(my|your|his|her|its|our|their|mine|yours|hers|ours|theirs)\b/i,
    /\b(need|want|like|think|believe|know|understand|feel|hope|wish|try|help|make|take|get|give|find)\b/i,
    /\b(more|less|very|really|quite|too|enough|almost|just|only|also|even|still|already|always|never|sometimes|often)\b/i,
    /\b(yes|no|maybe|perhaps|probably|definitely|absolutely|sure|okay|alright|fine|good|great|excellent|amazing)\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|last|next|previous|final)\b/i,
    /\b(about|above|across|after|against|along|among|around|at|before|behind|below|beneath|beside|between|beyond|by|down|during|except|for|from|in|inside|into|near|of|off|on|out|outside|over|through|to|toward|under|up|upon|with|within|without)\b/i,
    /\b(because|therefore|however|moreover|furthermore|nevertheless|nonetheless|consequently|accordingly)\b/i,
    /\b(would|could|should|might|must|shall|will|can|may)\b/i,
    /\b(tell|ask|work|live|stay|move|change|keep|start|stop|continue|begin|end|finish|try|wait|follow|remember|forget|call|come|go|leave|arrive|return|enter|exit|pass|turn|run|walk|sit|stand|lie|lay|put|set|let|allow|permit|require|order|ask|answer|reply|respond|speak|talk|say|tell|ask|explain|describe|mention|note|observe|notice|see|watch|look|hear|listen|smell|feel|touch)\b/i,
  ]

  let spanishScore = 0
  let englishScore = 0

  for (const pattern of distinctiveSpanish) {
    const matches = text.match(pattern)
    if (matches) {
      spanishScore += matches.length * 2
    }
  }

  for (const pattern of distinctiveEnglish) {
    const matches = text.match(pattern)
    if (matches) {
      englishScore += matches.length * 2
    }
  }

  if (spanishScore === 0 && englishScore === 0) {
    return 'es'
  }

  return spanishScore >= englishScore ? 'es' : 'en'
}

export function getBrowserLanguage() {
  if (typeof navigator === 'undefined') return 'es'
  const lang = navigator.language || navigator.userLanguage || 'es'
  if (lang.startsWith('es')) return 'es'
  if (lang.startsWith('en')) return 'en'
  return 'es'
}
