const CATEGORY_KEYWORDS = {
  finances: ['budget', 'debt', 'savings', 'income', 'expenses', 'money', 'financial', 'interest', 'loan', 'credit', 'invest'],
  wellbeing: ['stress', 'anxiety', 'mental health', 'wellbeing', 'emotional', 'self-care', 'coping', 'resilience'],
  goals: ['goal', 'objective', 'achievement', 'milestone', 'planning', 'motivation', 'productivity'],
  resources: ['program', 'ngo', 'government', 'assistance', 'support', 'community', 'services'],
  education: ['course', 'training', 'study', 'learn', 'skill', 'career', 'job', 'employment'],
  housing: ['housing', 'rent', 'mortgage', 'property', 'home', 'shelter', 'accommodation'],
  food: ['food', 'nutrition', 'recipe', 'meal', 'cooking', 'garden', 'agriculture'],
  health: ['health', 'medical', 'doctor', 'clinic', 'medicine', 'hospital', 'insurance'],
}

const MAX_STORED_RESULTS = 200

export class KBEnrichmentModule {
  constructor() {
    this.storedResults = []
    this.maxStored = MAX_STORED_RESULTS
  }

  categorizeContent(content) {
    const lower = (content || '').toLowerCase()
    const scores = {}

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      scores[category] = 0
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
          scores[category] += 2
        }
      }
      const wordCount = lower.split(/\s+/).length
      scores[category] = scores[category] / Math.max(1, wordCount / 50)
    }

    let bestCategory = 'uncategorized'
    let bestScore = 0
    for (const [cat, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score
        bestCategory = cat
      }
    }

    return { category: bestCategory, confidence: bestScore }
  }

  storeWebResult(processedResult, confidenceScore, sourceQuery) {
    if (!processedResult || processedResult.isEmpty) return null

    const combined = `${processedResult.summary || ''} ${(processedResult.keyPoints || []).join(' ')}`
    const categorization = this.categorizeContent(combined)

    const entry = {
      id: `web_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type: 'web_enhanced',
      category: categorization.category,
      categoryConfidence: categorization.confidence,
      summary: processedResult.summary || '',
      keyPoints: processedResult.keyPoints || [],
      sources: processedResult.sources || [],
      confidenceScore,
      query: sourceQuery,
      storedAt: new Date().toISOString(),
      accessCount: 0,
    }

    const existing = this._findDuplicate(entry)
    if (existing) {
      existing.accessCount++
      existing.confidenceScore = Math.max(existing.confidenceScore, confidenceScore)
      return { deduplicated: true, existing }
    }

    this.storedResults.push(entry)
    if (this.storedResults.length > this.maxStored) {
      const oldest = this.storedResults.reduce((a, b) => a.accessCount < b.accessCount ? a : b)
      this.storedResults = this.storedResults.filter(r => r.id !== oldest.id)
    }

    return { stored: true, entry }
  }

  searchLocal(query) {
    const lower = (query || '').toLowerCase()
    const matched = this.storedResults.filter(r => {
      const content = `${r.summary} ${r.keyPoints.join(' ')}`.toLowerCase()
      return lower.split(/\s+/).some(term => term.length > 3 && content.includes(term))
    })

    for (const m of matched) m.accessCount++

    return matched.sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 5)
  }

  getStats() {
    const byCategory = {}
    for (const r of this.storedResults) {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1
    }
    return {
      totalStored: this.storedResults.length,
      byCategory,
      topSources: [...new Set(this.storedResults.flatMap(r => r.sources.map(s => s.source)))].slice(0, 10),
    }
  }

  _findDuplicate(entry) {
    const content = `${entry.summary} ${entry.keyPoints.join(' ')}`.substring(0, 100).toLowerCase()
    return this.storedResults.find(r => {
      const existing = `${r.summary} ${r.keyPoints.join(' ')}`.substring(0, 100).toLowerCase()
      if (content === existing) return true
      if (entry.query && r.query && entry.query.toLowerCase() === r.query.toLowerCase()) return true
      return false
    })
  }
}
