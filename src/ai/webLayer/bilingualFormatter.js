export class BilingualFormatter {
  constructor() {
    this.translationOverrides = {
      'emergency fund': { es: 'fondo de emergencia' },
      'debt snowball': { es: 'método bola de nieve' },
      'budget deficit': { es: 'déficit presupuestario' },
      'self-sufficiency': { es: 'autosuficiencia' },
      'SMART goals': { es: 'metas SMART' },
      'knowledge base': { es: 'base de conocimiento' },
    }
  }

  formatBilingual(content, sourceLanguage = 'en') {
    if (!content) return { en: '', es: '' }
    if (sourceLanguage === 'en') {
      return { en: content, es: this._translateToSpanish(content) }
    }
    return { en: this._translateToEnglish(content), es: content }
  }

  formatWebResult(processed, query) {
    const summary = processed.summary || ''
    const keyPoints = processed.keyPoints || []
    const sources = processed.sources || []

    const enParts = [
      `**Web Search Results:** "${query}"`,
      '',
      summary ? `**Summary:** ${summary}` : '',
      '',
      keyPoints.length > 0 ? '**Key Points:**' : '',
      ...keyPoints.map((p, i) => `${i + 1}. ${p}`),
      '',
      sources.length > 0 ? '**Sources:**' : '',
      ...sources.map(s => `- [${s.title}](${s.url})`),
    ].filter(Boolean).join('\n')

    const summaryEs = this._translateToSpanish(summary)
    const keyPointsEs = keyPoints.map(p => this._translateToSpanish(p))

    const esParts = [
      `**Resultados de búsqueda web:** "${query}"`,
      '',
      summaryEs ? `**Resumen:** ${summaryEs}` : '',
      '',
      keyPointsEs.length > 0 ? '**Puntos clave:**' : '',
      ...keyPointsEs.map((p, i) => `${i + 1}. ${p}`),
      '',
      sources.length > 0 ? '**Fuentes:**' : '',
      ...sources.map(s => `- ${s.title}`),
    ].filter(Boolean).join('\n')

    return { en: enParts, es: esParts }
  }

  _translateToSpanish(text) {
    if (!text) return ''
    let result = text
    for (const [en, { es }] of Object.entries(this.translationOverrides)) {
      const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      result = result.replace(regex, (match) => {
        return match === match.toUpperCase() ? es.toUpperCase()
          : match[0] === match[0].toUpperCase() ? es.charAt(0).toUpperCase() + es.slice(1)
          : es
      })
    }
    result = result
      .replace(/\bSummary\b/g, 'Resumen')
      .replace(/\bKey Points\b/g, 'Puntos clave')
      .replace(/\bSources\b/g, 'Fuentes')
      .replace(/\bResults\b/g, 'Resultados')
      .replace(/\bSearch\b/g, 'Busqueda')
      .replace(/\binformation\b/g, 'informacion')
      .replace(/\bexample\b/g, 'ejemplo')
      .replace(/\bimportant\b/g, 'importante')
      .replace(/\bpriority\b/g, 'prioridad')
      .replace(/\bbalance\b/g, 'balance')
      .replace(/\bincome\b/g, 'ingresos')
      .replace(/\bexpenses\b/g, 'gastos')
      .replace(/\bsavings\b/g, 'ahorros')
      .replace(/\bdebt\b/g, 'deuda')
      .replace(/\bbudget\b/g, 'presupuesto')
      .replace(/\bgoal\b/g, 'meta')
      .replace(/\bgoals\b/g, 'metas')
      .replace(/\bplan\b/g, 'plan')
      .replace(/\bneeds\b/g, 'necesidades')
    return result
  }

  _translateToEnglish(text) {
    if (!text) return ''
    return text
      .replace(/\bResumen\b/g, 'Summary')
      .replace(/\bPuntos clave\b/g, 'Key Points')
      .replace(/\bFuentes\b/g, 'Sources')
      .replace(/\bResultados\b/g, 'Results')
      .replace(/\bBusqueda\b/g, 'Search')
      .replace(/\binformacion\b/g, 'information')
      .replace(/\bejemplo\b/g, 'example')
      .replace(/\bimportante\b/g, 'important')
      .replace(/\bprioridad\b/g, 'priority')
      .replace(/\bingresos\b/g, 'income')
      .replace(/\bgastos\b/g, 'expenses')
      .replace(/\bahorros\b/g, 'savings')
      .replace(/\bdeuda\b/g, 'debt')
      .replace(/\bpresupuesto\b/g, 'budget')
      .replace(/\bmeta\b/g, 'goal')
      .replace(/\bmetas\b/g, 'goals')
      .replace(/\bnecesidades\b/g, 'needs')
  }
}
