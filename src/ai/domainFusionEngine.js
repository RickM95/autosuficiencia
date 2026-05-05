import { scoreKeywords } from './negationUtils.js'

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
    .filter(([_, data]) => data.score > 0.3)
    .map(([name, data]) => ({ name, ...data }))

  const maxUrgency = Math.max(domains.emotional.urgency, domains.financial.urgency);

  const sortedDomains = activeDomains.slice().sort((a, b) => b.score - a.score)

  return {
    scores: {
      financial: domains.financial.score,
      emotional: domains.emotional.score,
      behavioral: domains.behavioral.score,
      social: domains.social.score,
      lifeDirection: domains.lifeDirection.score,
      urgency: Math.min(1.0, maxUrgency)
    },
    activeDomains,
    primaryDomain: sortedDomains[0]?.name || 'general',
    hasCrisis: maxUrgency >= 0.8
  }
}

function analyzeFinancial(text) {
  const result = scoreKeywords(text, ['deuda', 'debt', 'dinero', 'money', 'trabajo', 'job', 'ingreso', 'income', 'pobre', 'poor'])
  const urgencyBase = scoreKeywords(text, ['emergencia', 'hambre', 'calle', 'eviction', 'desalojo'])
  return { score: result.score, urgency: urgencyBase.score * 1.5 + result.urgencyModifier }
}

function analyzeEmotional(text) {
  const result = scoreKeywords(text, ['triste', 'sad', 'miedo', 'afraid', 'preocupado', 'worried', 'ansioso', 'anxious', 'feliz', 'happy'])
  const urgencyBase = scoreKeywords(text, ['suicidio', 'morir', 'breakdown', 'matar', 'kill'])
  return { score: result.score, urgency: urgencyBase.score * 2.0 + result.urgencyModifier }
}

function analyzeBehavioral(text) {
  const result = scoreKeywords(text, ['siempre', 'nunca', 'intento', 'hago', 'always', 'never', 'try', 'i do'])
  return { score: result.score, urgency: result.urgencyModifier }
}

function analyzeSocial(text) {
  const result = scoreKeywords(text, ['familia', 'family', 'amigos', 'friends', 'solo', 'alone', 'ayuda de', 'help from'])
  return { score: result.score, urgency: result.urgencyModifier }
}

function analyzeLifeDirection(text) {
  const result = scoreKeywords(text, ['futuro', 'future', 'quiero', 'i want', 'meta', 'goal', 'plan', 'adelante', 'forward'])
  return { score: result.score, urgency: result.urgencyModifier }
}

export function generateDeepResponse(input, fusion, memory, lang) {
  return {
    insights: fusion.activeDomains.map(d => d.name),
    priority: fusion.hasCrisis ? 1.0 : (fusion.activeDomains.length > 0 ? 0.8 : 0.4),
    suggestedAction: fusion.hasCrisis ? 'immediate_intervention' : 'explore_domains'
  }
}
