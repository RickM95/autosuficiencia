export { DevAgentCore } from './devAgentCore.js'
export { CodeInspector } from './codeInspector.js'
export { PatchEngine } from './patchEngine.js'
export { ValidationGate } from './validationGate.js'
export { DependencyScanner } from './dependencyScanner.js'
export { DependencyAdvisor } from './dependencyAdvisor.js'
export { ViteDependencyChecker } from './viteDependencyChecker.js'
export {
  getDevAgent, isDevRequest, routeDevRequest, classifyAndRoute,
  buildModuleRegistry, buildPackageJson,
} from './integrationHook.js'
