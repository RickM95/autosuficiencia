const EMOTIONAL_PATTERNS = /sad|depressed|anxious|lonely|scared|hurt|grief|worthless|numb|empty|overwhelm|i feel|i am feeling|who am i|my life|no purpose|no direction/i
const DEV_PATTERNS = /inspect|patch|modify|implement|build function|scan dep|install pkg|dev|code|module|function/i
const INFORMATIONAL_PATTERNS = /what is|who is|where is|how does|tell me about|explain|define|meaning of|what does|how to|why is|what are/i
const EXPLICIT_SEARCH_PATTERNS = /look up|search|find|google|wikipedia|tell me about|i want to know about|can you look/i

export class SearchTriggerEngine {
  shouldTriggerWebSearch(input, kbConfidence = 1.0) {
    const lower = (input || '').toLowerCase().trim()

    if (!input || input.length < 3) return { trigger: false, reason: 'Input too short', confidence: 0 }

    if (EMOTIONAL_PATTERNS.test(lower)) {
      return { trigger: false, reason: 'Emotional/personal query — web search blocked', confidence: 0 }
    }

    if (DEV_PATTERNS.test(lower)) {
      return { trigger: false, reason: 'Dev/system request — web search blocked', confidence: 0 }
    }

    if (EXPLICIT_SEARCH_PATTERNS.test(lower)) {
      return { trigger: true, reason: 'User explicitly requested information lookup', confidence: 0.5 }
    }

    if (INFORMATIONAL_PATTERNS.test(lower) && kbConfidence < 0.6) {
      return { trigger: true, reason: `Informational question with low KB confidence (${kbConfidence.toFixed(2)})`, confidence: kbConfidence }
    }

    if (kbConfidence < 0.3) {
      return { trigger: true, reason: `KB confidence critically low (${kbConfidence.toFixed(2)})`, confidence: kbConfidence }
    }

    return { trigger: false, reason: `KB sufficient (confidence ${kbConfidence.toFixed(2)})`, confidence: kbConfidence }
  }

  estimateKBConfidence(kbResult) {
    if (!kbResult) return 0
    if (!kbResult.actions || kbResult.actions.length === 0) return 0.15
    if (!kbResult.principles || kbResult.principles.length === 0) return 0.25

    let score = 0.5
    if (kbResult.actions.length >= 3) score += 0.2
    else if (kbResult.actions.length >= 1) score += 0.1
    if (kbResult.principles.length >= 3) score += 0.15
    else if (kbResult.principles.length >= 1) score += 0.05

    return Math.min(1, Math.max(0, score))
  }
}
