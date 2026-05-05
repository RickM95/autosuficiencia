const NEGATIONS = ['no', 'sin', 'nunca', 'not', 'without', 'never', 'ni', 'tampoco', 'neither', "n't"]

function tokenize(text) {
  return (text || '').toLowerCase().split(/\s+/).filter(Boolean)
}

function stripPunctuation(word) {
  return word.replace(/[^\w']/g, '')
}

function isNegated(tokens, index) {
  const windowStart = Math.max(0, index - 3)
  for (let i = windowStart; i < index; i++) {
    if (!tokens[i]) continue
    const cleaned = stripPunctuation(tokens[i])
    if (NEGATIONS.includes(cleaned)) return true
    if (cleaned !== "n't" && cleaned.endsWith("n't")) return true
  }
  return false
}

function hasNegation(text) {
  const tokens = tokenize(text)
  return tokens.some((t, i) => isNegated(tokens, i))
}

function scoreKeywords(text, keywords) {
  const tokens = tokenize(text)
  let count = 0
  let negatedCount = 0

  for (const k of keywords) {
    const kwTokens = tokenize(k)
    for (let i = 0; i <= tokens.length - kwTokens.length; i++) {
      let match = true
      for (let j = 0; j < kwTokens.length; j++) {
        const clean = stripPunctuation(tokens[i + j])
        if (clean !== kwTokens[j]) { match = false; break }
      }
      if (match) {
        if (isNegated(tokens, i)) {
          negatedCount++
        } else {
          count++
        }
      }
    }
  }

  return {
    score: Math.min(1.0, count * 0.35 + negatedCount * 0.2),
    urgencyModifier: negatedCount * 0.4
  }
}

export { NEGATIONS, tokenize, stripPunctuation, isNegated, hasNegation, scoreKeywords }
