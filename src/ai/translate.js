export function t(es, en, lang) {
  return lang === 'en' ? en : es
}

export function tTemplate(templates, lang) {
  return lang === 'en' ? templates.en : templates.es
}

export function fmtMoney(amount, lang) {
  const num = parseFloat(amount) || 0
  if (lang === 'es') {
    return `L ${num.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
