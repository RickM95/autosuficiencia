import { t } from '../translate.js'

export function getGoalsAdvice(analysis, _formData, lang) {
  const { score, short, medium, long, totalGoals } = analysis
  const parts = []

  if (totalGoals === 0) {
    return t(
      `🎯 **Establecer Metas Financieras Efectivas:**\n\nLas metas vagas no funcionan. Usa el método **SMART**:\n\n- **S**pecífica: "Ahorrar L5,000" (no "ahorrar más")\n- **M**edible: Puedes rastrear el progreso\n- **A**lcanzable: Realista con tus ingresos actuales\n- **R**elevante: Conectada con tus valores\n- **T**iempo: Fecha límite clara\n\n**Ejemplo:** "Voy a ahorrar L500 cada quincena durante 5 meses para tener L5,000 para el 30 de septiembre."\n\n**Truco:** Escribe tus metas y ponlas donde las veas cada día.\n\n¿Cuál es la meta financiera más importante para ti en los próximos 3 meses?`,
      `🎯 **Setting Effective Financial Goals:**\n\nVague goals don't work. Use the **SMART** method:\n\n- **S**pecific: "Save L5,000" (not "save more")\n- **M**easurable: You can track progress\n- **A**chievable: Realistic with your current income\n- **R**elevant: Connected to your values\n- **T**ime-bound: Clear deadline\n\n**Example:** "I will save L500 every two weeks for 5 months to have L5,000 by September 30."\n\n**Trick:** Write your goals and put them where you see them every day.\n\nWhat is the most important financial goal for you in the next 3 months?`,
      lang
    )
  }

  parts.push(t(`🎯 **Tus Metas — Puntaje SMART: ${score}/100**`, `🎯 **Your Goals — SMART Score: ${score}/100**`, lang))
  parts.push('')
  if (short.length > 0) parts.push(t(`✅ **Corto plazo (0-3 meses):** ${short.length} meta(s) — ${short.map(g => `"${g.goal}"`).join(', ')}`, `✅ **Short-term (0-3 months):** ${short.length} goal(s) — ${short.map(g => `"${g.goal}"`).join(', ')}`, lang))
  if (medium.length > 0) parts.push(t(`📋 **Mediano plazo (3-12 meses):** ${medium.length} meta(s) — ${medium.map(g => `"${g.goal}"`).join(', ')}`, `📋 **Medium-term (3-12 months):** ${medium.length} goal(s) — ${medium.map(g => `"${g.goal}"`).join(', ')}`, lang))
  if (long.length > 0) parts.push(t(`🌟 **Largo plazo (1-5 años):** ${long.length} meta(s) — ${long.map(g => `"${g.goal}"`).join(', ')}`, `🌟 **Long-term (1-5 years):** ${long.length} goal(s) — ${long.map(g => `"${g.goal}"`).join(', ')}`, lang))

  const allGoals = [...short, ...medium, ...long]
  const noSteps = allGoals.filter(g => !g.steps || !g.steps.trim())
  const noDeadlines = allGoals.filter(g => !g.deadline)
  const needsImprovement = []
  if (noSteps.length > 0) needsImprovement.push(t(`${noSteps.length} meta(s) sin pasos específicos`, `${noSteps.length} goal(s) without specific steps`, lang))
  if (noDeadlines.length > 0) needsImprovement.push(t(`${noDeadlines.length} meta(s) sin fecha límite`, `${noDeadlines.length} goal(s) without deadlines`, lang))

  if (needsImprovement.length > 0) {
    parts.push('')
    parts.push(t('**Áreas de mejora:**', '**Areas for improvement:**', lang))
    for (const issue of needsImprovement) parts.push(`- ⚠️ ${issue}`)
    parts.push('')
    parts.push(t('**Consejo:** Una meta sin plan es solo un deseo. Agrega pasos específicos y fechas límite a cada meta.', '**Tip:** A goal without a plan is just a wish. Add specific steps and deadlines to each goal.', lang))
  }

  parts.push('')
  parts.push(t('¿Quieres que te ayude a detallar alguna de estas metas o crear nuevas?', 'Would you like me to help detail any of these goals or create new ones?', lang))

  return parts.join('\n')
}

export function formatGoalSuggestion(formData, lang) {
  const d = formData || {}
  const suggestions = []

  if (!d.shortTermGoals || d.shortTermGoals.every(g => !g.goal)) {
    const amount = ((parseFloat(d.expHousing) || 0) + (parseFloat(d.expFood) || 0)) * 3 || 5000
    suggestions.push(t(
      `Crear un fondo de emergencia de L ${amount.toFixed(0)} para 3 meses de gastos básicos`,
      `Create an emergency fund of ${amount.toFixed(0)} for 3 months of basic expenses`,
      lang
    ))
  }

  const debts = (d.debts || []).filter(debt => parseFloat(debt.balance) > 0)
  if (debts.length > 0) {
    const smallest = debts.sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance))[0]
    suggestions.push(t(
      `Pagar la deuda de ${smallest.creditor || 'menor monto'} (L ${parseFloat(smallest.balance).toFixed(0)}) usando el método bola de nieve`,
      `Pay off the ${smallest.creditor || 'smallest'} debt (${parseFloat(smallest.balance).toFixed(0)}) using the snowball method`,
      lang
    ))
  }

  const income = ['incSalary', 'incSpouse', 'incBusiness', 'incRent', 'incRemittance', 'incGovAid', 'incFamily', 'incOther']
    .reduce((s, f) => s + (parseFloat(d[f]) || 0), 0)
  if (income < 10000) {
    suggestions.push(t(
      'Identificar una fuente de ingreso adicional (venta de comida, servicios, tutorías) para aumentar ingresos en L 2,000/mes',
      'Identify an additional income source (food sales, services, tutoring) to increase income by 2,000/month',
      lang
    ))
  }

  if (suggestions.length === 0) {
    suggestions.push(t(
      'Aumentar mi tasa de ahorro al 15% de mis ingresos mensuales',
      'Increase my savings rate to 15% of monthly income',
      lang
    ))
  }

  return suggestions
}
