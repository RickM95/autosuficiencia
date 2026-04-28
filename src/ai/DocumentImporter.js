const TEXT_CATEGORIES = {
  presupuesto: { keywords: ['presupuesto', 'budget', 'gasto', 'gastos', 'ahorro', 'ahorrar', 'ingreso', 'ingresos', 'gastar', 'diner'], category: 'finances' },
  deuda: { keywords: ['deuda', 'deudas', 'deber', 'préstamo', 'préstamos', 'credito', 'crediticia', 'tarjeta'], category: 'debt' },
  metas: { keywords: ['meta', 'metas', 'objetivo', 'objetivos', 'plan', 'futuro', 'sueño'], category: 'goals' },
  bienestar: { keywords: ['estrés', 'ansiedad', 'depresión', 'emocional', 'salud mental', 'bienestar', 'autoestima', 'motivación'], category: 'wellbeing' },
  recursos: { keywords: ['recurso', 'recurso comunitario', 'ong', 'iglesia', 'gobierno', 'programa social', 'ayuda'], category: 'resources' },
  negocio: { keywords: ['negocio', 'emprender', 'emprendimiento', 'microempresa', 'venta', 'ingreso extra', 'trabajo'], category: 'income' },
  vivienda: { keywords: ['vivienda', 'casa', 'alquiler', 'hogar', 'propiedad', 'hipoteca'], category: 'housing' },
  alimentos: { keywords: ['alimentación', 'alimento', 'comida', 'huerto', 'cocina', 'nutrición', 'cultivar'], category: 'food' },
  educacion: { keywords: ['educación', 'estudio', 'curso', 'capacitación', 'aprender', 'escuela', 'técnico'], category: 'education' },
  salud: { keywords: ['salud', 'médico', 'medicina', 'enfermedad', 'hospital', 'clinica', 'consulta'], category: 'health' },
}

const DEFAULT_CATEGORY = 'uncategorized'

const EXTRA_RESOURCES = [
  {
    type: 'food',
    name: 'Programa Bono Vida Mejor',
    description: 'Apoyo condicionado del gobierno de Honduras para alimentación y salud',
    contact: 'Secretaría de Desarrollo Social',
    location: 'Honduras',
    tags: ['food', 'government', 'support'],
  },
  {
    type: 'training',
    name: 'INFOP - Instituto Nacional de Formación Profesional',
    description: 'Cursos gratuitos de capacitación técnica y profesional',
    contact: 'www.infop.hn',
    location: 'Honduras',
    tags: ['training', 'employment', 'education'],
  },
  {
    type: 'health',
    name: 'Centro de Salud Pública',
    description: 'Atención médica gratuita o de bajo costo',
    location: 'Disponible en cada municipio',
    tags: ['health', 'medical', 'free'],
  },
  {
    type: 'housing',
    name: 'COHEP - Vivienda',
    description: 'Programas de vivienda y emprendimiento',
    location: 'Honduras',
    tags: ['housing', 'entrepreneurship'],
  },
]

export default class DocumentImporter {
  constructor(knowledgeBase, pythonBridge) {
    this.kb = knowledgeBase
    this.py = pythonBridge
  }

  async importFromFile(file, onProgress) {
    const ext = file.name.split('.').pop().toLowerCase()
    onProgress && onProgress(10, `Reading ${file.name}...`)

    let content
    let sourceType

    switch (ext) {
      case 'pdf':
        content = await this._importPdf(file, onProgress)
        sourceType = 'pdf'
        break
      case 'txt':
      case 'csv':
        content = await this._importText(file)
        sourceType = ext
        break
      case 'json':
        content = await this._importJson(file)
        sourceType = 'json'
        break
      default:
        content = await this._importText(file)
        sourceType = ext
    }

    if (!content || content.trim().length < 10) {
      onProgress && onProgress(100, `No content extracted from ${file.name}`)
      return null
    }

    onProgress && onProgress(60, 'Analyzing content...')
    const category = this._categorizeContent(content)
    const summary = this._generateSummary(content, category)

    onProgress && onProgress(80, 'Saving to knowledge base...')
    const doc = await this.kb.addDocument({
      title: file.name.replace(`.${ext}`, ''),
      sourceType,
      content: content.substring(0, 50000),
      summary,
      category,
      metadata: { size: file.size, originalName: file.name },
    })

    onProgress && onProgress(100, `Imported: ${file.name}`)
    return doc
  }

  async importFromUrl(url, onProgress) {
    onProgress && onProgress(10, `Fetching ${url}...`)

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const contentType = response.headers.get('content-type') || ''
      let content = ''

      if (contentType.includes('text/html')) {
        const html = await response.text()
        onProgress && onProgress(40, 'Extracting text from HTML...')
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const article = doc.querySelector('article') || doc.querySelector('main') || doc.body
        content = (article ? article.textContent : doc.body.textContent)
          .replace(/\s+/g, ' ').trim()
      } else if (contentType.includes('application/pdf')) {
        const blob = await response.blob()
        return this.importFromFile(new File([blob], 'web-document.pdf'), onProgress)
      } else {
        content = await response.text()
      }

      if (!content || content.length < 20) {
        onProgress && onProgress(100, 'No usable content found')
        return null
      }

      onProgress && onProgress(60, 'Analyzing content...')
      const category = this._categorizeContent(content)
      const summary = this._generateSummary(content, category)

      onProgress && onProgress(80, 'Saving to knowledge base...')
      const doc = await this.kb.addDocument({
        title: new URL(url).hostname + (new URL(url).pathname.replace(/\/$/, '') || '/'),
        sourceType: 'url',
        content: content.substring(0, 50000),
        summary,
        category,
        metadata: { url, fetchedAt: new Date().toISOString() },
      })

      onProgress && onProgress(100, `Imported from: ${url}`)
      return doc
    } catch (e) {
      onProgress && onProgress(100, `Error: ${e.message}`)
      return null
    }
  }

  async _importPdf(file, onProgress) {
    onProgress && onProgress(30, 'Parsing PDF (Python)...')
    try {
      const buffer = await file.arrayBuffer()
      if (this.py && this.py.ready) {
        const result = await this.py.extractPdfText(buffer)
        if (result.text && result.text.length > 20) return result.text
      }
    } catch (e) {
      console.warn('PDF parsing failed, trying JS fallback:', e)
    }
    return this._fallbackPdfExtract(file)
  }

  async _fallbackPdfExtract(file) {
    const text = await file.text()
    return text.replace(/[^\x20-\x7E\xA0-\xFF\u00F1\u00D1\u00E1-\u00FA\u00C1-\u00DA\u2026]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 50000)
  }

  async _importText(file) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsText(file)
    })
  }

  async _importJson(file) {
    const text = await this._importText(file)
    try {
      const data = JSON.parse(text)
      return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    } catch {
      return text
    }
  }

  _categorizeContent(content) {
    if (!content) return DEFAULT_CATEGORY
    const lower = content.toLowerCase()
    const scores = {}

    for (const [, config] of Object.entries(TEXT_CATEGORIES)) {
      scores[config.category] = 0
      for (const kw of config.keywords) {
        const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        const matches = lower.match(regex)
        if (matches) scores[config.category] += matches.length * 2
      }
      const wordCount = lower.split(/\s+/).length
      scores[config.category] = scores[config.category] / Math.max(1, wordCount / 100)
    }

    let bestCategory = DEFAULT_CATEGORY
    let bestScore = 0
    for (const [cat, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score
        bestCategory = cat
      }
    }

    return bestScore > 0.5 ? bestCategory : DEFAULT_CATEGORY
  }

  _generateSummary(content, category) {
    if (!content) return ''
    const first200 = content.substring(0, 200).replace(/\s+/g, ' ').trim()
    return `[${category}] ${first200}${content.length > 200 ? '...' : ''}`
  }

  async getExtraResources() {
    for (const res of EXTRA_RESOURCES) {
      const existing = await this.kb.getResources(res.type)
      if (!existing.find(r => r.name === res.name)) {
        await this.kb.addResource(res)
      }
    }
  }
}
