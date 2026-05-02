export const budgetModel = {
  HN: {
    survival: {
      tithes: [10, 10], savings: [0, 5], housing: [25, 35], utilities: [5, 10], food: [25, 35],
      transport: [5, 10], clothing: [2, 5], health: [2, 5], insurance: [0, 2], personal: [2, 5],
      recreation: [0, 5], debt: [0, 10], education: [0, 5], other: [0, 5]
    },
    'lower-middle': {
      tithes: [10, 10], savings: [5, 10], housing: [25, 30], utilities: [5, 8], food: [20, 30],
      transport: [5, 10], clothing: [5, 8], health: [5, 8], insurance: [2, 5], personal: [5, 8],
      recreation: [5, 8], debt: [5, 10], education: [5, 10], other: [5, 5]
    },
    middle: {
      tithes: [10, 10], savings: [10, 15], housing: [20, 25], utilities: [5, 7], food: [15, 25],
      transport: [5, 8], clothing: [5, 10], health: [5, 10], insurance: [5, 8], personal: [5, 10],
      recreation: [5, 10], debt: [5, 10], education: [10, 15], other: [5, 5]
    },
    upper: {
      tithes: [10, 10], savings: [15, 25], housing: [15, 25], utilities: [3, 5], food: [10, 20],
      transport: [5, 8], clothing: [5, 10], health: [5, 10], insurance: [8, 12], personal: [5, 15],
      recreation: [10, 15], debt: [0, 10], education: [10, 20], other: [5, 10]
    }
  },
  US: {
    survival: {
      tithes: [10, 10], savings: [0, 5], housing: [30, 40], utilities: [8, 12], food: [15, 25],
      transport: [10, 15], clothing: [2, 5], health: [5, 10], insurance: [0, 5], personal: [2, 5],
      recreation: [0, 5], debt: [0, 10], education: [0, 5], other: [0, 5]
    },
    'lower-middle': {
      tithes: [10, 10], savings: [5, 10], housing: [25, 35], utilities: [5, 10], food: [15, 20],
      transport: [10, 12], clothing: [5, 8], health: [5, 10], insurance: [5, 8], personal: [5, 8],
      recreation: [5, 8], debt: [5, 10], education: [5, 10], other: [5, 5]
    },
    middle: {
      tithes: [10, 10], savings: [10, 15], housing: [25, 30], utilities: [5, 8], food: [10, 15],
      transport: [8, 12], clothing: [5, 10], health: [5, 10], insurance: [8, 10], personal: [5, 10],
      recreation: [5, 10], debt: [5, 10], education: [10, 15], other: [5, 5]
    },
    upper: {
      tithes: [10, 10], savings: [20, 30], housing: [20, 25], utilities: [3, 5], food: [8, 12],
      transport: [5, 10], clothing: [5, 10], health: [5, 10], insurance: [10, 15], personal: [5, 15],
      recreation: [10, 20], debt: [0, 5], education: [10, 20], other: [5, 10]
    }
  }
}

export function getIncomeTier(location, monthlyIncome) {
  if (location === 'HN') {
    if (monthlyIncome <= 10000) return 'survival'
    if (monthlyIncome <= 18000) return 'lower-middle'
    if (monthlyIncome <= 35000) return 'middle'
    return 'upper'
  } else {
    if (monthlyIncome <= 2000) return 'survival'
    if (monthlyIncome <= 4000) return 'lower-middle'
    if (monthlyIncome <= 8000) return 'middle'
    return 'upper'
  }
}

const PER_PERSON_FOOD_COST = {
  HN: { survival: 1500, 'lower-middle': 2150, middle: 3000, upper: 4000 },
  US: { survival: 200, 'lower-middle': 325, middle: 500, upper: 700 }
}

export function getAdjustedModel(location, tier, householdSize, monthlyIncome = 0) {
  const base = JSON.parse(JSON.stringify(budgetModel[location][tier]))
  const size = parseInt(householdSize) || 1

  if (monthlyIncome > 0) {
    const costPerPerson = PER_PERSON_FOOD_COST[location][tier]
    const foodTotal = costPerPerson * size
    
    // Base ideal percentage
    const baseIdealPct = (base.food[0] + base.food[1]) / 2
    const percentageFood = monthlyIncome * (baseIdealPct / 100)
    
    if (foodTotal > percentageFood) {
      const extraMoneyNeeded = foodTotal - percentageFood
      const extraPctNeeded = (extraMoneyNeeded / monthlyIncome) * 100
      
      base.food[0] = Math.round(base.food[0] + extraPctNeeded)
      base.food[1] = Math.round(base.food[1] + extraPctNeeded)

      const categoriesToReduce = ['recreation', 'personal']
      if (tier === 'survival' || tier === 'lower-middle') categoriesToReduce.push('savings')

      const reductionPerCat = extraPctNeeded / categoriesToReduce.length

      categoriesToReduce.forEach(cat => {
        base[cat][0] = Math.round(Math.max(0, base[cat][0] - reductionPerCat))
        base[cat][1] = Math.round(Math.max(0, base[cat][1] - reductionPerCat))
      })
    }
  } else {
    // Fallback if no income
    if (size > 2) {
      const foodAdd = location === 'HN' ? (size <= 4 ? 5 : 10) : (size <= 4 ? 4 : 7)
      base.food[0] += foodAdd
      base.food[1] += foodAdd

      const reduction = foodAdd / 3
      base.recreation[0] = Math.round(Math.max(0, base.recreation[0] - reduction))
      base.recreation[1] = Math.round(Math.max(0, base.recreation[1] - reduction))
      base.personal[0] = Math.round(Math.max(0, base.personal[0] - reduction))
      base.personal[1] = Math.round(Math.max(0, base.personal[1] - reduction))
      
      if (tier === 'survival' || tier === 'lower-middle') {
        base.savings[0] = Math.round(Math.max(0, base.savings[0] - reduction))
        base.savings[1] = Math.round(Math.max(0, base.savings[1] - reduction))
      }
    }
  }
  
  return base
}

// Full humanized feedback for every category
const feedbackMessages = {
  ES: {
    housing: {
      within: 'Tu vivienda está bien equilibrada para tu ingreso.',
      high: 'La vivienda está ligeramente alta. Revisa opciones para reducir este costo.',
      critical: 'Alerta: Tu vivienda consume demasiado. Esto limita tu capacidad de ahorro y emergencias.',
      low: 'Tu gasto en vivienda es bajo, lo cual te da margen en otras áreas.'
    },
    food: {
      within: 'Tu alimentación está alineada con tu hogar.',
      high: 'La comida es elevada. Evalúa compras al por mayor o mercados locales.',
      critical: 'El presupuesto de comida está consumiendo demasiado. Busca alternativas de ahorro.',
      low: 'El gasto en comida es bajo. Asegúrate de que tu hogar esté bien alimentado.'
    },
    savings: {
      within: '¡Bien! Estás construyendo tu colchón financiero.',
      high: '¡Excelente ritmo de ahorro! Estás acelerando tu libertad.',
      critical: 'Tu ahorro es muy alto — asegúrate de cubrir primero tus necesidades básicas.',
      low: 'Estás por debajo del ahorro recomendado. Es común; enfócate en la estabilidad primero.'
    },
    utilities: {
      within: 'Tus servicios están dentro del rango normal.',
      high: 'Servicios ligeramente altos. Revisa consumo de luz, agua o internet.',
      critical: 'Los servicios están consumiendo mucho. Evalúa planes más económicos.',
      low: 'Buen control de servicios básicos.'
    },
    transport: {
      within: 'Tu transporte está dentro de lo esperado.',
      high: 'Transporte ligeramente alto. Evalúa rutas o alternativas más eficientes.',
      critical: 'El transporte está presionando tu presupuesto. Considera carpooling u opciones públicas.',
      low: 'Gasto de transporte bajo. Buen control.'
    },
    clothing: {
      within: 'Tu gasto en ropa es razonable.',
      high: 'Ligeramente alto en ropa. Prioriza compras necesarias sobre deseos.',
      critical: 'El gasto en ropa es excesivo para tu nivel. Reduce esta categoría.',
      low: 'Gasto bajo en ropa. Asegúrate de cubrir lo necesario.'
    },
    health: {
      within: 'Tu presupuesto de salud está bien balanceado.',
      high: 'Salud ligeramente alta. Verifica si hay alternativas más accesibles.',
      critical: 'El gasto en salud es muy alto. Busca programas de apoyo o seguros básicos.',
      low: 'Gasto bajo en salud. No descuides la prevención.'
    },
    insurance: {
      within: 'Tus seguros están dentro del rango.',
      high: 'Seguros ligeramente altos. Compara opciones y coberturas.',
      critical: 'Los seguros están presionando mucho. Evalúa qué coberturas son esenciales.',
      low: 'Seguros bajos. Considera protección básica si es posible.'
    },
    personal: {
      within: 'Tu gasto personal es manejable.',
      high: 'Gasto personal ligeramente alto. Identifica áreas de ajuste.',
      critical: 'El gasto personal está afectando tu balance. Revisa prioridades.',
      low: 'Gasto personal bajo. Está bien mientras cubras tus necesidades.'
    },
    recreation: {
      within: 'Tu recreación está balanceada.',
      high: 'Recreación ligeramente alta. Busca actividades más accesibles.',
      critical: 'La recreación está consumiendo demasiado. Prioriza estabilidad.',
      low: 'Recreación baja. No olvides que el descanso también es importante.'
    },
    debt: {
      within: 'Tus pagos de deuda son manejables.',
      high: 'Deuda ligeramente alta. Enfócate en la de mayor interés primero.',
      critical: 'La deuda está presionando mucho. Busca asesoría o reestructuración.',
      low: 'Buen control de deuda. Mantén este ritmo.'
    },
    education: {
      within: 'Tu inversión en educación es apropiada.',
      high: 'Educación ligeramente alta. Es una buena inversión, pero vigila el balance.',
      critical: 'El gasto educativo es muy alto para tu ingreso actual.',
      low: 'Inversión baja en educación. Considera opciones gratuitas o becas.'
    },
    tithes: {
      within: 'Tus donaciones están dentro del estándar.',
      high: 'Las donaciones son generosas. Asegúrate de cubrir tus necesidades primero.',
      critical: 'Las donaciones son muy altas para tu ingreso. Prioriza tu estabilidad.',
      low: 'Donaciones por debajo del objetivo.'
    },
    other: {
      within: 'Otros gastos son manejables.',
      high: 'Otros gastos un poco altos. Revisa qué incluye esta categoría.',
      critical: '"Otros" gastos muy altos — identifica a dónde va este dinero.',
      low: 'Buen control de gastos varios.'
    }
  },
  EN: {
    housing: {
      within: 'Your housing is well balanced for your income.',
      high: 'Housing is slightly high. Review options to reduce this cost.',
      critical: 'Alert: Housing is consuming too much. This limits savings and emergency capacity.',
      low: 'Housing spending is low, giving you margin in other areas.'
    },
    food: {
      within: 'Your food spending is aligned with your household.',
      high: 'Food is elevated. Evaluate bulk buying or local markets.',
      critical: 'Food budget is consuming too much. Look for support or saving alternatives.',
      low: 'Food spending is low. Make sure your household is properly nourished.'
    },
    savings: {
      within: 'Great! You are building your financial cushion.',
      high: 'Amazing saving pace! You are accelerating your freedom.',
      critical: 'Savings are very high — make sure basic needs are covered first.',
      low: 'Below recommended savings. This is common; focus on stability first.'
    },
    utilities: {
      within: 'Your utilities are within normal range.',
      high: 'Utilities slightly high. Review electricity, water, or internet usage.',
      critical: 'Utilities are consuming too much. Evaluate more economical plans.',
      low: 'Good control of basic services.'
    },
    transport: {
      within: 'Your transportation is within expected range.',
      high: 'Transport slightly high. Evaluate routes or more efficient alternatives.',
      critical: 'Transportation is pressuring your budget. Consider carpooling or public options.',
      low: 'Low transportation spending. Good control.'
    },
    clothing: {
      within: 'Your clothing spending is reasonable.',
      high: 'Slightly high on clothing. Prioritize needs over wants.',
      critical: 'Clothing spending is excessive for your level. Reduce this category.',
      low: 'Low clothing spending. Make sure essentials are covered.'
    },
    health: {
      within: 'Your health budget is well balanced.',
      high: 'Health slightly high. Check for more accessible alternatives.',
      critical: 'Health spending is very high. Look for support programs or basic insurance.',
      low: 'Low health spending. Don\'t neglect prevention.'
    },
    insurance: {
      within: 'Your insurance is within range.',
      high: 'Insurance slightly high. Compare options and coverage.',
      critical: 'Insurance is pressuring too much. Evaluate which coverage is essential.',
      low: 'Low insurance. Consider basic protection if possible.'
    },
    personal: {
      within: 'Your personal spending is manageable.',
      high: 'Personal spending slightly high. Identify areas to adjust.',
      critical: 'Personal spending is affecting your balance. Review priorities.',
      low: 'Low personal spending. That\'s fine as long as needs are met.'
    },
    recreation: {
      within: 'Your recreation is balanced.',
      high: 'Recreation slightly high. Look for more accessible activities.',
      critical: 'Recreation is consuming too much. Prioritize stability.',
      low: 'Low recreation. Remember that rest is also important.'
    },
    debt: {
      within: 'Your debt payments are manageable.',
      high: 'Debt slightly high. Focus on the highest-interest debt first.',
      critical: 'Debt is pressuring too much. Seek advice or restructuring.',
      low: 'Good debt control. Keep this pace.'
    },
    education: {
      within: 'Your education investment is appropriate.',
      high: 'Education slightly high. It\'s a good investment, but watch the balance.',
      critical: 'Education spending is very high for your current income.',
      low: 'Low education investment. Consider free options or scholarships.'
    },
    tithes: {
      within: 'Your giving is within the standard.',
      high: 'Your giving is generous. Make sure to cover your needs first.',
      critical: 'Giving is very high for your income. Prioritize your stability.',
      low: 'Giving is below the target.'
    },
    other: {
      within: 'Other expenses are manageable.',
      high: 'Other expenses a bit high. Review what this category includes.',
      critical: '"Other" expenses are very high — identify where this money goes.',
      low: 'Good control of miscellaneous spending.'
    }
  }
}

export function getHumanizedFeedback(catId, actualPct, targetPct, range, lang, householdSize, tier, actualAmount = 0, monthlyIncome = 0, location = 'HN') {
  let status = 'within'
  const upperLimit = range[1]

  if (actualPct > upperLimit + 5) status = 'critical'
  else if (actualPct > upperLimit) status = 'high'
  else if (actualPct < range[0] - 2 && catId !== 'tithes') status = 'low'
  else status = 'within'

  const langKey = lang === 'ES' ? 'ES' : 'EN'
  let explanation = feedbackMessages[langKey]?.[catId]?.[status] || (lang === 'ES' ? 'Tu gasto es manejable.' : 'Your spending is manageable.')

  if (catId === 'food' && monthlyIncome > 0) {
    const costPerPerson = PER_PERSON_FOOD_COST[location][tier]
    const foodTotal = costPerPerson * householdSize
    
    if (actualAmount > 0 && actualAmount < foodTotal * 0.9) {
      explanation = lang === 'ES' 
        ? 'Tu gasto en alimentación parece estar por debajo de las necesidades estimadas. Asegúrate de que esto sea sostenible y no afecte tu nutrición.'
        : 'Your food spending appears below estimated needs. Ensure this is sustainable and not affecting nutrition.'
    } else if (actualAmount > foodTotal * 1.2) {
      explanation = lang === 'ES'
        ? 'Tu gasto en alimentación está por encima de las necesidades estimadas. Considera estrategias de eficiencia si es necesario.'
        : 'Your food spending is above estimated needs. Consider efficiency strategies if needed.'
    }
  }

  return { status, explanation, costPerPerson: PER_PERSON_FOOD_COST[location][tier] }
}
