/**
 * ✅ LONG TERM MEMORY SYSTEM
 * 
 * Persistent IndexedDB backed memory storage
 * Survives page refreshes, browser restarts
 * Provides long term user context and continuity
 * 
 * PRIMARY STORAGE: IndexedDB
 * FALLBACK: localStorage
 */

export class LongTermMemory {
  constructor() {
    this.DB_NAME = 'Nephi_LTM'
    this.DB_VERSION = 1
    this.db = null
    this.ready = false
  }

  async init() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

        request.onupgradeneeded = (event) => {
          const db = event.target.result

          if (!db.objectStoreNames.contains('events')) {
            const eventStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true })
            eventStore.createIndex('type', 'type', { unique: false })
            eventStore.createIndex('timestamp', 'timestamp', { unique: false })
          }

          if (!db.objectStoreNames.contains('profile')) {
            db.createObjectStore('profile', { keyPath: 'key' })
          }
        }

        request.onsuccess = (event) => {
          this.db = event.target.result
          this.ready = true
          resolve()
        }

        request.onerror = () => {
          console.warn('⚠️ IndexedDB not available, using localStorage fallback')
          this._useLocalStorage = true
          this.ready = true
          resolve()
        }

      } catch (e) {
        console.warn('⚠️ LTM falling back to localStorage:', e.message)
        this._useLocalStorage = true
        this.ready = true
        resolve()
      }
    })
  }

  async saveEvent(type, data, context = {}) {
    if (!this.ready) await this.init()

    const event = {
      type,
      data,
      context,
      timestamp: Date.now()
    }

    if (this._useLocalStorage) {
      const events = JSON.parse(localStorage.getItem('ltm_events') || '[]')
      event.id = Date.now()
      events.push(event)
      localStorage.setItem('ltm_events', JSON.stringify(events.slice(-200)))
      return event
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('events', 'readwrite')
      const store = tx.objectStore('events')
      const request = store.add(event)
      request.onsuccess = () => resolve(event)
    })
  }

  async getRecentEvents(limit = 20) {
    if (!this.ready) await this.init()

    if (this._useLocalStorage) {
      const events = JSON.parse(localStorage.getItem('ltm_events') || '[]')
      return events.slice(-limit).reverse()
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('events', 'readonly')
      const store = tx.objectStore('events')
      const index = store.index('timestamp')
      const request = index.openCursor(null, 'prev')

      const events = []

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor && events.length < limit) {
          events.push(cursor.value)
          cursor.continue()
        } else {
          resolve(events)
        }
      }
    })
  }

  async getMemoryContext() {
    const recentEvents = await this.getRecentEvents(15)

    return {
      recurringPatterns: this._detectPatterns(recentEvents),
      emotionalTrends: this._getEmotionalTrend(recentEvents),
      summary: this._generateSummary(recentEvents)
    }
  }

  _detectPatterns(events) {
    const patterns = {}

    events.forEach(e => {
      if (e.type === 'emotional_state') {
        const state = e.data.state
        patterns[state] = (patterns[state] || 0) + 1
      }
    })

    return Object.entries(patterns)
      .filter(([k, v]) => v >= 2)
      .map(([state, count]) => ({ state, count }))
  }

  _getEmotionalTrend(events) {
    const emotionalEvents = events.filter(e => e.type === 'emotional_state')
    if (emotionalEvents.length < 3) return null

    return {
      averageIntensity: emotionalEvents.reduce((sum, e) => sum + (e.data.intensity || 0), 0) / emotionalEvents.length,
      trend: 'stable'
    }
  }

  _generateSummary(events) {
    const summary = {
      totalInteractions: events.length,
      emotionalStates: this._detectPatterns(events)
    }

    return summary
  }

  async close() {
    if (this.db) this.db.close()
  }
}

export default LongTermMemory