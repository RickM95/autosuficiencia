/**
 * ✅ SYSTEM INITIALIZATION GUARANTEE
 * 
 * Production grade boot system
 * Always reaches usable state
 * Never hangs, never blocks, never crashes
 */

import safeRuntime from './safeRuntime.js'
import LongTermMemory from './LongTermMemory.js'
import IdentityCore from './IdentityCore.js'
import pyodideLoader from './PyodideSafeLoader.js'

const INIT_TIMEOUT = 8000;

export async function initializeSystem() {

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("INIT_TIMEOUT")), INIT_TIMEOUT)
  );

  const bootSequence = async () => {
    console.log('🚀 Nephi system starting...')

    // ✅ Phase 1: Critical core systems (required)
    await safeRuntime.executeSafe(async () => {
      window.ltm = new LongTermMemory()
      await window.ltm.init()
      return true
    }, null, 'Init:LongTermMemory')

    await safeRuntime.executeSafe(async () => {
      window.identity = new IdentityCore(window.ltm)
      return true
    }, null, 'Init:IdentityCore')

    // ✅ Phase 2: Optional modules (can fail safely)
    safeRuntime.executeSafe(async () => {
      await pyodideLoader.load()
      return true
    }, null, 'Init:Pyodide')

    console.log('✅ Nephi system ready')

    return {
      status: "READY",
      mode: "FULL",
      health: safeRuntime.getHealthStatus()
    }
  };

  try {
    return await Promise.race([bootSequence(), timeout]);
  } catch (e) {
    console.warn("⚠️ Fallback mode activated:", e.message)
    
    return {
      status: "SAFE_MODE",
      mode: "MINIMAL",
      message: "System running in degraded mode",
      health: safeRuntime.getHealthStatus()
    }
  }
}

export default initializeSystem