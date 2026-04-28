import { t, fmtMoney } from '../translate.js'

export function getBudgetAdvice(analysis, _formData, lang) {
  const { balance, income, expenses, isDeficit, savingsRate } = analysis
  const parts = []

  if (isDeficit) {
    parts.push(t(
      `⚠️ **Déficit mensual de ${fmtMoney(Math.abs(balance), lang)}.** Tus gastos (${fmtMoney(expenses, lang)}) superan tus ingresos (${fmtMoney(income, lang)}).`,
      `⚠️ **Monthly deficit of ${fmtMoney(Math.abs(balance), lang)}.** Your expenses (${fmtMoney(expenses, lang)}) exceed your income (${fmtMoney(income, lang)}).`,
      lang
    ))
    parts.push(t(
      '**Acción urgente:** Revisa cada gasto y pregúntate: ¿es necesario? ¿puedo reducirlo? ¿hay una alternativa más barata?',
      '**Urgent action:** Review every expense and ask: is it necessary? Can I reduce it? Is there a cheaper alternative?',
      lang
    ))
  } else {
    parts.push(t(
      `✅ **Tienes un sobrante de ${fmtMoney(balance, lang)}/mes.** ¡Es excelente!`,
      `✅ **You have a surplus of ${fmtMoney(balance, lang)}/month.** That's excellent!`,
      lang
    ))
    if (balance > 0) {
      parts.push(t(
        `**Recomendación:** Destina al menos el 50% de este sobrante (${fmtMoney(balance * 0.5, lang)}) a ahorro o pago de deudas.`,
        `**Recommendation:** Allocate at least 50% of this surplus (${fmtMoney(balance * 0.5, lang)}) to savings or debt payments.`,
        lang
      ))
    }
  }

  if (savingsRate < 10 && balance > 0) {
    parts.push(t(
      `💡 **Tu tasa de ahorro es del ${savingsRate.toFixed(0)}%** (meta recomendada: 10-20%). Intenta ahorrar aunque sea una cantidad pequeña pero constante.`,
      `💡 **Your savings rate is ${savingsRate.toFixed(0)}%** (recommended target: 10-20%). Try to save even a small but consistent amount.`,
      lang
    ))
  }

  parts.push(t(
    `\n📊 **Método de Presupuesto Cero:**\n1. Anota TODOS tus ingresos del mes\n2. Asigna cada lempira a una categoría hasta llegar a cero\n3. Prioriza: Vivienda → Alimentación → Servicios → Transporte → Deudas → Ahorro\n4. Revisa semanalmente y ajusta\n\n¿Cuál es tu mayor desafío con el presupuesto actualmente?`,
    `\n📊 **Zero-Based Budget Method:**\n1. Write down ALL monthly income\n2. Assign every lempira to a category until you reach zero\n3. Prioritize: Housing → Food → Utilities → Transport → Debts → Savings\n4. Review weekly and adjust\n\nWhat is your biggest budgeting challenge right now?`,
    lang
  ))

  return parts.join('\n')
}

export function getDebtAdvice(analysis, _formData, lang) {
  const { totalDebt, debtToIncome, debts } = analysis

  if (!debts || debts.length === 0) {
    return t(
      '✅ **¡No tienes deudas registradas!** Sigue así. Si tienes alguna deuda que no hayas registrado, puedes agregarla en el formulario.',
      '✅ **You have no debts registered!** Keep it up. If you have any debt you haven\'t recorded, you can add it in the form.',
      lang
    )
  }

  const sorted = [...debts].sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance))
  const totalDebtFormatted = fmtMoney(totalDebt, lang)
  const smallest = sorted[0]
  const smallestFormatted = fmtMoney(smallest.balance, lang)
  const parts = []

  parts.push(t(
    `💳 **Resumen de deudas:** Tienes ${debts.length} deuda(s) por un total de **${totalDebtFormatted}**.`,
    `💳 **Debt summary:** You have ${debts.length} debt(s) totaling **${totalDebtFormatted}**.`,
    lang
  ))

  if (debtToIncome > 30) {
    parts.push(t(
      `⚠️ **Relación deuda-ingreso: ${debtToIncome.toFixed(0)}%** — esto es alto (ideal: <15%).`,
      `⚠️ **Debt-to-income ratio: ${debtToIncome.toFixed(0)}%** — this is high (ideal: <15%).`,
      lang
    ))
  }

  parts.push(t(
    `\n🎯 **Estrategia recomendada: Método Bola de Nieve**\nEmpieza con la deuda más pequeña: **${smallest.creditor || 'Deuda #1'} (${smallestFormatted})**\n\n1. Paga el mínimo en TODAS las deudas\n2. Dedica dinero extra a **${smallest.creditor || 'la más pequeña'}**\n3. Al eliminarla, suma ese pago a la siguiente deuda\n4. Repite hasta estar libre de deudas\n\n**Mientras tanto:** Deja de usar crédito nuevo.\n\n¿Cuánto dinero extra podrías destinar al pago de deudas cada mes?`,
    `\n🎯 **Recommended strategy: Snowball Method**\nStart with the smallest debt: **${smallest.creditor || 'Debt #1'} (${smallestFormatted})**\n\n1. Pay the minimum on ALL debts\n2. Put extra money toward **${smallest.creditor || 'the smallest'}**\n3. When eliminated, add that payment to the next debt\n4. Repeat until debt-free\n\n**Meanwhile:** Stop using new credit.\n\nHow much extra money could you put toward debt payments each month?`,
    lang
  ))

  return parts.join('\n')
}

export function getSavingsAdvice(analysis, _formData, lang) {
  const { emergencyFund, emergencyFundMonths, expenses } = analysis
  const parts = []

  if (emergencyFundMonths < 3) {
    const target = expenses * 3
    const need = Math.max(0, target - emergencyFund)
    parts.push(t(
      `🛡️ **Fondo de emergencia: ${emergencyFundMonths.toFixed(1)} meses** (meta: 3-6 meses). ${emergencyFund > 0 ? `Te faltan ~${fmtMoney(need, lang)}.` : 'Aún no has comenzado.'}`,
      `🛡️ **Emergency fund: ${emergencyFundMonths.toFixed(1)} months** (target: 3-6 months). ${emergencyFund > 0 ? `You need ~${fmtMoney(need, lang)} more.` : "You haven't started yet."}`,
      lang
    ))

    parts.push(t(
      `\n**Cómo empezar con ingresos bajos:**\n1. Abre una cuenta de ahorro SEPARADA (no la toques)\n2. Meta inicial: ${fmtMoney(Math.min(5000, need), lang)} — lo que puedas\n3. Automatiza: transfiere el día que cobras\n4. Usa tandas/cundinas con personas de confianza\n5. Vende artículos que no uses para el fondo inicial\n\n**¿Por qué es urgente?** Sin fondo de emergencia, cualquier imprevisto te lleva a deuda.\n\n¿Tienes algún ahorro actualmente, aunque sea pequeño?`,
      `\n**How to start on low income:**\n1. Open a SEPARATE savings account (don't touch it)\n2. Initial goal: ${fmtMoney(Math.min(5000, need), lang)} — whatever you can\n3. Automate: transfer on payday\n4. Use rotating savings groups with trusted people\n5. Sell unused items for the initial fund\n\n**Why is it urgent?** Without an emergency fund, any unexpected event leads to debt.\n\nDo you currently have any savings, even a small amount?`,
      lang
    ))
  } else {
    parts.push(t(
      `✅ **¡Excelente! Tu fondo de emergencia cubre ${emergencyFundMonths.toFixed(1)} meses.** Sigue así.`,
      `✅ **Excellent! Your emergency fund covers ${emergencyFundMonths.toFixed(1)} months.** Keep it up.`,
      lang
    ))
  }

  return parts.join('\n')
}

export function getIncomeAdvice(analysis, formData, lang) {
  const d = formData || {}
  const skills = d.skills || []
  const employment = d.employmentStatus || ''

  const skillBased = {
    'Carpintería / Carpentry': t('Muebles a medida, reparaciones, instalaciones', 'Custom furniture, repairs, installations', lang),
    'Costura / Sewing': t('Arreglos de ropa, confección de mascarillas, cortinas', 'Clothing alterations, mask making, curtains', lang),
    'Cocina / Cooking': t('Venta de comidas, repostería, catering para eventos', 'Food sales, baking, event catering', lang),
    'Mecánica / Mechanics': t('Reparación de vehículos, mantenimiento básico', 'Vehicle repair, basic maintenance', lang),
    'Electricidad / Electrical': t('Instalaciones, reparaciones eléctricas menores', 'Installations, minor electrical repairs', lang),
    'Computación / Computing': t('Soporte técnico, clases de computación', 'Tech support, computer classes', lang),
    'Enseñanza / Teaching': t('Clases particulares, tutorías', 'Private classes, tutoring', lang),
    'Ventas / Sales': t('Venta por catálogo, marketplace en línea', 'Catalog sales, online marketplace', lang),
    'Agricultura / Agriculture': t('Huerto familiar, venta de excedentes', 'Family garden, surplus sale', lang),
    'Idiomas / Languages': t('Clases de idiomas, traducciones', 'Language classes, translations', lang),
  }

  const parts = []
  parts.push(t('💵 **Aumentar tus Ingresos en Honduras:**', '💵 **Increasing Your Income in Honduras:**', lang))

  const matchedSkills = skills.filter(s => skillBased[s])
  if (matchedSkills.length > 0) {
    parts.push('')
    parts.push(t('**Según tus habilidades, podrías:**', '**Based on your skills, you could:**', lang))
    for (const skill of matchedSkills.slice(0, 4)) {
      parts.push(`- **${skill}** → ${skillBased[skill]}`)
    }
  }

  if (employment === 'unemployed' || employment === 'looking') {
    parts.push(t(
      `\n**Recursos gratuitos de capacitación:**\n- **INFOP** — cursos gratuitos de capacitación técnica\n- **COHEP** — programas de emprendimiento\n- **Bono Vida Mejor** — apoyo condicionado del gobierno\n\n**Ideas de ingreso adicional (bajo costo inicial):**\n- 🍳 Venta de comida (baleadas, tamales, pasteles)\n- 🧹 Servicios de limpieza doméstica\n- 📱 Recargas telefónicas y servicios de pago\n- 🌱 Huerto familiar (ahorra y vende excedente)\n\n¿Cuáles de tus habilidades actuales podrías monetizar esta semana?`,
      `\n**Free training resources:**\n- **INFOP** — free technical training courses\n- **COHEP** — entrepreneurship programs\n- **Bono Vida Mejor** — conditional government support\n\n**Additional income ideas (low startup cost):**\n- 🍳 Food sales (traditional dishes, baked goods)\n- 🧹 Domestic cleaning services\n- 📱 Phone recharges and payment services\n- 🌱 Family garden (saves on food, sell surplus)\n\nWhich of your current skills could you monetize this week?`,
      lang
    ))
  } else {
    parts.push(t('\n¿Qué habilidad te gustaría desarrollar para generar ingresos adicionales?', '\nWhat skill would you like to develop to generate additional income?', lang))
  }

  return parts.join('\n')
}
