import { t } from '../translate.js'

export function getNeedsAdvice(analysis, _formData, lang) {
  const { critical, warnings, score } = analysis

  if (critical.length === 0 && warnings.length === 0) {
    return t(
      '✅ **Todas tus necesidades básicas están estables.** ¡Es una gran base! ¿En qué área específica te gustaría enfocarte para mejorar aún más?',
      '✅ **All your basic needs are stable.** That\'s a great foundation! What specific area would you like to focus on improving further?',
      lang
    )
  }

  const parts = []

  if (critical.length > 0) {
    parts.push(t('🔴 **Necesidades Críticas — Atención Inmediata:**', '🔴 **Critical Needs — Immediate Attention:**', lang))
    parts.push('')
    for (const item of critical) {
      parts.push(`- **${item.area}** (${item.value}/5) — ${getNeedAction(item.area, lang)}`)
    }
    parts.push('', t('**Pasos para hoy:**', '**Steps for today:**', lang))
    for (const item of critical) {
      parts.push(`  • ${getNeedStep(item.area, lang)}`)
    }
    parts.push('')
  }

  if (warnings.length > 0) {
    parts.push(t('🟡 **Áreas que necesitan atención:**', '🟡 **Areas needing attention:**', lang))
    for (const item of warnings) {
      parts.push(`- ${item.area} (${item.value || '?'}/5)`)
    }
    parts.push('')
  }

  if (lang === 'es') {
    parts.push(`**Puntaje general de necesidades: ${score}/100**`)
    if (score < 40) parts.push('Vamos a trabajar juntos para mejorar esto. ¿Cuál de estas áreas te preocupa más?')
    else if (score < 70) parts.push('Vas por buen camino. ¿En qué área específica quisieras enfocarte primero?')
    else parts.push('¿Hay algún área específica donde te gustaría profundizar?')
  } else {
    parts.push(`**Overall needs score: ${score}/100**`)
    if (score < 40) parts.push("Let's work together to improve this. Which of these areas concerns you most?")
    else if (score < 70) parts.push('You\'re on the right track. What specific area would you like to focus on first?')
    else parts.push('Is there a specific area you\'d like to go deeper on?')
  }

  return parts.join('\n')
}

function getNeedAction(area, lang) {
  const actions = {
    'Food security': t('Puede no tener acceso confiable a alimentos', 'May not have reliable access to food', lang),
    'Housing stability': t('Riesgo de perder vivienda', 'Risk of losing housing', lang),
    'Physical health': t('Necesita atención médica', 'Needs medical attention', lang),
    'Mental health': t('Estrés emocional significativo', 'Significant emotional stress', lang),
    'Personal safety': t('Riesgo de seguridad', 'Safety risk', lang),
    'Clothing': t('Necesidades básicas de vestimenta insatisfechas', 'Basic clothing needs unmet', lang),
    'Transportation': t('Movilidad limitada', 'Limited mobility', lang),
  }
  return actions[area] || t('Requiere atención', 'Requires attention', lang)
}

function getNeedStep(area, lang) {
  const steps = {
    'Food security': t(
      'Visita el mercado municipal o la iglesia más cercana para preguntar por programas de asistencia alimentaria',
      'Visit the local market or nearest church to ask about food assistance programs',
      lang
    ),
    'Housing stability': t(
      'Contacta la municipalidad para preguntar por programas de vivienda de emergencia',
      'Contact the municipality to ask about emergency housing programs',
      lang
    ),
    'Physical health': t(
      'Ve al centro de salud más cercano — la consulta es gratuita',
      'Go to the nearest health center — consultations are free',
      lang
    ),
    'Mental health': t(
      'Habla con alguien de confianza hoy. Respira profundo. No estás solo.',
      'Talk to someone you trust today. Breathe deeply. You\'re not alone.',
      lang
    ),
    'Personal safety': t(
      'Identifica un lugar seguro cerca. Comparte tu situación con alguien de confianza.',
      'Identify a safe place nearby. Share your situation with someone you trust.',
      lang
    ),
    'Clothing': t(
      'Pregunta en iglesias o centros comunitarios por donaciones de ropa',
      'Ask at churches or community centers about clothing donations',
      lang
    ),
    'Transportation': t(
      'Identifica opciones de transporte de bajo costo en tu área',
      'Identify low-cost transportation options in your area',
      lang
    ),
  }
  return steps[area] || t('Busca ayuda en tu comunidad', 'Seek help in your community', lang)
}

const STRESS_RESPONSES = {
  es: [
    '🧠 **Manejo del Estrés:** El estrés financiero es real y afecta tu salud, relaciones y decisiones.',
    '',
    '**Inmediato (hoy):**',
    '- Respira profundo — el pánico nubla el juicio',
    '- Escribe en papel lo que te preocupa',
    '- Identifica UNA cosa que puedes controlar hoy',
    '',
    '**Esta semana:**',
    '- Habla con alguien de confianza — el aislamiento empeora el estrés',
    '- Haz ejercicio aunque sea 20 minutos — reduce el cortisol',
    '- Evita decisiones financieras importantes cuando estás en pánico',
    '',
    '**Recuerda:** Tu situación actual NO define tu futuro.',
    '',
    '¿Qué aspecto de tu situación te genera más ansiedad?'
  ],
  en: [
    '🧠 **Managing Stress:** Financial stress is real and affects your health, relationships, and decisions.',
    '',
    '**Immediate (today):**',
    '- Breathe deeply — panic clouds judgment',
    '- Write down your worries on paper',
    '- Identify ONE thing you can control today',
    '',
    '**This week:**',
    '- Talk to someone you trust — isolation makes stress worse',
    '- Exercise even 20 minutes — reduces cortisol',
    '- Avoid major financial decisions when in panic mode',
    '',
    '**Remember:** Your current situation does NOT define your future.',
    '',
    'What aspect of your situation causes you the most anxiety?'
  ]
}

export function getStressAdvice(lang) {
  return STRESS_RESPONSES[lang || 'es'].join('\n')
}

const RESOURCE_RESPONSES = {
  es: {
    intro: '🤝 **Recursos Comunitarios en Honduras:**\n\n**Apoyo alimentario:**\n- Mercados municipales (precios más bajos)\n- Iglesias (programas de asistencia alimentaria)\n- Bancos de alimentos comunitarios\n\n**Apoyo de vivienda:**\n- Municipalidad local (programas de vivienda)\n- Cooperativas de vivienda\n\n**Salud:**\n- Centros de Salud Pública (consulta gratuita)\n- IHSS (si está inscrito)\n- Farmacias comunitarias\n\n**Capacitación y empleo:**\n- INFOP — cursos gratuitos\n- COHEP — programas de emprendimiento\n- Municipalidad — bolsa de empleo\n\n**Programas del gobierno:**\n- Bono Vida Mejor\n- Bono Escolar\n- Bono Tecnológico',
    question: '\n\n¿Qué tipo de recurso te sería más útil en este momento?',
  },
  en: {
    intro: '🤝 **Community Resources in Honduras:**\n\n**Food support:**\n- Municipal markets (lowest prices)\n- Churches (food assistance programs)\n- Community food banks\n\n**Housing support:**\n- Local municipality (housing programs)\n- Housing cooperatives\n\n**Health:**\n- Public Health Centers (free consultation)\n- IHSS (if enrolled)\n- Community pharmacies\n\n**Training & employment:**\n- INFOP — free courses\n- COHEP — entrepreneurship programs\n- Municipality — job board\n\n**Government programs:**\n- Bono Vida Mejor\n- Bono Escolar\n- Bono Tecnológico',
    question: '\n\nWhat type of resource would be most useful to you right now?',
  }
}

export function getResourcesAdvice(lang) {
  const r = RESOURCE_RESPONSES[lang || 'es']
  return r.intro + r.question
}
