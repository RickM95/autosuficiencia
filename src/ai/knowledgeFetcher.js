/**
 * knowledgeFetcher.js
 * Fetches external knowledge (Wikipedia) to augment Nephi's responses.
 */

export class KnowledgeFetcher {
  constructor() {
    this.cache = new Map();
  }

  async fetchWithTimeout(resource, options = {}) {
    const { timeout = 3000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  }

  async fetchKnowledge(query, lang = 'es', attempt = 0) {
    if (!query || query.length < 3) return { success: false, fallback: true };

    const cacheKey = `${lang}:${query.toLowerCase()}`;
    if (this.cache.has(cacheKey)) return { success: true, text: this.cache.get(cacheKey) };

    try {
      const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      
      const response = await this.fetchWithTimeout(endpoint, {
        timeout: 2500,
        headers: { 'Api-User-Agent': 'NephiAssistant/2.0' }
      });

      if (!response.ok) {
        if (lang !== 'en') return this.fetchKnowledge(query, 'en', attempt);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Phase 6.3: Schema validation
      if (!data || typeof data !== 'object' || !data.extract) {
        throw new Error('Invalid schema from Wikipedia API');
      }

      const summary = data.extract;
      if (summary && summary.length > 10) {
        this.cache.set(cacheKey, summary);
        return { success: true, text: summary };
      }

      return { success: false, fallback: true };
    } catch (error) {
      // Phase 6.2: Exponential backoff (max 1 retry)
      if (attempt < 1 && (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('HTTP'))) {
        const delay = 500 * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        return this.fetchKnowledge(query, lang, attempt + 1);
      }
      
      console.warn('[KnowledgeFetcher] Hard failure:', error.message);
      // Phase 6.4: Safe structured fallback
      return { success: false, fallback: true };
    }
  }

  needsExternalKnowledge(text, intent, kbGapDetected) {
    const textLower = (text || '').toLowerCase();
    const explanationKeywords = [
      'qué es', 'que es', 'significa', 'explicame', 'cómo funciona',
      'what is', 'means', 'explain', 'how does', 'definition'
    ];
    
    return explanationKeywords.some(k => textLower.includes(k)) || kbGapDetected;
  }
}

export const knowledgeFetcher = new KnowledgeFetcher();
