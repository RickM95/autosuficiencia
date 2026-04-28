export class CodeInspector {
  constructor() {
    this.virtualRegistry = {}
  }

  loadModule(name, mod) {
    if (!mod) return
    this.virtualRegistry[name] = {
      exports: mod.exports || this._inferExports(mod.content || ''),
      imports: mod.imports || this._inferImports(mod.content || ''),
      dependencies: mod.dependencies || this._inferDependencies(mod.imports || []),
      content: mod.content || '',
      size: mod.content ? mod.content.split('\n').length : (mod.lines || 0),
    }
  }

  loadRegistry(modules) {
    if (!modules) return
    for (const [name, mod] of Object.entries(modules)) {
      this.loadModule(name, mod)
    }
  }

  scan() {
    return { ...this.virtualRegistry }
  }

  getModule(name) {
    return this.virtualRegistry[name] || null
  }

  buildDependencyGraph() {
    const graph = {}
    for (const [name, mod] of Object.entries(this.virtualRegistry)) {
      graph[name] = mod.imports || []
    }
    return graph
  }

  findUnusedCode() {
    const exported = new Set()
    const imported = new Set()
    const warnings = []

    for (const mod of Object.values(this.virtualRegistry)) {
      if (mod.exports) for (const e of mod.exports) exported.add(e)
      if (mod.imports) for (const i of mod.imports) {
        const name = i.split('/').pop().replace(/\.js$/, '')
        imported.add(name)
      }
    }

    for (const [name, mod] of Object.entries(this.virtualRegistry)) {
      if (mod.exports && mod.exports.length === 0 && !name.includes('index')) {
        const isImported = [...imported].some(i => name.includes(i) || i.includes(name))
        if (!isImported) {
          warnings.push({ type: 'orphan_module', module: name, reason: 'No exports and not imported elsewhere' })
        }
      }
    }

    return warnings
  }

  getModuleMap() {
    const map = {}
    for (const [name, mod] of Object.entries(this.virtualRegistry)) {
      map[name] = {
        exports: mod.exports,
        imports: mod.imports,
        size: mod.size,
        depCount: mod.dependencies.length,
      }
    }
    return map
  }

  _inferExports(content) {
    const exports = []
    const expMatch = content.match(/export\s+(?:default\s+|const\s+|function\s+|class\s+)?(\w+)/g)
    if (expMatch) {
      for (const m of expMatch) {
        const name = m.replace(/export\s+(?:default\s+|const\s+|function\s+|class\s+)?/, '')
        if (name && !exports.includes(name)) exports.push(name)
      }
    }
    return exports
  }

  _inferImports(content) {
    const imports = []
    const impMatch = content.match(/from\s+['"]([^'"]+)['"]/g)
    if (impMatch) {
      for (const m of impMatch) {
        const path = m.replace(/from\s+['"]|['"]/g, '')
        if (path && !imports.includes(path)) imports.push(path)
      }
    }
    return imports
  }

  _inferDependencies(imports) {
    return imports
      .filter(i => !i.startsWith('.') && !i.startsWith('/'))
      .map(i => i.split('/')[0])
      .filter((v, i, a) => a.indexOf(v) === i)
  }
}
