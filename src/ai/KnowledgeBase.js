const DB_NAME = 'AutosuficienciaKB'
const DB_VERSION = 2
const STORES = ['documents', 'resources', 'templates', 'learned']

export default class KnowledgeBase {
  constructor() {
    this.db = null
    this.ready = false
    this._useMemoryFallback = false
    this._memoryStore = new Map()
  }

  async init() {
    return new Promise((resolve) => {
      const isIndexedDBAvailable = typeof self !== 'undefined' && self.indexedDB;
      
      if (!isIndexedDBAvailable) {
        console.warn('IndexedDB not available — using Memory Map fallback');
        this._useMemoryFallback = true;
        this._memoryStore = new Map();
        this.ready = true;
        resolve();
        return;
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
        this._useMemoryFallback = true
        this._memoryStore = new Map()
        this.ready = true
        resolve()
      }
    })
  }

  _getStore(storeName, mode = 'readonly') {
    if (this._useMemoryFallback || !this.db) return null
    try {
      const transaction = this.db.transaction(storeName, mode)
      return transaction.objectStore(storeName)
    } catch (e) {
      console.warn('KB storage error:', e.message)
      this._useMemoryFallback = true
      this._memoryStore = new Map()
      return null
    }
  }

  _getAllMemory(store) {
    if (!this._memoryStore) this._memoryStore = new Map()
    return this._memoryStore.get(store) || []
  }

  _saveAllMemory(store, data) {
    if (!this._memoryStore) this._memoryStore = new Map()
    this._memoryStore.set(store, data)
  }

  async addDocument(doc) {
    const entry = {
      ...doc,
      dateImported: new Date().toISOString(),
      summary: doc.summary || '',
      category: doc.category || 'uncategorized',
    }

    if (this._useMemoryFallback) {
      const items = this._getAllMemory('documents')
      entry.id = Date.now()
      items.push(entry)
      this._saveAllMemory('documents', items)
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
    if (this._useMemoryFallback) {
      return this._getAllMemory('documents')
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
    if (this._useMemoryFallback) {
      const items = this._getAllMemory('documents')
      this._saveAllMemory('documents', items.filter(d => d.id !== id))
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

  async addResource(resource) {
    const entry = { ...resource, dateAdded: new Date().toISOString() }
    if (this._useMemoryFallback) {
      const items = this._getAllMemory('resources')
      entry.id = Date.now()
      items.push(entry)
      this._saveAllMemory('resources', items)
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
    if (this._useMemoryFallback) {
      const all = this._getAllMemory('resources')
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

  async addTemplate(template) {
    const entry = { ...template, dateAdded: new Date().toISOString() }
    if (this._useMemoryFallback) {
      const items = this._getAllMemory('templates')
      entry.id = Date.now()
      items.push(entry)
      this._saveAllMemory('templates', items)
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
    if (this._useMemoryFallback) return this._getAllMemory('templates')
    return new Promise((resolve, reject) => {
      const store = this._getStore('templates')
      if (!store) return resolve([])
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async addLearnedPattern(pattern, response, source = '') {
    const entry = { pattern, response, source, dateAdded: new Date().toISOString(), confidence: 1 }
    if (this._useMemoryFallback) {
      const items = this._getAllMemory('learned')
      entry.id = Date.now()
      const existing = items.findIndex(i => i.pattern === pattern)
      if (existing >= 0) {
        items[existing].confidence++
        items[existing].response = response
      } else {
        items.push(entry)
      }
      this._saveAllMemory('learned', items)
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
    const all = this._useMemoryFallback ? this._getAllMemory('learned') : await this.getLearned()
    const q = query.toLowerCase()
    return all
      .filter(l => l.pattern.toLowerCase().includes(q))
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }

  async getLearned() {
    if (this._useMemoryFallback) return this._getAllMemory('learned')
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
