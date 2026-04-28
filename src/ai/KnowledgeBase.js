const DB_NAME = 'AutosuficienciaKB'
const DB_VERSION = 2
const STORES = ['documents', 'resources', 'templates', 'learned']

export default class KnowledgeBase {
  constructor() {
    this.db = null
    this.ready = false
  }

  async init() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not available — will use localStorage fallback')
        this._useLocalStorage = true
        this.ready = true
        resolve()
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            const objectStore = db.createObjectStore(store, { keyPath: 'id', autoIncrement: true })
            if (store === 'documents') {
              objectStore.createIndex('category', 'category', { unique: false })
              objectStore.createIndex('sourceType', 'sourceType', { unique: false })
              objectStore.createIndex('dateImported', 'dateImported', { unique: false })
            }
            if (store === 'resources') {
              objectStore.createIndex('type', 'type', { unique: false })
              objectStore.createIndex('location', 'location', { unique: false })
            }
            if (store === 'learned') {
              objectStore.createIndex('pattern', 'pattern', { unique: false })
            }
          }
        }
        if (event.oldVersion < 2) {
          const learnedStore = event.target.transaction.objectStore('learned')
          if (!learnedStore.indexNames.contains('pattern')) {
            learnedStore.createIndex('pattern', 'pattern', { unique: false })
          }
        }
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        this.ready = true
        resolve()
      }

      request.onerror = (event) => {
        console.warn('IndexedDB error:', event.target.error)
        this._useLocalStorage = true
        this.ready = true
        resolve()
      }
    })
  }

  _getStore(storeName, mode = 'readonly') {
    if (this._useLocalStorage) return null
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  _lsKey(store) {
    return `kb_${store}`
  }

  _getAllLS(store) {
    try {
      const data = localStorage.getItem(this._lsKey(store))
      return data ? JSON.parse(data) : []
    } catch { return [] }
  }

  _saveAllLS(store, data) {
    try {
      localStorage.setItem(this._lsKey(store), JSON.stringify(data))
    } catch (e) {
      console.warn(`Failed to save ${store} to localStorage:`, e)
    }
  }

  // ─── Documents ─────────────────────────────────────────────────
  async addDocument(doc) {
    const entry = {
      ...doc,
      dateImported: new Date().toISOString(),
      summary: doc.summary || '',
      category: doc.category || 'uncategorized',
    }

    if (this._useLocalStorage) {
      const items = this._getAllLS('documents')
      entry.id = Date.now()
      items.push(entry)
      this._saveAllLS('documents', items)
      return entry
    }

    return new Promise((resolve, reject) => {
      const store = this._getStore('documents', 'readwrite')
      if (!store) return resolve(null)
      const request = store.add(entry)
      request.onsuccess = () => resolve(entry)
      request.onerror = () => reject(request.error)
    })
  }

  async getDocuments() {
    if (this._useLocalStorage) {
      return this._getAllLS('documents')
    }
    return new Promise((resolve, reject) => {
      const store = this._getStore('documents')
      if (!store) return resolve([])
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDocument(id) {
    if (this._useLocalStorage) {
      const items = this._getAllLS('documents')
      this._saveAllLS('documents', items.filter(d => d.id !== id))
      return
    }
    return new Promise((resolve, reject) => {
      const store = this._getStore('documents', 'readwrite')
      if (!store) return resolve()
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async searchDocuments(query) {
    const docs = await this.getDocuments()
    const q = query.toLowerCase()
    return docs.filter(d =>
      (d.title || '').toLowerCase().includes(q) ||
      (d.content || '').toLowerCase().includes(q) ||
      (d.summary || '').toLowerCase().includes(q) ||
      (d.category || '').toLowerCase().includes(q)
    )
  }

  // ─── Resources ──────────────────────────────────────────────────
  async addResource(resource) {
    const entry = { ...resource, dateAdded: new Date().toISOString() }
    if (this._useLocalStorage) {
      const items = this._getAllLS('resources')
      entry.id = Date.now()
      items.push(entry)
      this._saveAllLS('resources', items)
      return entry
    }
    return new Promise((resolve, reject) => {
      const store = this._getStore('resources', 'readwrite')
      if (!store) return resolve(null)
      const request = store.add(entry)
      request.onsuccess = () => resolve(entry)
      request.onerror = () => reject(request.error)
    })
  }

  async getResources(type) {
    if (this._useLocalStorage) {
      const all = this._getAllLS('resources')
      return type ? all.filter(r => r.type === type) : all
    }
    return new Promise((resolve, reject) => {
      const store = this._getStore('resources')
      if (!store) return resolve([])
      if (type) {
        const request = store.index('type').getAll(type)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } else {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    })
  }

  async getResourcesByNeed(needType) {
    const resources = await this.getResources()
    return resources.filter(r =>
      (r.services || '').toLowerCase().includes(needType.toLowerCase()) ||
      (r.tags || []).some(t => t.toLowerCase() === needType.toLowerCase())
    )
  }

  // ─── Templates ──────────────────────────────────────────────────
  async addTemplate(template) {
    const entry = { ...template, dateAdded: new Date().toISOString() }
    if (this._useLocalStorage) {
      const items = this._getAllLS('templates')
      entry.id = Date.now()
      items.push(entry)
      this._saveAllLS('templates', items)
      return entry
    }
    return new Promise((resolve, reject) => {
      const store = this._getStore('templates', 'readwrite')
      if (!store) return resolve(null)
      const request = store.add(entry)
      request.onsuccess = () => resolve(entry)
      request.onerror = () => reject(request.error)
    })
  }

  async getTemplate(name) {
    const templates = await this.getTemplates()
    return templates.find(t => t.name === name) || null
  }

  async getTemplates() {
    if (this._useLocalStorage) return this._getAllLS('templates')
    return new Promise((resolve, reject) => {
      const store = this._getStore('templates')
      if (!store) return resolve([])
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // ─── Learned Patterns ───────────────────────────────────────────
  async addLearnedPattern(pattern, response, source = '') {
    const entry = { pattern, response, source, dateAdded: new Date().toISOString(), confidence: 1 }
    if (this._useLocalStorage) {
      const items = this._getAllLS('learned')
      entry.id = Date.now()
      const existing = items.findIndex(i => i.pattern === pattern)
      if (existing >= 0) {
        items[existing].confidence++
        items[existing].response = response
      } else {
        items.push(entry)
      }
      this._saveAllLS('learned', items)
      return
    }
    return new Promise((resolve) => {
      const store = this._getStore('learned', 'readwrite')
      if (!store) return resolve()
      store.index('pattern').get(pattern).onsuccess = (e) => {
        if (e.target.result) {
          const existing = e.target.result
          existing.confidence++
          existing.response = response
          store.put(existing)
        } else {
          store.add(entry)
        }
      }
    })
  }

  async searchLearned(query) {
    const all = this._useLocalStorage ? this._getAllLS('learned') : await this.getLearned()
    const q = query.toLowerCase()
    return all
      .filter(l => l.pattern.toLowerCase().includes(q))
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }

  async getLearned() {
    if (this._useLocalStorage) return this._getAllLS('learned')
    return new Promise((resolve, reject) => {
      const store = this._getStore('learned')
      if (!store) return resolve([])
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getStats() {
    const docs = await this.getDocuments()
    const resources = await this.getResources()
    const templates = await this.getTemplates()
    const learned = await this.getLearned()
    return {
      documentCount: docs.length,
      resourceCount: resources.length,
      templateCount: templates.length,
      patternCount: learned.length,
    }
  }
}
