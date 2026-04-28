import masterIndex from './index/master_index.json'
import financesCore from './core/finances.json'
import wellbeingCore from './core/wellbeing.json'
import goalsCore from './core/goals.json'
import primaryRules from './rules/rules.json'
import secondaryRules from './rules/overrides.json'
import planSchema from './schemas/plan.json'
import planTemplateSingle from './templates/plan_template.json'
import planTemplatesMulti from './templates/plan_templates.json'
import ingestionRules from './ingestion/extraction_rules.json'

import { validateAll } from './validator.js'
import { buildIndexes } from './indexBuilder.js'

const DOMAINS = {
  finances: financesCore,
  wellbeing: wellbeingCore,
  goals: goalsCore,
}

const RULES = [
  ...(primaryRules.rules || []),
  ...(secondaryRules.rules || []),
]

const SCHEMAS = {
  plan: planSchema,
}

const TEMPLATES = {
  plan_single: planTemplateSingle,
  plan_multi: planTemplatesMulti,
}

const INGESTION = {
  extraction: ingestionRules,
}

let _initialized = false
let _initResult = null
let _indexes = null
let _kbInIndexedDB = false

const INDEXEDDB_NAME = 'KB_Storage'
const INDEXEDDB_VERSION = 1

export async function initializeKB(debugMode = false) {
  if (_initialized) return _initResult

  console.log('[KB Loader] Initializing Knowledge Base...')

  const kbData = { domains: DOMAINS, masterIndex, rules: RULES, schemas: SCHEMAS }
  const validationResult = validateAll(kbData)

  if (!validationResult.valid) {
    console.error('[KB Loader] ⛔ KNOWLEDGE BASE VALIDATION FAILED')
    console.error(`[KB Loader] Errors (${validationResult.errors.length}):`)
    for (const err of validationResult.errors) console.error(`  ❌ ${err}`)
    if (validationResult.warnings.length > 0) {
      console.warn(`[KB Loader] Warnings (${validationResult.warnings.length}):`)
      for (const w of validationResult.warnings) console.warn(`  ⚠️  ${w}`)
    }
    _initResult = {
      success: false,
      validation: validationResult,
      message: 'KB validation failed — system cannot start without valid knowledge base',
    }
    if (debugMode) {
      console.warn('[KB Loader] DEBUG MODE: Allowing degraded operation despite validation failure')
      _initialized = true
      _indexes = buildIndexes({ domains: DOMAINS, masterIndex, rules: RULES })
      _initResult.success = true
      _initResult.indexes = _indexes
      _initResult.debugMode = true
      _initResult.message = 'KB loaded in DEBUG mode — validation errors exist'
    }
    return _initResult
  }

  if (validationResult.warnings.length > 0) {
    console.warn('[KB Loader] Validation passed with warnings:')
    for (const w of validationResult.warnings) console.warn(`  ⚠️  ${w}`)
  }

  console.log('[KB Loader] Building lookup indexes...')
  _indexes = buildIndexes({ domains: DOMAINS, masterIndex, rules: RULES })

  console.log('[KB Loader] Storing KB in IndexedDB...')
  try {
    await storeKBInIndexedDB({ domains: DOMAINS, masterIndex, rules: RULES, schemas: SCHEMAS, templates: TEMPLATES, ingestion: INGESTION })
    _kbInIndexedDB = true
    console.log('[KB Loader] IndexedDB storage complete')
  } catch (e) {
    console.warn('[KB Loader] IndexedDB storage failed (non-fatal):', e.message)
  }

  _initialized = true
  _initResult = { success: true, validation: validationResult, indexes: _indexes, indexedDB: _kbInIndexedDB, message: 'KB initialized successfully' }

  console.log(`[KB Loader] KB ready: ${Object.keys(DOMAINS).length} domains, ${_indexes.actionCount} actions, ${RULES.length} rules, ${_kbInIndexedDB ? 'IndexedDB backed' : 'memory only'}`)
  return _initResult
}

export function loadKBFiles() {
  return { domains: DOMAINS, masterIndex, rules: RULES, schemas: SCHEMAS, templates: TEMPLATES, ingestion: INGESTION }
}

async function storeKBInIndexedDB(kbData) {
  return new Promise((resolve) => {
    if (!window.indexedDB) { resolve(); return }

    const request = indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('kvs')) {
        db.createObjectStore('kvs', { keyPath: 'key' })
      }
    }

    request.onsuccess = (event) => {
      const db = event.target.result
      const tx = db.transaction('kvs', 'readwrite')
      const store = tx.objectStore('kvs')

      const entries = [
        { key: 'domains', value: kbData.domains },
        { key: 'masterIndex', value: kbData.masterIndex },
        { key: 'rules', value: kbData.rules },
        { key: 'schemas', value: kbData.schemas },
        { key: 'templates', value: kbData.templates },
        { key: 'ingestion', value: kbData.ingestion },
        { key: 'indexes', value: _indexes },
        { key: 'meta', value: { storedAt: Date.now(), version: INDEXEDDB_VERSION, domainCount: Object.keys(kbData.domains).length } },
      ]

      let completed = 0
      for (const entry of entries) {
        const req = store.put(entry)
        req.onsuccess = () => { completed++; if (completed === entries.length) { db.close(); resolve() } }
        req.onerror = () => { completed++; if (completed === entries.length) { db.close(); resolve() } }
      }
    }

    request.onerror = () => { resolve() }
  })
}

export async function storeKB() {
  if (_kbInIndexedDB) return { cached: true }
  await storeKBInIndexedDB({ domains: DOMAINS, masterIndex, rules: RULES, schemas: SCHEMAS, templates: TEMPLATES, ingestion: INGESTION })
  _kbInIndexedDB = true
  return { cached: true }
}

export async function loadKBFromIndexedDB() {
  if (!window.indexedDB) return null
  return new Promise((resolve) => {
    const request = indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION)
    request.onsuccess = (event) => {
      const db = event.target.result
      const tx = db.transaction('kvs', 'readonly')
      const store = tx.objectStore('kvs')
      const getReq = store.getAll()
      getReq.onsuccess = () => {
        const result = {}
        for (const entry of getReq.result) result[entry.key] = entry.value
        db.close()
        resolve(result)
      }
      getReq.onerror = () => { db.close(); resolve(null) }
    }
    request.onerror = () => resolve(null)
  })
}

export function getKBStatus() {
  return { initialized: _initialized, result: _initResult, indexes: _indexes, inIndexedDB: _kbInIndexedDB }
}

export function getIndexes() { return _indexes }
export function isKBReady() { return _initialized && _initResult && _initResult.success }

export function resetKB() {
  _initialized = false; _initResult = null; _indexes = null; _kbInIndexedDB = false
}

export function getDomains() { return DOMAINS }
export function getMasterIndex() { return masterIndex }
export function getRules() { return RULES }
export function getSchemas() { return SCHEMAS }
export function getTemplates() { return TEMPLATES }
export function getIngestionRules() { return INGESTION }
export function isIndexedDBReady() { return _kbInIndexedDB }
