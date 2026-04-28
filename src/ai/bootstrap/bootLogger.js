const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }
let _currentLevel = LOG_LEVELS.DEBUG
let _logHistory = []
const MAX_HISTORY = 200

export function setLogLevel(level) {
  if (typeof level === 'number') _currentLevel = level
  else _currentLevel = LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.INFO
}

function _log(level, module, message, data) {
  if (level < _currentLevel) return
  const entry = {
    timestamp: Date.now(),
    iso: new Date().toISOString(),
    level: Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === level) || 'UNKNOWN',
    module,
    message,
    data: data || null,
  }
  _logHistory.push(entry)
  if (_logHistory.length > MAX_HISTORY) _logHistory.shift()

  const prefix = `[${entry.iso}] [${entry.level}] [${module}]`
  if (level >= LOG_LEVELS.ERROR) console.error(prefix, message, data || '')
  else if (level >= LOG_LEVELS.WARN) console.warn(prefix, message, data || '')
  else console.log(prefix, message, data || '')
}

export const bootLog = {
  debug: (module, msg, data) => _log(LOG_LEVELS.DEBUG, module, msg, data),
  info: (module, msg, data) => _log(LOG_LEVELS.INFO, module, msg, data),
  warn: (module, msg, data) => _log(LOG_LEVELS.WARN, module, msg, data),
  error: (module, msg, data) => _log(LOG_LEVELS.ERROR, module, msg, data),
  stage: (stageId, status, msg) => _log(LOG_LEVELS.INFO, `Stage:${stageId}`, `[${status}] ${msg}`),
}

export function getLogHistory() {
  return [..._logHistory]
}

export function getLogsByModule(module) {
  return _logHistory.filter(e => e.module === module || e.module.includes(module))
}

export function getLogsByLevel(level) {
  const numericLevel = typeof level === 'number' ? level : LOG_LEVELS[level]
  return _logHistory.filter(e => e.level >= numericLevel)
}

export function clearLogs() {
  _logHistory = []
}

export function getLogSummary() {
  const errors = _logHistory.filter(e => e.level === 'ERROR').length
  const warnings = _logHistory.filter(e => e.level === 'WARN').length
  const total = _logHistory.length
  return { total, errors, warnings, from: _logHistory[0]?.iso || null, to: _logHistory[_logHistory.length - 1]?.iso || null }
}
