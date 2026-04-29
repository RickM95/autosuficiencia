/**
 * ResponseGenerator.js
 *
 * Creates dynamic, personalized, humanized responses.
 * Replaces rigid templates with adaptive generation based on context.
 */

export class ResponseGenerator {
  static generate(reasoning, formData, context = {}) {
    // Step 1: Determine response structure based on intervention need
    const structure = this.planResponseStructure(reasoning, context)

    // Step 2: Generate each component
    const components = {
      opening: this.generateOpening(reasoning, context),
      validation: this.generateValidation(reasoning, context),
      insight: this.generateInsight(reasoning, formData, context),
      action: this.generateAction(reasoning, formData, context),
      clarifyingQ: this.generateClarifyingQuestion(reasoning, context),
      closing: this.generateClosing(reasoning, context)
    }

    // Step 3: Assemble based on response mode
    const assembled = this.assemble(components, structure, reasoning.responseMode)

    // Step 4: Add variation to avoid repetition
    const varied = this.addVariation(assembled, context.turnCount || 0)

    return varied
  }

  static planResponseStructure(reasoning, context) {
    const mode = reasoning.responseMode || 'NORMAL'

    const structures = {
      'QUESTION_FIRST': ['validation', 'clarifyingQ'],
      'OBSTACLE_FIRST': ['validation', 'opening', 'action'],
      'ADDRESS_CONCERN': ['validation', 'insight', 'action'],
      'EMOTIONAL_FIRST': ['validation', 'opening', 'action'],
      'STEP_BY_STEP': ['opening', 'action'],
      'VALIDATE_AND_EMPOWER': ['validation', 'insight', 'closing'],
      'CONTEXTUAL': ['validation', 'insight'],
      'PRIORITIZE': ['opening', 'action', 'closing'],
      'NORMAL': ['opening', 'validation', 'insight', 'action', 'closing']
    }

    return structures[mode] || structures.NORMAL
  }

  static generateOpening(reasoning, context = {}) {
    const turn = context.turnCount || 1
    const mode = reasoning.responseMode || 'NORMAL'

    // First response: warm introduction
    if (turn === 1) {
      return context.lang === 'es'
        ? 'Entiendo. Déjame ayudarte a clarificar tu situación.'
        : 'I understand. Let me help clarify your situation.'
    }

    // Emotional context: validating opening
    if (reasoning.emotionalContext?.vulnerable) {
      return context.lang === 'es'
        ? 'Lo que describes es completamente válido. Muchas personas enfrentan esto.'
        : 'What you describe is completely valid. Many people face this.'
    }

    // About to ask question: bridge opening
    if (mode === 'QUESTION_FIRST') {
      return context.lang === 'es'
        ? 'Antes de poder ayudarte mejor, necesito entender algo...'
        : 'Before I can help better, I need to understand something...'
    }

    // Crisis response: direct and calm
    if (reasoning.interventionNeed === 'IMMEDIATE') {
      return context.lang === 'es'
        ? 'Veo que estás en una situación difícil. Vamos a enfocarnos en lo más importante ahora.'
        : 'I see you\'re in a difficult situation. Let\'s focus on what\'s most important right now.'
    }

    // Default: direct opening
    return context.lang === 'es'
      ? 'Aquí está lo importante...'
      : 'Here\'s what matters...'
  }

  static generateValidation(reasoning, context = {}) {
    // Acknowledge their specific situation
    const hasDebt = reasoning.financialContext?.hasDebt
    const hasNoEmergency = reasoning.financialContext?.hasNoEmergencyFund
    const isStressed = reasoning.emotionalContext?.stressed
    const isConfused = reasoning.subtexts?.some(s => s.subtext === 'USER_CONFUSION')

    if (hasDebt && hasNoEmergency && isStressed) {
      return context.lang === 'es'
        ? 'Estás en una posición frágil: deuda activa pero sin fondo de emergencia, y además estresado. Ese es exactamente el escenario que requiere estrategia clara y apoyo.'
        : 'You\'re in a fragile position: active debt but no emergency fund, plus stressed. That\'s exactly the scenario requiring clear strategy and support.'
    }

    if (isStressed && reasoning.needsAnalysis?.critical?.length > 0) {
      return context.lang === 'es'
        ? 'Veo que estás abrumado. Eso tiene sentido—hay mucho en tu plato. Vamos a reducir esto a lo esencial.'
        : 'I see you\'re overwhelmed. That makes sense—there\'s a lot on your plate. Let\'s reduce this to essentials.'
    }

    if (isConfused) {
      return context.lang === 'es'
        ? 'La confusión es normal cuando hay mucha información. Vamos paso a paso.'
        : 'Confusion is normal when there\'s too much information. Let\'s take it step by step.'
    }

    // Generic validation
    return context.lang === 'es'
      ? 'Tu situación es comprensible. Vamos a verla en detalle.'
      : 'Your situation is understandable. Let\'s look at it in detail.'
  }

  static generateInsight(reasoning, formData, context = {}) {
    // Generate specific insight about their situation
    // NOT a template; actual reasoning about their data

    const income = formData?.incSalary || 0
    const expenses = formData?.expTotal || 0
    const ratio = income > 0 ? expenses / income : 0

    if (ratio > 1.2) {
      return context.lang === 'es'
        ? `Lo fundamental aquí es esto: cada mes gastas más de lo que ganas. Eso significa que cada mes te endeudas más. Tu prioridad número uno es identificar qué gastos se pueden reducir inmediatamente.`
        : `Here\'s the fundamental issue: each month you spend more than you earn. That means each month you go deeper into debt. Your first priority is identifying which expenses can be reduced immediately.`
    }

    if (ratio > 1.0) {
      return context.lang === 'es'
        ? `Estás en equilibrio peligroso. Cualquier sorpresa te pone en rojo. Necesitas crear colchón de seguridad.`
        : `You\'re in a precarious balance. Any surprise puts you in the red. You need to create a safety cushion.`
    }

    if (formData?.debts?.length > 0) {
      const totalDebt = (formData.debts || []).reduce((s, d) => s + (parseFloat(d.balance) || 0), 0)
      const debtToIncome = income > 0 ? (totalDebt / income) : 0

      if (debtToIncome > 6) {
        return context.lang === 'es'
          ? `Tu deuda es alta—más de 6 meses de ingreso. Eso es limitante. Necesitas atacar deuda de forma agresiva.`
          : `Your debt is substantial—more than 6 months of income. That\'s constraining. You need to attack debt aggressively.`
      }
    }

    // Default insight
    return context.lang === 'es'
      ? 'Tu situación requiere atención clara y acciones específicas.'
      : 'Your situation requires clear attention and specific actions.'
  }

  static generateAction(reasoning, formData, context = {}) {
    // Generate 1-3 actionable steps (avoid overwhelm)
    const actions = []

    if (reasoning.needsAnalysis?.critical?.length > 0) {
      actions.push({
        priority: 1,
        emoji: '🔴',
        action: context.lang === 'es' ? 'Atender necesidad crítica' : 'Address critical need',
        detail: context.lang === 'es'
          ? `Tu prioridad inmediata es ${reasoning.needsAnalysis.critical[0]?.area || 'la necesidad crítica identificada'}`
          : `Your immediate priority is ${reasoning.needsAnalysis.critical[0]?.area || 'the critical need identified'}`
      })
    }

    if (reasoning.financialContext?.isDeficit) {
      actions.push({
        priority: 2,
        emoji: '🟠',
        action: context.lang === 'es' ? 'Reducir déficit' : 'Reduce deficit',
        detail: context.lang === 'es'
          ? 'Esta semana: revisa gastos y reduce al menos 3 categorías'
          : 'This week: review spending and reduce at least 3 categories'
      })
    }

    if (reasoning.financialContext?.hasNoEmergencyFund && reasoning.financialContext?.income > 0) {
      actions.push({
        priority: 3,
        emoji: '🟡',
        action: context.lang === 'es' ? 'Iniciar fondo de emergencia' : 'Start emergency fund',
        detail: context.lang === 'es'
          ? 'Aunque sea pequeño: L50-100/mes es un comienzo'
          : 'Even small: $5-10/month is a start'
      })
    }

    // Limit to 3 actions maximum (avoid overwhelm)
    return actions.slice(0, 3).map((a, i) => `${a.emoji} **${a.action}** — ${a.detail}`).join('\n\n')
  }

  static generateClarifyingQuestion(reasoning, context = {}) {
    // Only generate if needed
    const subtexts = reasoning.subtexts || []

    if (subtexts.some(s => s.subtext === 'USER_CONFUSION')) {
      return context.lang === 'es'
        ? '¿Cuál parte específicamente es confusa para ti? Dime y lo dividimos en pasos más claros.'
        : 'Which part specifically is confusing? Tell me and we\'ll break it into clearer steps.'
    }

    if (subtexts.some(s => s.subtext === 'CAPABILITY_BARRIER')) {
      return context.lang === 'es'
        ? '¿Cuál es el obstáculo principal que ves? Juntos podemos encontrar una forma diferente.'
        : 'What\'s the main obstacle you see? Together we can find a different way.'
    }

    if (subtexts.some(s => s.subtext === 'TIME_PRESSURE')) {
      return context.lang === 'es'
        ? '¿Cuánto tiempo tienes para actuar? Eso cambia la estrategia.'
        : 'How much time do you have to act? That changes the strategy.'
    }

    // If no gaps, return null (no question needed)
    return null
  }

  static generateClosing(reasoning, context = {}) {
    const interventionNeed = reasoning.interventionNeed || 'NORMAL'

    if (interventionNeed === 'IMMEDIATE') {
      return context.lang === 'es'
        ? '¿Cuál es el paso más pequeño que podrías dar hoy mismo?'
        : 'What\'s the smallest step you could take right now?'
    }

    if (interventionNeed === 'IMPORTANT') {
      return context.lang === 'es'
        ? '¿Hay algo aquí que quieras aclarar o profundizar?'
        : 'Is there anything here you want to clarify or explore further?'
    }

    return context.lang === 'es'
      ? 'Estoy aquí para ayudarte en este proceso.'
      : 'I\'m here to help you through this.'
  }

  static assemble(components, structure, responseMode) {
    const parts = []

    for (const key of structure) {
      const component = components[key]
      if (component) {
        parts.push(component)
      }
    }

    return parts.filter(Boolean).join('\n\n')
  }

  static addVariation(response, turnCount) {
    // On early turns, no variation needed
    if (turnCount < 3) return response

    // Simple rotation of greeting phrases
    const greetings = [
      { old: 'Entiendo', new: 'Veo que' },
      { old: 'I understand', new: 'I see that' }
    ]

    let varied = response
    for (const { old, new: newText } of greetings) {
      if (turnCount % 2 === 0 && varied.startsWith(old)) {
        varied = newText + varied.slice(old.length)
        break
      }
    }

    return varied
  }
}
