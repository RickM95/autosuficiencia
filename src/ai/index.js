export { default as ConversationMemory } from './ConversationMemory.js'
export { default as PythonBridge } from './PythonBridge.js'
export { default as KnowledgeBase } from './KnowledgeBase.js'
export { default as DocumentImporter } from './DocumentImporter.js'
export { default as ReasoningEngine } from './ReasoningEngine.js'
export { default as KbEngine } from './kb/KbEngine.js'

export { initializeKB, isKBReady, getKBStatus, storeKB, isIndexedDBReady } from './kb/loader.js'
export { validateAll, validateKB } from './kb/validator.js'
export { buildIndexes, getCriticalActions as getIdxCriticalActions } from './kb/indexBuilder.js'
export {
  getActionsByTrigger, getActionsByDomain, getHighPriorityActions,
  getActionById, queryByTriggers, getStageActions, getActionsByIntent,
  setQueryIndexes, getIndexStats, getCriticalActions,
} from './kb/queryEngine.js'
export {
  analyzeKB, suggestFixes, suggestAllFixes, autoRepairKB,
  generateHealthReport, getDiagnosticSummary,
} from './kb/debugger.js'

export {
  sanitizeText, sanitizeMessage, validateStoredMessages,
  validateChatMessage, sanitizeForDisplay, sanitizeFormData,
  getTabAccessGuard, canAccessPlan,
} from './SecurityGuard.js'

export {
  DevAgentCore, CodeInspector, PatchEngine, ValidationGate,
  DependencyScanner, DependencyAdvisor, ViteDependencyChecker,
  getDevAgent, isDevRequest, routeDevRequest, classifyAndRoute,
  buildModuleRegistry, buildPackageJson,
} from './devAgent/index.js'

export {
  NephiBootSystem, BOOT_STATUS, SYSTEM_STATE,
  STAGES, getStageById,
  bootLog, getLogSummary, setLogLevel,
  BootRecovery, RECOVERY_ACTIONS,
} from './bootstrap/index.js'

export {
  SearchTriggerEngine, PublicApiService, WebResultProcessor,
  BilingualFormatter, KBEnrichmentModule,
  WebLayerIntegration, getWebLayer, isWebRequest,
} from './webLayer/index.js'

export { generatePlan } from './PlanGenerator.js'

export {
  assembleResponse,
  buildWelcomeMessage,
  renderPlanInChat,
} from './ResponseAssembler.js'

export {
  analyzeNeeds,
  analyzeFinances,
  analyzeGoals,
  analyzeResources,
  analyzeCompleteness,
  identifyRisks,
  analyzeMessage,
  detectLanguage,
  getBrowserLanguage,
} from './Analyzer.js'

export {
  getBudgetAdvice,
  getDebtAdvice,
  getSavingsAdvice,
  getIncomeAdvice,
} from './advice/finances.js'

export {
  getNeedsAdvice,
  getStressAdvice,
  getResourcesAdvice,
} from './advice/wellbeing.js'

export {
  getGoalsAdvice,
} from './advice/goals.js'

export {
  detectIntent,
} from './intentDetector.js'

export {
  decideFinalResponse,
} from './aiOrchestrator.js'

export {
  isRepeatingResponse,
  getVariantResponse,
} from './loopGuard.js'

export {
  extractFormDataFromMemory,
  formatFormUpdateMessage,
} from './formFiller.js'

export {
  generateAdaptivePlan,
  getPlannerResponse,
  PLAN_STAGES,
} from './autonomousPlanner.js'

export {
  generateIncomeOptions,
  generateIncomeResponse,
} from './incomeEngine.js'

export {
  selectBestAction,
  advanceExecution,
  getExecutionStep,
  generateDecisionResponse,
} from './decisionEngine.js'

export {
  fuseDomains,
  generateDeepResponse,
  isShallowResponse,
} from './domainFusionEngine.js'
