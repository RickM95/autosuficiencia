import { CodeInspector } from './codeInspector.js'
import { PatchEngine } from './patchEngine.js'
import { ValidationGate } from './validationGate.js'
import { DependencyScanner } from './dependencyScanner.js'
import { DependencyAdvisor } from './dependencyAdvisor.js'
import { ViteDependencyChecker } from './viteDependencyChecker.js'

export class DevAgentCore {
  constructor() {
    this.inspector = new CodeInspector()
    this.patchEngine = new PatchEngine()
    this.validationGate = new ValidationGate()
    this.depScanner = new DependencyScanner()
    this.depAdvisor = new DependencyAdvisor()
    this.viteChecker = new ViteDependencyChecker()
    this.operationLog = []
  }

  parseDevRequest(input) {
    const lower = input.toLowerCase()

    const patterns = {
      inspect: /inspect|analyze|scan|examine|show|list|what.*(?:in|at|does)|how.*work/i,
      patch: /(?:add|change|update|modify|fix|edit)\s+(?:function|method|code|file|logic)|implement|patch/i,
      dependency: /(?:install|add|need|missing|require|import)\s+(?:package|dependency|library|module|dep|npm)/i,
      validate: /validate|verify|check|test\s+(?:integrity|safety|system)|is.*safe/i,
      explain: /explain|how\s+(?:does|is)|what\s+(?:is|does)|why/i,
    }

    let type = 'unknown'
    for (const [t, p] of Object.entries(patterns)) {
      if (p.test(lower)) { type = t; break }
    }

    const targetMatch = input.match(/(?:in|of|for|to)\s+`([^`]+)`|(?:function|file|module)\s+(\w+)/i)
    const target = targetMatch ? (targetMatch[1] || targetMatch[2]) : null

    return { type, target, raw: input, timestamp: Date.now() }
  }

  async execute(input, moduleRegistry, packageJson) {
    const request = this.parseDevRequest(input)
    this.operationLog.push(request)

    switch (request.type) {
      case 'inspect':
        return this._handleInspect(request, moduleRegistry)
      case 'patch':
        return this._handlePatch(request, moduleRegistry)
      case 'dependency':
        return this._handleDependency(request, moduleRegistry, packageJson)
      case 'validate':
        return this._handleValidate(request, moduleRegistry, packageJson)
      case 'explain':
        return this._handleExplain(request, moduleRegistry)
      default:
        return {
          type: 'unknown',
          message: 'Could not determine request type. Supported: inspect, patch, dependency, validate.',
          request: request.raw,
        }
    }
  }

  _handleInspect(request, registry) {
    if (request.target) {
      const mod = registry[request.target]
      if (!mod) return { type: 'inspect', error: `Module "${request.target}" not found in registry`, registry: Object.keys(registry) }
      return { type: 'inspect', target: request.target, exports: mod.exports || [], imports: mod.imports || [], size: mod.size || 0, dependencies: mod.dependencies || [] }
    }
    return { type: 'inspect', registry: Object.keys(registry), count: Object.keys(registry).length }
  }

  async _handlePatch(request, registry) {
    const validation = await this.validationGate.validate({ type: 'patch', target: request.target, registry })
    if (!validation.safe) {
      return { type: 'patch', error: 'Validation failed', validation }
    }
    return { type: 'patch', message: 'Patch approved — ready for execution', validation }
  }

  _handleDependency(request, registry, packageJson) {
    const scan = this.depScanner.scan(registry, packageJson)
    const advice = this.depAdvisor.analyze(scan)
    const viteIssues = this.viteChecker.check(scan)
    return { type: 'dependency', scan, advice, viteIssues }
  }

  async _handleValidate(request, registry, packageJson) {
    return this.validationGate.validate({ type: 'full', registry, packageJson })
  }

  _handleExplain(request, registry) {
    if (!request.target) return { type: 'explain', message: 'Specify a module or function name to explain.', available: Object.keys(registry) }
    const mod = registry[request.target]
    if (!mod) return { type: 'explain', error: `"${request.target}" not found` }
    const importList = mod.imports ? mod.imports.map(i => `  imports: ${i}`).join('\n') : ''
    const exportList = mod.exports ? mod.exports.map(e => `  exports: ${e}`).join('\n') : ''
    return { type: 'explain', target: request.target, details: `Module: ${request.target}\n${importList}\n${exportList}\nLines: ${mod.size || 'unknown'}`, raw: mod }
  }

  getLog() { return this.operationLog }
  clearLog() { this.operationLog = [] }
}
