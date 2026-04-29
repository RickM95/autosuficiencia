/**
 * ✅ SAFE RUNTIME LAYER
 * 
 * Production grade fault isolation system
 * All external operations pass through this layer
 * No unhandled exceptions escape this boundary
 * 
 * THIS IS THE SYSTEM'S FAILURE BOUNDARY.
 * NOTHING OUTSIDE THIS LAYER IS ALLOWED TO CRASH.
 */

export class SafeRuntime {
  constructor() {
    this.failures = []
    this.moduleHealth = {}
  }

  async executeSafe(operation, fallbackValue, operationName = 'unknown') {
    try {
      const result = await operation()
      this.recordSuccess(operationName)
      return result
    } catch (error) {
      this.recordFailure(operationName, error)
      console.warn(`⚠️ SafeRuntime: ${operationName} failed, using fallback`, error.message)
      return fallbackValue
    }
  }

  executeSafeSync(operation, fallbackValue, operationName = 'unknown') {
    try {
      const result = operation()
      this.recordSuccess(operationName)
      return result
    } catch (error) {
      this.recordFailure(operationName, error)
      console.warn(`⚠️ SafeRuntime: ${operationName} failed, using fallback`, error.message)
      return fallbackValue
    }
  }

  async safeFetchJSON(url, options = {}) {
    return this.executeSafe(async () => {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");
      const text = await res.text();

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Non-JSON response at ${url}`);
      }

      return JSON.parse(text);
    }, null, `fetch:${url}`)
  }

  async safeModuleLoad(moduleLoader, fallback = null, moduleName = 'unknown') {
    return this.executeSafe(async () => {
      return await moduleLoader()
    }, fallback, `module:${moduleName}`)
  }

  validateJSON(json, schema = {}) {
    return this.executeSafeSync(() => {
      if (typeof json !== 'object' || json === null) return false
      return true
    }, false, 'json:validation')
  }

  recordSuccess(operationName) {
    this.moduleHealth[operationName] = {
      status: 'healthy',
      lastSuccess: Date.now()
    }
  }

  recordFailure(operationName, error) {
    this.failures.push({
      operation: operationName,
      error: error.message,
      timestamp: Date.now()
    })

    this.moduleHealth[operationName] = {
      status: 'failed',
      lastFailure: Date.now(),
      error: error.message
    }

    // Keep only last 50 failures
    if (this.failures.length > 50) {
      this.failures = this.failures.slice(-30)
    }
  }

  getHealthStatus() {
    return {
      totalFailures: this.failures.length,
      moduleHealth: { ...this.moduleHealth },
      uptime: Date.now() - this.startTime
    }
  }
}

export const safeRuntime = new SafeRuntime()
export default safeRuntime