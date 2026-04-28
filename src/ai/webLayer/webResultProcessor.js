export class WebResultProcessor {
  constructor() {
    this.noisePatterns = [
      /advertisement|sponsored|promoted|click here|subscribe|sign up|buy now/i,
      /cookie|privacy policy|terms of service|all rights reserved/i,
      /^\s*$|undefined|null|NaN/i,
    ]
  }

  process(rawResults, query) {
    if (!rawResults || rawResults.length === 0) {
      return { summary: '', keyPoints: [], sources: [], isEmpty: true }
    }

    const cleaned = this._removeNoise(rawResults)
    const deduplicated = this._deduplicate(cleaned)
    const scored = this._score(deduplicated, query)
    const ranked = scored.sort((a, b) => b._score - a._score)
    const topResults = ranked.slice(0, 5)
    const keyPoints = this._extractKeyPoints(topResults)
    const sources = topResults.map(r => ({ title: r.title, url: r.url, source: r.source }))

    return {
      summary: this._generateSummary(topResults, query),
      keyPoints,
      sources,
      totalFound: rawResults.length,
      totalProcessed: topResults.length,
      isEmpty: false,
    }
  }

  _removeNoise(results) {
    return results.filter(r => {
      if (!r.title && !r.snippet) return false
      const combined = `${r.title} ${r.snippet}`
      return !this.noisePatterns.some(p => p.test(combined))
    })
  }

  _deduplicate(results) {
    const seen = new Set()
    return results.filter(r => {
      const key = (r.title + r.snippet).substring(0, 80).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  _score(results, query) {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3)
    return results.map(r => {
      let score = 0.5
      const combined = `${r.title} ${r.snippet}`.toLowerCase()
      for (const term of queryTerms) {
        if (combined.includes(term)) score += 0.1
      }
      if (r.source && ['wikipedia', 'edu', 'gov', 'org'].some(s => r.source.includes(s))) score += 0.15
      if (r.snippet && r.snippet.length > 100) score += 0.1
      if (r.title && r.title.length > 10) score += 0.05
      return { ...r, _score: Math.min(1, score) }
    })
  }

  _extractKeyPoints(results) {
    const points = []
    for (const r of results) {
      if (r.snippet) {
        const sentences = r.snippet.split(/\.\s+/).filter(s => s.length > 20)
        for (const s of sentences.slice(0, 2)) {
          const clean = s.replace(/<[^>]*>/g, '').trim()
          if (clean && !points.includes(clean)) points.push(clean)
        }
      }
    }
    return points.slice(0, 6)
  }

  _generateSummary(results) {
    if (results.length === 0) return ''
    const top = results[0]
    const points = this._extractKeyPoints(results)
    const summary = points.length > 0
      ? points.slice(0, 3).join('. ') + '.'
      : top.snippet || top.title || ''
    return summary
  }
}
