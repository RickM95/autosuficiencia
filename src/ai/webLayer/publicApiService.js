const USER_AGENT = 'NephiAsesorAS/1.0 (local-first AI assistant)'

export class PublicApiService {
  constructor() {
    this.cache = new Map()
    this.cacheTTL = 3600000
  }

  async fetchWikipedia(query) {
    const normalized = query.trim().substring(0, 200)
    const cacheKey = `wiki:${normalized.toLowerCase()}`

    const cached = this._getCached(cacheKey)
    if (cached) return cached

    try {
      const encoded = encodeURIComponent(normalized)
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`

      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000),
      })

      if (!response.ok) {
        if (response.status === 404) return this._notFound(`No Wikipedia page found for "${normalized}"`)
        throw new Error(`Wikipedia API returned ${response.status}`)
      }

      const data = await response.json()

      const result = {
        success: true,
        source: 'wikipedia',
        title: data.title || '',
        extract: data.extract || '',
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encoded}`,
        thumbnail: data.thumbnail?.source || null,
        apiUsed: 'wikipedia',
        fetchedAt: new Date().toISOString(),
        query: normalized,
      }

      this._setCache(cacheKey, result)
      return result
    } catch (err) {
      if (err.name === 'AbortError') return this._error('Wikipedia request timed out')
      if (err.message.includes('Failed to fetch')) return this._error('Network unavailable for Wikipedia')
      return this._error(err.message)
    }
  }

  async fetchWikipediaTopicList(query) {
    const encoded = encodeURIComponent(query.trim())
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&origin=*&srlimit=5`
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) return []

      const data = await response.json()
      return (data.query?.search || []).map(r => r.title)
    } catch {
      return []
    }
  }

  async searchPublic(query) {
    const summary = await this.fetchWikipedia(query)
    if (summary.success) {
      return {
        success: true,
        results: [{
          title: summary.title,
          snippet: summary.extract?.substring(0, 500) || '',
          url: summary.url,
          source: 'wikipedia',
        }],
        totalResults: 1,
        query,
      }
    }

    const topics = await this.fetchWikipediaTopicList(query)
    if (topics.length > 0) {
      const firstResult = await this.fetchWikipedia(topics[0])
      if (firstResult.success) {
        return {
          success: true,
          results: [{
            title: firstResult.title,
            snippet: firstResult.extract?.substring(0, 500) || '',
            url: firstResult.url,
            source: 'wikipedia',
          }],
          totalResults: 1,
          query,
        }
      }
    }

    return { success: false, results: [], error: `No information found for "${query}"`, query }
  }

  isAvailable() {
    return typeof navigator === 'undefined' || navigator.onLine !== false
  }

  clearCache() { this.cache.clear() }

  _getCached(key) {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > this.cacheTTL) { this.cache.delete(key); return null }
    return entry.data
  }

  _setCache(key, data) { this.cache.set(key, { data, timestamp: Date.now() }) }

  _notFound(msg) { return { success: false, source: 'wikipedia', error: msg, query: '' } }
  _error(msg) { return { success: false, source: 'wikipedia', error: msg, query: '' } }
}
