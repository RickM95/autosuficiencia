import { SearchTriggerEngine } from './searchTriggerEngine.js'
import { PublicApiService } from './publicApiService.js'
import { WebResultProcessor } from './webResultProcessor.js'
import { BilingualFormatter } from './bilingualFormatter.js'
import { KBEnrichmentModule } from './kbEnrichmentModule.js'

let _instance = null

export class WebLayerIntegration {
  constructor() {
    this.trigger = new SearchTriggerEngine()
    this.api = new PublicApiService()
    this.processor = new WebResultProcessor()
    this.formatter = new BilingualFormatter()
    this.kbEnrich = new KBEnrichmentModule()
    this.enabled = true
  }

  setEnabled(v) { this.enabled = v }
  isEnabled() { return this.enabled }

  async process(input, kbResult, lang = 'es') {
    if (!this.enabled) return { source: 'kb', message: 'Web layer disabled' }

    const kbConfidence = this.trigger.estimateKBConfidence(kbResult)
    const decision = this.trigger.shouldTriggerWebSearch(input, kbConfidence)

    if (!decision.trigger) {
      return { source: 'kb', confidence: kbConfidence, reason: decision.reason }
    }

    if (!this.api.isAvailable()) {
      return {
        source: 'kb_fallback',
        confidence: kbConfidence,
        reason: 'Offline — API unavailable',
        message: lang === 'es'
          ? 'Sin conexión. Usando base de conocimiento local.'
          : 'Offline. Using local knowledge base.',
      }
    }

    try {
      const searchResult = await this.api.searchPublic(input)
      if (!searchResult.success || !searchResult.results.length) {
        return {
          source: 'kb_fallback',
          confidence: kbConfidence,
          reason: searchResult.error || 'No results',
          message: lang === 'es'
            ? 'No se encontró información. Usando conocimiento local.'
            : 'No information found. Using local knowledge.',
        }
      }

      const processed = this.processor.process(searchResult.results, input)
      const formatted = this.formatter.formatWebResult(processed, input)

      this.kbEnrich.storeWebResult(processed, 0.6, input)

      return {
        source: 'web',
        webSource: 'wikipedia',
        confidence: 0.6,
        decision,
        processed,
        formatted,
        lang,
      }
    } catch (err) {
      return {
        source: 'kb_fallback',
        confidence: kbConfidence,
        reason: err.message,
        message: lang === 'es'
          ? 'Error al consultar fuente externa. Usando conocimiento local.'
          : 'Error querying external source. Using local knowledge.',
      }
    }
  }
}

export function getWebLayer() {
  if (!_instance) _instance = new WebLayerIntegration()
  return _instance
}

export function isWebRequest(input) {
  return /look up|search|find|google|wikipedia|tell me about|what is|who is|explain|define/i.test(input || '')
}
