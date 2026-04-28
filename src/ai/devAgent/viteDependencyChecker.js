export class ViteDependencyChecker {
  constructor() {
    this.knownViteIncompatible = [
      'fs', 'path', 'os', 'crypto', 'child_process', 'net', 'tls', 'dgram',
      'http2', 'cluster', 'worker_threads', 'perf_hooks', 'async_hooks',
    ]
    this.knownNodeBuiltins = [
      'node:fs', 'node:path', 'node:os', 'node:crypto', 'node:child_process',
      'node:net', 'node:tls', 'node:dgram', 'node:http2', 'node:cluster',
      'node:worker_threads', 'node:perf_hooks', 'node:async_hooks',
    ]
  }

  check(scanResult) {
    if (!scanResult) return { compatible: true, warnings: [], incompatible: [] }

    const warnings = []
    const incompatible = []

    for (const imp of (scanResult.externalImports || [])) {
      if (this.knownNodeBuiltins.includes(imp) || this.knownViteIncompatible.includes(imp)) {
        warnings.push({
          package: imp,
          issue: 'NODE_BUILTIN',
          detail: `${imp} is a Node.js built-in module — it will be externalized by Vite and unavailable in browser`,
          severity: 'high',
        })
        incompatible.push(imp)
        continue
      }

      if (imp === 'pyodide') {
        warnings.push({
          package: imp,
          issue: 'VITE_EXTERNAL',
          detail: 'pyodide imports Node.js built-ins (fs, path, url, crypto) — Vite externalizes these, handled at runtime',
          severity: 'medium',
        })
      }
    }

    const cjsPatterns = ['require(', 'module.exports', 'commonjs']
    const allContent = scanResult.rawContent || ''
    if (allContent && cjsPatterns.some(p => allContent.includes(p))) {
      warnings.push({
        issue: 'CJS_DETECTED',
        detail: 'CommonJS module syntax detected — may cause ESM/CJS conflicts with Vite',
        severity: 'medium',
      })
    }

    return {
      compatible: incompatible.length === 0,
      warnings,
      incompatible,
      summary: incompatible.length > 0
        ? `${incompatible.length} incompatible module(s) detected — these will not work in browser environment`
        : warnings.length > 0
          ? `${warnings.length} Vite compatibility warning(s)`
          : 'All dependencies appear Vite-compatible',
    }
  }

  isNodeBuiltin(name) {
    return this.knownNodeBuiltins.includes(name) || this.knownViteIncompatible.includes(name)
  }
}
