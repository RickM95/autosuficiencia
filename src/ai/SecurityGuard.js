const MAX_TEXT_LENGTH = 2000
const MAX_MESSAGE_LENGTH = 5000
const MAX_MESSAGES_STORED = 100
const SANITIZE_PATTERN = /<[^>]*>|javascript:|on\w+\s*=|data:\s*text\/html|vbscript:|expression\s*\(|eval\s*\(/gi

export function sanitizeText(text, maxLength = MAX_TEXT_LENGTH) {
  if (typeof text !== 'string') return ''
  return text
    .replace(SANITIZE_PATTERN, '')
    .trim()
    .substring(0, maxLength)
}

export function sanitizeMessage(content, maxLength = MAX_MESSAGE_LENGTH) {
  return sanitizeText(content, maxLength)
}

export function validateStoredMessages(data) {
  if (!data) return null
  if (!Array.isArray(data)) return null
  if (data.length > MAX_MESSAGES_STORED) data = data.slice(-MAX_MESSAGES_STORED)

  const valid = []
  for (const msg of data) {
    if (!msg || typeof msg !== 'object') continue
    if (msg.role !== 'user' && msg.role !== 'assistant') continue
    if (typeof msg.content !== 'string') continue
    if (msg.content.length > MAX_MESSAGE_LENGTH) continue
    if (!msg.id || typeof msg.id !== 'number') continue
    valid.push({
      role: msg.role,
      content: msg.content.substring(0, MAX_MESSAGE_LENGTH),
      id: msg.id,
    })
  }
  return valid.length > 0 ? valid : null
}

export function validateFormData(formData) {
  if (!formData || typeof formData !== 'object') return { valid: false, errors: ['No form data provided'] }
  const errors = []

  if (typeof formData.name === 'string' && formData.name.trim().length > 200) {
    errors.push('Name exceeds maximum length')
  }

  const numericFields = ['age', 'foodSecurity', 'housingSecurity', 'healthStatus', 'mentalHealth', 'safetyLevel', 'clothingNeeds', 'transportAccess', 'dependents', 'yearsInSituation', 'yearsExperience', 'availableHours']
  for (const field of numericFields) {
    if (formData[field] !== undefined && formData[field] !== '') {
      const val = Number(formData[field])
      if (isNaN(val) || val < 0) {
        errors.push(`${field} must be a non-negative number`)
      }
    }
  }

  if (formData.debts && Array.isArray(formData.debts)) {
    if (formData.debts.length > 50) errors.push('Too many debts (max 50)')
    for (const debt of formData.debts) {
      if (debt.balance && (isNaN(Number(debt.balance)) || Number(debt.balance) < 0)) {
        errors.push('Debt balance must be a non-negative number')
        break
      }
    }
  }

  if (formData.shortTermGoals && Array.isArray(formData.shortTermGoals)) {
    if (formData.shortTermGoals.length > 20) errors.push('Too many short-term goals (max 20)')
  }
  if (formData.mediumTermGoals && Array.isArray(formData.mediumTermGoals)) {
    if (formData.mediumTermGoals.length > 20) errors.push('Too many medium-term goals (max 20)')
  }
  if (formData.longTermGoals && Array.isArray(formData.longTermGoals)) {
    if (formData.longTermGoals.length > 20) errors.push('Too many long-term goals (max 20)')
  }

  return { valid: errors.length === 0, errors }
}

export function checkFormCompleteness(formData) {
  if (!formData) return { complete: false, missing: ['name'], pct: 0 }
  const required = ['name']
  const missing = required.filter(f => !formData[f] || String(formData[f]).trim() === '')
  const pct = required.length > 0 ? Math.round(((required.length - missing.length) / required.length) * 100) : 0
  return { complete: missing.length === 0, missing, pct }
}

export function canAccessPlan(formData) {
  if (!formData) return { allowed: false, reason: 'No form data exists. Complete the self-sufficiency assessment first.' }
  if (!formData.name || !formData.name.trim()) return { allowed: false, reason: 'Name is required before generating a plan.' }
  return { allowed: true, reason: '' }
}

export function canAccessSurvey() {
  return { allowed: true, reason: '' }
}

export function canAccessBudget() {
  return { allowed: true, reason: '' }
}

export function getTabAccessGuard(tab, formData) {
  switch (tab) {
    case 'plan': return canAccessPlan(formData)
    case 'survey': return canAccessSurvey(formData)
    case 'budget': return canAccessBudget(formData)
    default: return { allowed: true, reason: '' }
  }
}

export function sanitizeFormField(field, value) {
  if (typeof value === 'string') return sanitizeText(value, 2000)
  if (typeof value === 'number') return Math.min(Math.max(value, 0), 999999999)
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') return sanitizeText(item, 500)
      if (typeof item === 'object' && item !== null) {
        const cleaned = {}
        for (const [k, v] of Object.entries(item)) {
          cleaned[k] = typeof v === 'string' ? sanitizeText(v, 500) : v
        }
        return cleaned
      }
      return item
    })
  }
  return value
}

export function sanitizeFormData(formData) {
  if (!formData || typeof formData !== 'object') return {}
  const cleaned = {}
  for (const [key, value] of Object.entries(formData)) {
    cleaned[key] = sanitizeFormField(key, value)
  }
  return cleaned
}

export function validateChatMessage(text) {
  if (typeof text !== 'string') return { valid: false, reason: 'Message must be text' }
  if (text.trim().length === 0) return { valid: false, reason: 'Message cannot be empty' }
  if (text.length > MAX_MESSAGE_LENGTH) return { valid: false, reason: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` }
  if (/^[\s\r\n]+$/.test(text)) return { valid: false, reason: 'Message contains only whitespace' }
  return { valid: true, reason: '' }
}

export function sanitizeForDisplay(text) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function validateAndSanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter(m => m && typeof m === 'object' && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({
      role: m.role,
      content: sanitizeMessage(m.content),
      id: typeof m.id === 'number' ? m.id : Date.now() + Math.random(),
    }))
    .slice(-MAX_MESSAGES_STORED)
}
