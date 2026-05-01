import { isDevRequest, routeDevRequest, buildModuleRegistry, buildPackageJson, classifyAndRoute } from './devAgent/index.js'
import { getBudgetAdvice, getDebtAdvice, getSavingsAdvice, getIncomeAdvice } from './advice/finances.js'
import { getNeedsAdvice, getStressAdvice, getResourcesAdvice } from './advice/wellbeing.js'
import { getGoalsAdvice } from './advice/goals.js'
import { generatePlan } from './PlanGenerator.js'
import { detectIntent } from './intentDetector.js'
import { decideNextAction, generateOrchestratorResponse } from './autonomousOrchestrator.js'
import { isRepeatingResponse, getVariantResponse } from './loopGuard.js'

export function buildWelcomeMessage(memory, formData, lang) {
  const name = formData?.name || ''
  if (memory.interactionCount === 0) {
    return lang === 'es'
      ? `¡Hola! Soy Nephi. Cuéntame—¿qué te trae por aquí hoy?`
      : `Hello! I'm Nephi. Tell me—what brings you here today?`
  }
  const greeting = name ? (lang === 'es' ? `¡Hola ${name}! ` : `Hello ${name}! `) : ''
  return greeting + (lang === 'es'
    ? `¿En qué puedo ayudarte hoy?`
    : `How can I help you today?`)
}

export function assembleResponse(stage, analysis, formData, budgetData, memory, userMessage, lang) {
  if (!analysis || analysis.structureError) {
    return lang === 'es'
      ? 'Encontré un problema técnico. Por favor intenta de nuevo.'
      : 'I encountered a technical issue. Please try again.'
  }

  if (analysis.orchestratorResponse) {
    return analysis.orchestratorResponse
  }

  if (userMessage) {
    try {
      const devRouting = classifyAndRoute(userMessage)
      if (devRouting && devRouting.shouldBlockDevTrigger && devRouting.responseStrategy) {
        const emotionResponse = buildEmotionalResponse(devRouting, userMessage, lang)
        if (emotionResponse) return emotionResponse
      }

      const isDev = userMessage && isDevRequest(userMessage)
      if (isDev) {
        const routing = classifyAndRoute(userMessage)
        if (routing && routing.shouldBlockDevTrigger) {
          const response = buildEmotionalResponse(routing, userMessage, lang)
          if (response) return response
        }
        return _handleDevRequest(userMessage, lang)
      }
    } catch {
    }
  }

  const orchestratorDecision = decideNextAction(userMessage, memory, {
    formData,
    analysis: {},
  })

  const responseText = generateOrchestratorResponse(orchestratorDecision, memory, {
    hasFormData: !!(formData && Object.keys(formData).length > 2),
  })

  const repetition = isRepeatingResponse(responseText, memory.lastResponses)
  if (repetition) {
    const variant = getVariantResponse(
      orchestratorDecision.action,
      lang,
      memory.interactionCount || 0
    )
    if (variant) return variant
  }

  return responseText
}

function _handleDevRequest(userMessage, lang) {
  const registry = buildModuleRegistry()
  const packageJson = buildPackageJson()
  const result = routeDevRequest(userMessage, registry, packageJson)
  const t = (es, en) => lang === 'es' ? es : en

  const header = `**Nephi — ${t('Análisis', 'Analysis')}**\n`

  switch (result.type) {
    case 'inspect': {
      if (result.error) {
        return `${header}\n${t('Error', 'Error')}: ${result.error}\n\n${t('Módulos disponibles', 'Available modules')}: ${result.registry.join(', ')}`
      }
      if (result.target) {
        return `${header}\n**${t('Módulo', 'Module')}:** ${result.target}\n${t('Exportaciones', 'Exports')}: ${(result.exports || []).join(', ') || t('Ninguna', 'None')}\n${t('Importaciones', 'Imports')}: ${(result.imports || []).join(', ') || t('Ninguna', 'None')}\n${t('Tamaño', 'Size')}: ${result.size} ${t('líneas', 'lines')}\n${t('Dependencias', 'Dependencies')}: ${(result.dependencies || []).join(', ') || t('Ninguna', 'None')}`
      }
      return `${header}\n${t('Registro de módulos', 'Module registry')}: ${result.count} ${t('módulos', 'modules')}\n${Object.keys(registry).join(', ')}`
    }

    case 'dependency': {
      const lines = [header]
      if (result.scan) {
        lines.push(`\n**${t('Escaneo de dependencias', 'Dependency scan')}**`)
        lines.push(`${t('Instaladas', 'Installed')}: ${result.scan.installedDependencies.length}`)
        lines.push(`${t('Faltantes', 'Missing')}: ${result.scan.missingDependencies.length}`)
      }
      if (result.advice && result.advice.recommendations) {
        lines.push(`\n**${t('Recomendaciones', 'Recommendations')}:**`)
        for (const r of result.advice.recommendations) {
          lines.push(`  \`${r.installCmd}\` ${r.viteCompatible ? '✅' : '⚠️'}`)
        }
      }
      if (result.viteIssues && result.viteIssues.warnings) {
        lines.push(`\n**${t('Advertencias Vite', 'Vite warnings')}:**`)
        for (const w of result.viteIssues.warnings) {
          lines.push(`  ⚠️ ${w.detail}`)
        }
      }
      return lines.join('\n')
    }

    case 'patch': {
      if (result.error) {
        return `${header}\n**${t('Error de validación', 'Validation error')}:** ${result.error}`
      }
      return `${header}\n✅ ${t('Parche aprobado — listo para ejecución', 'Patch approved — ready for execution')}\n${t('Ejecutar', 'Run')}: \`npm install\` ${t('si hay dependencias pendientes', 'if dependencies are pending')}`
    }

    case 'validate': {
      if (!result.validation) return `${header}\n${t('Sin resultados de validación', 'No validation results')}`
      return `${header}\n✅ ${t('Seguro', 'Safe')}: ${result.validation.safe}\n${t('Errores', 'Errors')}: ${(result.validation.errors || []).join('; ') || t('Ninguno', 'None')}\n${t('Advertencias', 'Warnings')}: ${(result.validation.warnings || []).join('; ') || t('Ninguna', 'None')}`
    }

    case 'explain': {
      if (result.error) return `${header}\n${t('Error', 'Error')}: ${result.error}`
      return `${header}\n${result.details || result.message}`
    }

    default:
      return `${header}\n${t('No se pudo determinar el tipo de solicitud de desarrollo.', 'Could not determine development request type.')}\n${t('Tipos soportados', 'Supported types')}: inspect, patch, dependency, validate, explain`
  }
}

function buildEmotionalResponse(routing, userMessage, lang) {
  const strategy = routing.responseStrategy
  if (!strategy) return null

  const template = strategy.templates
    ? (strategy.templates[lang] || strategy.templates.en)
    : null
  if (!template || template.length === 0) return null

  const selected = template[Math.floor(Math.random() * template.length)]
  return selected
}

export function renderPlanInChat(plan, lang) {
  const t = (es, en) => lang === 'es' ? es : en
  const scoreColor = s => s >= 70 ? '✅' : s >= 40 ? '⚠️' : '🔴'

  const lines = [
    `╔═══════════════════════════════════════════════════╗`,
    `║      ${t('PLAN DE AUTOSUFICIENCIA', 'SELF-SUFFICIENCY PLAN').padEnd(42)}║`,
    `╚═══════════════════════════════════════════════════╝`,
    '',
    `${scoreColor(plan.overallScore)} **${t('Puntaje General', 'Overall Score')}: ${plan.overallScore}/100**`,
    `   ${t('Necesidades', 'Needs')}: ${plan.scores.needs}/100  |  ${t('Finanzas', 'Finances')}: ${plan.scores.finances}/100  |  ${t('Metas', 'Goals')}: ${plan.scores.goals}/100`,
    '',
    `1️⃣ ${t('Evaluación de Necesidades', 'Needs Assessment')}`,
    ...plan.needsAssessment.map(n => `   ${n.emoji} ${n.area}: ${n.score}/5 — ${n.status}`),
    '',
    `2️⃣ ${t('Salud Financiera', 'Financial Health')}`,
    `   ${t('Ingresos', 'Income')}: ${plan.financeDetails.income}  |  ${t('Gastos', 'Expenses')}: ${plan.financeDetails.expenses}`,
    `   ${t('Balance', 'Balance')}: ${plan.financeDetails.balance}  |  ${t('Deuda total', 'Total debt')}: ${plan.financeDetails.totalDebt}`,
    ...(plan.financeDetails.emergencyFundMonths !== undefined ? [`   ${t('Fondo emergencia', 'Emergency fund')}: ${plan.financeDetails.emergencyFundMonths} ${t('mese(s)', 'month(s)')}`] : []),
    '',
    `3️⃣ ${t('Metas SMART', 'SMART Goals')}`,
    ...plan.goals.map(g => `   ${g.emoji} **${g.timeframe}:** ${g.goal}`),
    '',
    `4️⃣ ${t('Plan de Acción', 'Action Plan')} — ${t('Prioridades', 'Priorities')}`,
    ...plan.actionItems.map((a, i) => `   ${i + 1}. ${a.emoji} **${a.action}** — ${a.detail}`),
    '',
    `5️⃣ ${t('Análisis de Riesgos', 'Risk Analysis')}`,
    ...plan.risks.map(r => `   ${r.emoji} ${r.risk}`),
    '',
    `📅 ${t('Próxima revisión recomendada', 'Next review recommended')}: ${plan.nextReviewDate}`,
    '',
    t('¿Quieres que detalle alguna sección o ajuste algo?', 'Would you like me to detail any section or adjust something?'),
  ]
  return lines.join('\n')
}
