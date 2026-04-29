import { DevAgentCore } from './devAgentCore.js'
import { EmotionalRouter } from '../kb/emotional/emotionalRouter.js'

let _agentInstance = null
let _emotionalRouterInstance = null

export function getDevAgent() {
  if (!_agentInstance) {
    _agentInstance = new DevAgentCore()
  }
  return _agentInstance
}

export function getEmotionalRouter() {
  if (!_emotionalRouterInstance) {
    _emotionalRouterInstance = new EmotionalRouter()
  }
  return _emotionalRouterInstance
}

export function isDevRequest(input) {
  const router = getEmotionalRouter()
  const routing = router.route(input)

  if (routing.shouldBlockDevTrigger) {
    return false
  }

  const devTriggers = [
    // Require both an action verb AND an explicit technical object
    /^(inspect|scan)\s+(module|code|file|function|system|kb)/i,
    /^(install|add)\s+(package|dependency|dep|library|npm)/i,
    /^(patch|modify)\s+(code|file|function|logic|module)/i,
    /^(validate|verify)\s+(system|integrity|kb|dependencies)/i,
    /^(explain|describe)\s+(module|function|code|system)\s+\w/i,
    /^(implement|build)\s+(function|module)\s+\w/i,
    // Explicit dev shorthand with backtick module reference
    /`[A-Za-z]+\.js`/,
  ]
  return devTriggers.some(p => p.test(input.trim()))
}

export function classifyAndRoute(input) {
  const router = getEmotionalRouter()
  return router.route(input)
}

export function routeDevRequest(input, moduleRegistry, packageJson) {
  const agent = getDevAgent()
  return agent.execute(input, moduleRegistry, packageJson)
}

export function buildModuleRegistry() {
  const modules = {}
  const ctx = typeof window !== 'undefined' ? window : globalThis

  const sourceModules = {
    'ai/index.js': { exports: Object.keys(ctx).filter(k => k.startsWith('ai_') || k.startsWith('__')), lines: 52 },
    'ai/ReasoningEngine.js': { exports: ['ReasoningEngine'], lines: 174 },
    'ai/Analyzer.js': { exports: ['analyzeNeeds', 'analyzeFinances', 'analyzeGoals', 'analyzeMessage'], lines: 253 },
    'ai/ConversationMemory.js': { exports: ['ConversationMemory'], lines: 116 },
    'ai/ResponseAssembler.js': { exports: ['assembleResponse', 'buildWelcomeMessage', 'renderPlanInChat'], lines: 350 },
    'ai/PlanGenerator.js': { exports: ['generatePlan'], lines: 320 },
    'ai/PythonBridge.js': { exports: ['PythonBridge'], lines: 233 },
    'ai/KnowledgeBase.js': { exports: ['KnowledgeBase'], lines: 291 },
    'ai/DocumentImporter.js': { exports: ['DocumentImporter'], lines: 235 },
    'ai/translate.js': { exports: ['t', 'fmtMoney'], lines: 12 },
    'ai/SecurityGuard.js': { exports: ['sanitizeText', 'sanitizeMessage', 'validateStoredMessages'], lines: 155 },
    'ai/kb/KbEngine.js': { exports: ['KbEngine'], lines: 622 },
    'ai/kb/validator.js': { exports: ['validateKB', 'validateAll', 'validateActions'], lines: 332 },
    'ai/kb/loader.js': { exports: ['initializeKB', 'isKBReady', 'getKBStatus'], lines: 194 },
    'ai/kb/indexBuilder.js': { exports: ['buildIndexes'], lines: 131 },
    'ai/kb/queryEngine.js': { exports: ['getActionsByTrigger', 'getActionById', 'getCriticalActions'], lines: 88 },
    'ai/kb/debugger.js': { exports: ['analyzeKB', 'autoRepairKB', 'generateHealthReport'], lines: 666 },
    'ai/advice/finances.js': { exports: ['getBudgetAdvice', 'getDebtAdvice', 'getSavingsAdvice'], lines: 268 },
    'ai/advice/wellbeing.js': { exports: ['getNeedsAdvice', 'getStressAdvice'], lines: 162 },
    'ai/advice/goals.js': { exports: ['getGoalsAdvice'], lines: 166 },
    'ai/config/domains.js': { exports: ['NEEDS_DOMAINS', 'INCOME_FIELDS', 'EXPENSE_FIELDS'], lines: 53 },
    'components/AIAssistant.jsx': { exports: ['AIAssistant'], lines: 482 },
    'components/KnowledgeBasePanel.jsx': { exports: ['KnowledgeBasePanel'], lines: 250 },
    'components/SelfSufficiencyForm.jsx': { exports: ['SelfSufficiencyForm'], lines: 644 },
    'components/SelfSufficiencyPlan.jsx': { exports: ['SelfSufficiencyPlan'], lines: 465 },
    'components/BudgetCalculator.jsx': { exports: ['BudgetCalculator'], lines: 291 },
    'components/CurrencyContext.jsx': { exports: ['CurrencyProvider', 'useCurrency'], lines: 60 },
    'App.jsx': { exports: ['App'], lines: 96 },
  }

  for (const [name, info] of Object.entries(sourceModules)) {
    modules[name] = {
      exports: info.exports || [],
      imports: [],
      dependencies: [],
      lines: info.lines || 0,
    }
  }

  return modules
}

export function buildPackageJson() {
  return {
    dependencies: { react: '^19.2.5', 'react-dom': '^19.2.5', pyodide: '^0.29.3', tailwindcss: '^4.2.4', '@tailwindcss/vite': '^4.2.4' },
    devDependencies: { vite: '^8.0.10', eslint: '^10.2.1', '@vitejs/plugin-react': '^6.0.1', '@babel/core': '^7.29.0', '@rolldown/plugin-babel': '^0.2.3' },
  }
}
