import { openDB } from 'idb'

/**
 * progressTracker.js
 * Tracks user data capture and ensures no duplicate questions.
 */

const DB_NAME = 'nephi_progress'
const STORE_NAME = 'state'

export class ProgressTracker {
  constructor() {
    this.state = {
      hasDebt: false,
      hasIncome: false,
      hasEmployment: false,
      hasGoal: false,
      lastIntent: "",
      capturedFields: []
    }
    this.dbPromise = this.initDB()
  }

  async initDB() {
    if (typeof indexedDB === 'undefined') {
      console.warn("IndexedDB not available. Using memory-only progress tracking.")
      return null
    }
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }

  async loadState() {
    try {
      const db = await this.dbPromise
      if (!db) return this.state
      const saved = await db.get(STORE_NAME, 'current_state')
      if (saved) {
        this.state = { ...this.state, ...saved }
      }
    } catch (e) {
      console.warn("Failed to load state from IDB:", e)
    }
    return this.state
  }

  async updateState(fusion, intent) {
    let changed = false

    if (fusion.domains.financial.detected && !this.state.hasDebt) {
      // For now, any financial mention with debt keywords counts as hasDebt
      // In a real system, we'd check if they confirmed they HAVE debt.
      this.state.hasDebt = true
      this.state.capturedFields.push('debt')
      changed = true
    }

    if (fusion.domains.financial.detected && !this.state.hasIncome) {
      // Logic for income detection
    }

    if (intent === 'employment' && !this.state.hasEmployment) {
      this.state.hasEmployment = true
      this.state.capturedFields.push('employment')
      changed = true
    }

    if (intent === 'goals' && !this.state.hasGoal) {
      this.state.hasGoal = true
      this.state.capturedFields.push('goal')
      changed = true
    }

    this.state.lastIntent = intent

    if (changed) {
      await this.saveState()
    }

    return this.state
  }

  async saveState() {
    try {
      const db = await this.dbPromise
      if (!db) return
      await db.put(STORE_NAME, this.state, 'current_state')
    } catch (e) {
      console.warn("Failed to save state to IDB:", e)
    }
  }

  isCaptured(field) {
    return this.state.capturedFields.includes(field)
  }

  getMissingFields() {
    const all = ['income', 'debt', 'employment', 'goal']
    return all.filter(f => !this.isCaptured(f))
  }
}

export const progressTracker = new ProgressTracker()
