const EXTRACTION_RULES = [
  {
    field: 'name',
    patterns: [
      /(?:my name is|me llamo)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/i,
    ],
    parse: (m) => m[1].trim(),
  },
  {
    field: 'age',
    patterns: [
      /\b(?:tengo|i'?m|aged?|edad|age)\s+(\d{1,3})\s*(?:años|years?|yo)\b/i,
      /\b(\d{1,3})\s*(?:años|years?\s+old)\b/i,
    ],
    parse: (m) => parseInt(m[1]),
  },
  {
    field: 'location',
    patterns: [
      /(?:vivo en|i live in|soy de|i'm from|located in|resido en)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
    ],
    parse: (m) => m[1].trim(),
  },
  {
    field: 'dependents',
    patterns: [
      /\b(\d+)\s*(?:hij[oa]s?|children|kids|dependientes?|dependents?|hijo)\b/i,
      /\b(?:tengo|have|with)\s+(\d+)\s*(?:dependientes?|dependents?|hij[oa]s?|children|kids)\b/i,
    ],
    parse: (m) => parseInt(m[1]),
  },
  {
    field: 'maritalStatus',
    patterns: [
      /\b(?:estoy\s+)?casado\b/i,
      /\b(?:i'?m\s+)?married\b/i,
      /\b(?:estoy\s+)?soltero\b/i,
      /\b(?:i'?m\s+)?single\b/i,
      /\b(?:estoy\s+)?divorciado\b/i,
      /\b(?:i'?m\s+)?divorced\b/i,
      /\b(?:estoy\s+)?viudo\b/i,
      /\b(?:i'?m\s+)?widowed\b/i,
      /\buni[oó]n libre\b/i,
      /\bcommon['-]?law\b/i,
    ],
    parse: (m) => {
      const t = m[0].toLowerCase()
      if (/casado|married/.test(t)) return 'married'
      if (/soltero|single/.test(t)) return 'single'
      if (/divorciado|divorced/.test(t)) return 'divorced'
      if (/viudo|widowed/.test(t)) return 'widowed'
      if (/unión|unión libre|common/.test(t)) return 'union'
      return 'married'
    },
  },
  {
    field: 'employmentStatus',
    patterns: [
      /\b(?:trabajo|i work|employed|empleado)\s+(?:tiempo completo|full.time|full time)\b/i,
      /\b(?:trabajo|i work|employed|empleado)\s+(?:tiempo parcial|part.time|part.time|part time)\b/i,
      /\b(?:trabajo|i'?m\s+)?(?:independiente|self.employed|freelance|por mi cuenta)\b/i,
      /\b(?:estoy\s+)?(?:desempleado|unemployed|sin trabajo|sin empleo)\b/i,
      /\b(?:buscando|looking for|seeking)\s+(?:empleo|trabajo|job|work)\b/i,
      /\b(?:jubilado|retired|pensionado)\b/i,
      /\b(?:estudiante|student)\b/i,
      /\b(?:ama de casa|homemaker|housewife|house husband)\b/i,
    ],
    parse: (m) => {
      const t = m[0].toLowerCase()
      if (/tiempo completo|full.time|full time/.test(t)) return 'employed_full'
      if (/tiempo parcial|part.time|part time/.test(t)) return 'employed_part'
      if (/independiente|self.employed|freelance|por mi cuenta/.test(t)) return 'self_employed'
      if (/desempleado|unemployed|sin trabajo|sin empleo/.test(t)) return 'unemployed'
      if (/buscando|looking|seeking/.test(t)) return 'looking'
      if (/jubilado|retired|pensionado/.test(t)) return 'retired'
      if (/estudiante|student/.test(t)) return 'student'
      if (/ama de casa|homemaker|housewife/.test(t)) return 'homemaker'
      return 'employed_full'
    },
  },
  {
    field: 'education',
    patterns: [
      /\b(?:educación|education|estudié|studied|nivel educativo)\s*(?::|hasta)?\s*(?:primaria|primary school|primary|elementary)\b/i,
      /\b(?:secundaria|secondary school|secondary|high school|bachillerato)\b/i,
      /\b(?:técnico|technical degree|technical|vocational)\b/i,
      /\b(?:universidad|university|college|university degree|licenciatura)\b/i,
      /\b(?:posgrado|postgraduate|master|maestría|doctorado|phd|doctorate)\b/i,
      /\b(?:sin estudios|no formal education|no education)\b/i,
    ],
    parse: (m) => {
      const t = m[0].toLowerCase()
      if (/primaria|primary|elementary/.test(t)) return 'primary'
      if (/secundaria|secondary|high school|bachillerato/.test(t)) return 'high_school'
      if (/técnico|technical|vocational/.test(t)) return 'technical'
      if (/universidad|university|college|licenciatura/.test(t)) return 'university'
      if (/posgrado|postgraduate|master|maestría|doctorado|phd|doctorate/.test(t)) return 'postgrad'
      if (/sin estudios|no formal|no education/.test(t)) return 'none'
      return 'secondary'
    },
  },
  {
    field: 'foodSecurity',
    patterns: [
      /\b(?:alimentación|food|comida)\s*(?:est[aá]\s*)?(?:crítico|critical|muy mal|very bad|1)\s*(?:\/10|\/5)?\b/i,
      /\b(?:no tengo suficiente (?:comida|para comer|alimento)|hambre|hungry|food insecurity)\b/i,
    ],
    parse: () => 1,
    condition: (txt) => /crítico|critical|muy mal|very bad|hambre|hungry|no tengo comida|food insecurity|no tengo suficiente/i.test(txt),
  },
  {
    field: 'foodSecurity',
    patterns: [
      /\balimentaci[oó]n\s*(?:est[áa])?\s*(?:bien|good|estable|stable)\s*(?:\d)\b/i,
    ],
    parse: () => 4,
    condition: (txt) => /alimentación.*(bien|good|estable|stable)/i.test(txt),
  },
  {
    field: 'housingSecurity',
    patterns: [
      /\b(?:vivienda|housing|dónde vivo|living situation)\s*(?:est[áa]\s*)?(?:crítico|critical|muy mal|very bad|inestable|unstable)\b/i,
      /\b(?:sin casa|sin vivienda|homeless|no tengo donde vivir|no tengo vivienda|sin hogar)\b/i,
    ],
    parse: () => 1,
    condition: (txt) => /sin casa|sin vivienda|homeless|no tengo donde vivir|crítico.*vivienda|vivienda.*crítico|housing.*critical|critical.*housing/i.test(txt),
  },
  {
    field: 'mentalHealth',
    patterns: [
      /\b(?:mental|emocional|emotional)\s*(?:salud|health|est[áa]\s*)?(?:crítico|critical|muy mal|very bad|depresión|depressed|ansiedad|anxiety)\b/i,
    ],
    parse: () => 2,
    condition: (txt) => /depresi[oó]n|depressed|ansiedad|anxiety|mental.*mal|emocional.*mal|estoy (muy )?mal/i.test(txt),
  },
  {
    field: 'housingSituation',
    patterns: [
      /\b(?:vivo en|i live in|vivienda|housing|rento|rent|alquilo|alquiler)\s*(?:casa propia|own home|propia)\b/i,
      /\b(?:rento|rent|alquilo|alquiler|arriendo)\b/i,
      /\b(?:vivo con|live with|con mi|with my)\s*(?:familia|family|padres|parents|familiar)\b/i,
      /\b(?:situación inestable|unstable|sin casa|homeless)\b/i,
    ],
    parse: (m) => {
      const t = m[0].toLowerCase()
      if (/propia|own home|casa propia/.test(t)) return 'own'
      if (/rento|rent|alquilo|alquiler|arriendo/.test(t)) return 'rent'
      if (/familia|family|padres|parents|familiar/.test(t)) return 'family'
      if (/inestable|unstable/.test(t)) return 'unstable'
      if (/sin casa|homeless/.test(t)) return 'homeless'
      return 'rent'
    },
  },
  {
    field: 'incSalary',
    patterns: [
      /\b(?:gano|i earn|i make|i get|salario|salary|ingreso|income)\s*(?:de|of|about|approx|around)?\s*(?:L|HNL|\$|USD)?\s*(\d{3,}(?:[.,]\d+)?)\b/i,
      /\b(?:salario|salary|sueldo)\s*(?:principal|primary|mensual|monthly)\s*(?::|de)?\s*(?:L|HNL|\$|USD)?\s*(\d{3,}(?:[.,]\d+)?)\b/i,
    ],
    parse: (m) => parseFloat(m[1].replace(/,/g, '')),
  },
  {
    field: 'totalExpenses',
    patterns: [
      /\b(?:gasto|spend|expenses?|gastos)\s*(?:de|about|approx|un total de|total de)?\s*(?:L|HNL|\$|USD)?\s*(\d{3,}(?:[.,]\d+)?)\s*(?:al mes|per month|mensuales?|monthly)\b/i,
      /\b(?:mis gastos|my expenses|gastos mensuales|monthly expenses)\s*(?:son|are|totales?|total|suman)?\s*(?:L|HNL|\$|USD)?\s*(\d{3,}(?:[.,]\d+)?)\b/i,
    ],
    parse: (m) => parseFloat(m[1].replace(/,/g, '')),
  },
  {
    field: 'debts',
    patterns: [
      /\b(?:tengo|i have|i owe|debo|deuda|debt|deudas|debts)\s*(?:de|of|about|approx)?\s*(?:L|HNL|\$|USD)?\s*(\d{3,}(?:[.,]\d+)?)\s*(?:de\s*)?(?:deuda|debt)?\b/i,
    ],
    parse: (m, txt) => {
      const amount = parseFloat(m[1].replace(/,/g, ''))
      let type = 'other'
      if (/tarjeta|credit card|card/i.test(txt)) type = 'credit_card'
      else if (/personal|personal loan|préstamo personal/i.test(txt)) type = 'personal_loan'
      else if (/hipoteca|mortgage|casa/i.test(txt)) type = 'mortgage'
      else if (/carro|auto|car|vehículo|vehicle/i.test(txt)) type = 'car_loan'
      else if (/estudiante|student|estudio/i.test(txt)) type = 'student_loan'
      else if (/médica|medical|hospital/i.test(txt)) type = 'medical'
      else if (/familia|family/i.test(txt)) type = 'family'
      return [{ id: Date.now() % 10000, type, creditor: '', balance: String(amount), payment: '', rate: '' }]
    },
    merge: (existing, parsed) => {
      const merged = Array.isArray(existing) ? [...existing] : []
      const newDebt = parsed[0]
      const exists = merged.some(d => Math.abs(parseFloat(d.balance) - parseFloat(newDebt.balance)) < 100)
      if (!exists) {
        newDebt.id = Math.max(0, ...merged.map(d => d.id)) + 1
        merged.push(newDebt)
      }
      return merged
    },
  },
  {
    field: 'debts',
    patterns: [
      /\b(?:no tengo deudas|no debts|no tengo ninguna deuda|without debt|0 debts|0 deudas|no tengo)\b/i,
    ],
    parse: () => [],
    merge: () => [],
  },
  {
    field: 'emergencyFund',
    patterns: [
      /\b(?:emergency fund|fondo de emergencia|ahorros de emergencia|emergency savings)\s*(?:de|of|is|es)?\s*(?:L|HNL|\$|USD)?\s*(\d{3,}(?:[.,]\d+)?)\b/i,
      /\b(\d{3,}(?:[.,]\d+)?)\s+(?:in\s+)?(?:my\s+)?(?:emergency fund|fondo de emergencia)\b/i,
    ],
    parse: (m) => parseFloat(m[1].replace(/,/g, '')),
  },
  {
    field: 'totalSavings',
    patterns: [
      /\b(?:ahorros?|savings?|tengo ahorrado|i have saved|he ahorrado)\s*(?:de|of|about|approx)?\s*(?:L|HNL|\$|USD)?\s*(\d{3,}(?:[.,]\d+)?)\b/i,
    ],
    parse: (m) => parseFloat(m[1].replace(/,/g, '')),
  },
  {
    field: 'shortTermGoals',
    patterns: [
      /\b(?:short.term goal|corto plazo|short term|meta a corto|inmediato|immediate|this month|este mes|next month|próximo mes)\s*(?::|is|es)?\s*(.+?)(?:\.|$| and | y )/i,
    ],
    parse: (m) => {
      const text = m[1].trim()
      if (text.length > 5 && text.length < 200) {
        return [{ id: Date.now() % 10000, goal: text, steps: '', deadline: '' }]
      }
      return null
    },
    merge: (existing, parsed) => {
      if (!parsed) return existing
      const merged = Array.isArray(existing) ? [...existing] : []
      const exists = merged.some(g => g.goal.toLowerCase() === parsed[0].goal.toLowerCase())
      if (!exists) {
        parsed[0].id = Math.max(0, ...merged.map(g => g.id || 0)) + 1
        merged.push(parsed[0])
      }
      return merged
    },
  },
  {
    field: 'mediumTermGoals',
    patterns: [
      /\b(?:medium.term goal|mediano plazo|medium term|6 months|6 meses|this year|este año|next year|próximo año)\s*(?::|is|es)?\s*(.+?)(?:\.|$| and | y )/i,
    ],
    parse: (m) => {
      const text = m[1].trim()
      if (text.length > 5 && text.length < 200) {
        return [{ id: Date.now() % 10000, goal: text, steps: '', deadline: '' }]
      }
      return null
    },
    merge: (existing, parsed) => {
      if (!parsed) return existing
      const merged = Array.isArray(existing) ? [...existing] : []
      const exists = merged.some(g => g.goal.toLowerCase() === parsed[0].goal.toLowerCase())
      if (!exists) {
        parsed[0].id = Math.max(0, ...merged.map(g => g.id || 0)) + 1
        merged.push(parsed[0])
      }
      return merged
    },
  },
  {
    field: 'longTermGoals',
    patterns: [
      /\b(?:long.term goal|largo plazo|long term|5 years|5 años|future|futuro|some day|algún día)\s*(?::|is|es)?\s*(.+?)(?:\.|$| and | y )/i,
    ],
    parse: (m) => {
      const text = m[1].trim()
      if (text.length > 5 && text.length < 200) {
        return [{ id: Date.now() % 10000, goal: text, steps: '', deadline: '' }]
      }
      return null
    },
    merge: (existing, parsed) => {
      if (!parsed) return existing
      const merged = Array.isArray(existing) ? [...existing] : []
      const exists = merged.some(g => g.goal.toLowerCase() === parsed[0].goal.toLowerCase())
      if (!exists) {
        parsed[0].id = Math.max(0, ...merged.map(g => g.id || 0)) + 1
        merged.push(parsed[0])
      }
      return merged
    },
  },
]

function extractField(fieldConfig, text, currentValue) {
  for (const pattern of fieldConfig.patterns) {
    const match = text.match(pattern)
    if (match) {
      if (fieldConfig.condition && !fieldConfig.condition(text)) continue
      try {
        const value = fieldConfig.parse(match, text)
        if (value === null || value === undefined) continue

        if (fieldConfig.merge && currentValue !== undefined) {
          return fieldConfig.merge(currentValue, value)
        }
        return value
      } catch {
        continue
      }
    }
  }
  return undefined
}

export function extractFormDataFromMemory(memory, currentFormData = {}) {
  if (!memory || !memory.userInputs || memory.userInputs.length === 0) {
    return {}
  }

  const allText = memory.userInputs
    .map(u => u.content)
    .filter(Boolean)
    .join('\n')

  const updates = {}

  for (const rule of EXTRACTION_RULES) {
    const currentVal = currentFormData[rule.field]
    if (currentVal !== undefined && currentVal !== '' && currentVal !== null) {
      if (Array.isArray(currentVal) && currentVal.length === 0) {
      } else if (typeof currentVal === 'number' && currentVal > 0) {
        continue
      } else if (typeof currentVal === 'string' && currentVal.trim() !== '') {
        continue
      } else {
        continue
      }
    }

    const value = extractField(rule, allText, currentFormData[rule.field])
    if (value !== undefined) {
      updates[rule.field] = value
    }
  }

  return updates
}

export function formatFormUpdateMessage(updates, lang) {
  const t = (es, en) => lang === 'es' ? es : en

  if (Object.keys(updates).length === 0) return null

  const fieldLabels = {
    name: t('Nombre', 'Name'),
    age: t('Edad', 'Age'),
    location: t('Ubicación', 'Location'),
    dependents: t('Dependientes', 'Dependents'),
    maritalStatus: t('Estado civil', 'Marital status'),
    employmentStatus: t('Empleo', 'Employment'),
    education: t('Educación', 'Education'),
    foodSecurity: t('Seguridad alimentaria', 'Food security'),
    housingSecurity: t('Vivienda', 'Housing'),
    mentalHealth: t('Salud mental', 'Mental health'),
    housingSituation: t('Vivienda', 'Housing situation'),
    incSalary: t('Salario', 'Salary'),
    totalExpenses: t('Gastos totales', 'Total expenses'),
    debts: t('Deudas', 'Debts'),
    emergencyFund: t('Fondo de emergencia', 'Emergency fund'),
    totalSavings: t('Ahorros', 'Savings'),
    shortTermGoals: t('Metas a corto plazo', 'Short-term goals'),
    mediumTermGoals: t('Metas a mediano plazo', 'Medium-term goals'),
    longTermGoals: t('Metas a largo plazo', 'Long-term goals'),
  }

  const filled = Object.keys(updates)
    .map(f => {
      const label = fieldLabels[f] || f
      const val = updates[f]
      if (typeof val === 'string') return `${label}: "${val}"`
      if (typeof val === 'number') return `${label}: ${val}`
      if (Array.isArray(val)) return `${label}: ${val.length} registrado(s)`
      return label
    })
    .filter(Boolean)

  if (filled.length === 0) return null

  return t(
    `✅ He registrado: ${filled.join(', ')}.\n\nPuedes revisar los datos en el formulario y ajustarlos cuando quieras.`,
    `✅ I've recorded: ${filled.join(', ')}.\n\nYou can review the data in the form and adjust it whenever you want.`
  )
}
