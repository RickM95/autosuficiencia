/**
 * domainFusionEngine.js
 * Interprets user input across multiple domains to provide deep insights.
 */

export function fuseDomains(input, memory) {
  const text = (input || '').toLowerCase()
  const domains = {
    financial: analyzeFinancial(text),
    emotional: analyzeEmotional(text),
    behavioral: analyzeBehavioral(text),
    social: analyzeSocial(text),
    lifeDirection: analyzeLifeDirection(text)
  }

  const activeDomains = Object.entries(domains)
    .filter(([_, data]) => data.detected)
    .map(([name, data]) => ({ name, ...data }))

  return {
    domains,
    activeDomains,
    primaryDomain: activeDomains.sort((a, b) => b.confidence - a.confidence)[0]?.name || 'general',
    hasCrisis: domains.emotional.isCrisis || domains.financial.isCrisis
  }
}

function analyzeFinancial(text) {
  const keywords = ['deuda', 'debt', 'dinero', 'money', 'trabajo', 'job', 'ingreso', 'income', 'pobre', 'poor']
  const detected = keywords.some(k => text.includes(k))
  return {
    detected,
    confidence: detected ? 0.8 : 0,
    isCrisis: text.includes('emergencia') || text.includes('hambre') || text.includes('calle') || text.includes('eviction') || text.includes('desalojo'),
    signal: detected ? 'financial_mention' : 'none'
  }
}

function analyzeEmotional(text) {
  const keywords = ['triste', 'sad', 'miedo', 'afraid', 'preocupado', 'worried', 'ansioso', 'anxious', 'feliz', 'happy']
  const detected = keywords.some(k => text.includes(k))
  return {
    detected,
    confidence: detected ? 0.7 : 0,
    isCrisis: text.includes('suicidio') || text.includes('morir') || text.includes('breakdown'),
    signal: detected ? 'emotional_mention' : 'none'
  }
}

function analyzeBehavioral(text) {
  const keywords = ['siempre', 'nunca', 'intento', 'hago', 'always', 'never', 'try', 'i do']
  const detected = keywords.some(k => text.includes(k))
  return {
    detected,
    confidence: detected ? 0.5 : 0,
    signal: detected ? 'habit_mention' : 'none'
  }
}

function analyzeSocial(text) {
  const keywords = ['familia', 'family', 'amigos', 'friends', 'solo', 'alone', 'ayuda de', 'help from']
  const detected = keywords.some(k => text.includes(k))
  return {
    detected,
    confidence: detected ? 0.6 : 0,
    signal: detected ? 'social_context' : 'none'
  }
}

function analyzeLifeDirection(text) {
  const keywords = ['futuro', 'future', 'quiero', 'i want', 'meta', 'goal', 'plan', 'adelante', 'forward']
  const detected = keywords.some(k => text.includes(k))
  return {
    detected,
    confidence: detected ? 0.6 : 0,
    signal: detected ? 'direction_mention' : 'none'
  }
}

export function generateDeepResponse(input, fusion, memory, lang) {
  // This is now purely data generation for the orchestrator
  return {
    insights: fusion.activeDomains.map(d => d.name),
    priority: fusion.hasCrisis ? 1.0 : (fusion.activeDomains.length > 0 ? 0.8 : 0.4),
    suggestedAction: fusion.hasCrisis ? 'immediate_intervention' : 'explore_domains'
  }
}
