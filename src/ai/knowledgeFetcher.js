/**
 * knowledgeFetcher.js
 * Fetches external knowledge (Wikipedia) to augment Nephi's responses.
 */

export class KnowledgeFetcher {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Fetches knowledge from Wikipedia.
   * @param {string} query - The search query.
   * @param {string} lang - The user's language ('es' or 'en').
   * @returns {Promise<string|null>} - A short summary or null if failed.
   */
  async fetchKnowledge(query, lang = 'es') {
    if (!query || query.length < 3) return null;

    const cacheKey = `${lang}:${query.toLowerCase()}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    try {
      const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Api-User-Agent': 'NephiAssistant/1.0 (https://yourwebsite.com; contact@yourwebsite.com)' }
      });

      if (!response.ok) {
        // If localized version fails, try English fallback
        if (lang !== 'en') {
          return this.fetchKnowledge(query, 'en');
        }
        return null;
      }

      const data = await response.json();
      const summary = data.extract || null;

      if (summary) {
        this.cache.set(cacheKey, summary);
      }

      return summary;
    } catch (error) {
      console.warn('Knowledge fetch failed gracefully:', error);
      return null;
    }
  }

  /**
   * Detects if external knowledge is needed.
   */
  needsExternalKnowledge(text, intent, kbGapDetected) {
    const textLower = text.toLowerCase();
    const explanationKeywords = [
      'qué es', 'que es', 'significa', 'explicame', 'cómo funciona',
      'what is', 'means', 'explain', 'how does', 'definition'
    ];
    
    const asksForExplanation = explanationKeywords.some(k => textLower.includes(k));
    
    return asksForExplanation || kbGapDetected;
  }
}

export const knowledgeFetcher = new KnowledgeFetcher();
