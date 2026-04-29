#!/usr/bin/env node

/**
 * PHASE 5 Test Runner
 * Execute all humanization tests
 */

import { IntentTree } from './src/ai/IntentTree.js'
import { EmotionalIntelligence } from './src/ai/EmotionalIntelligence.js'
import { SubtextDetector } from './src/ai/SubtextDetector.js'
import { DualLayerReasoner } from './src/ai/DualLayerReasoner.js'
import { ResponseGenerator } from './src/ai/ResponseGenerator.js'

// ═══════════════════════════════════════════════════════════════
// TEST 1: Multi-Intent Detection
// ═══════════════════════════════════════════════════════════════

async function test1_multiIntent() {
  console.log('\n' + '═'.repeat(70))
  console.log('TEST 1: MULTI-INTENT DETECTION')
  console.log('═'.repeat(70))
  
  const input = "I don't know where to start with my finances. I have debt but no emergency fund and I'm stressed about it."
  console.log(`Input: "${input}"\n`)
  
  const formData = {
    incSalary: 1500,
    expTotal: 1800,
    debts: [{ balance: 5000 }],
    emergencyFund: 0
  }
  
  const memory = { stage: 'WELCOME', recordedTopics: [], interactionCount: 1 }
  const analyses = {
    needs: { critical: ['housing'] },
    finances: { isDeficit: true, hasDebt: true, hasNoEmergencyFund: true }
  }
  
  const intents = IntentTree.evaluate(input, formData, analyses, memory)
  const topIntents = IntentTree.getTopIntents(intents, 3)
  
  console.log(`✅ Found ${intents.length} intents\n`)
  console.log('Top 3 intents:')
  topIntents.forEach((i, idx) => {
    const id = i.id || i.intent || i.label || 'unknown'
    console.log(`  ${idx+1}. ${String(id).toUpperCase()} (${(i.confidence*100).toFixed(0)}%)`)
  })
  
  const passed = topIntents.length >= 2
  console.log(`\n${passed ? '✅' : '❌'} TEST 1: ${passed ? 'PASS' : 'FAIL'}\n`)
  return passed
}

// ═══════════════════════════════════════════════════════════════
// TEST 2: Emotional Routing & Crisis Detection
// ═══════════════════════════════════════════════════════════════

async function test2_emotionalRouting() {
  console.log('═'.repeat(70))
  console.log('TEST 2: EMOTIONAL ROUTING & CRISIS DETECTION')
  console.log('═'.repeat(70))
  
  const input = "I'm giving up. I can't do this anymore. Everything is hopeless."
  console.log(`Input: "${input}"\n`)
  
  const emotionalContext = EmotionalIntelligence.detect(input, {
    financialAnalysis: { isDeficit: true, hasDebt: true },
    needsAnalysis: { critical: ['housing'] }
  })
  
  console.log(`✅ Emotional Analysis:`)
  const detected = emotionalContext.detectedEmotions || []
  console.log(`  Emotions: ${detected.map(e => e.emotion).join(', ') || 'none'}`)
  console.log(`  Intensity: ${emotionalContext.intensity || 0}/10`)
  console.log(`  Intervention: ${emotionalContext.interventionNeed || 'NONE'}`)
  console.log(`  Block dev agent: ${emotionalContext.shouldBlockDevAgent === true}`)
  
  const passed = emotionalContext.interventionNeed === 'IMMEDIATE' && 
                 emotionalContext.shouldBlockDevAgent === true &&
                 emotionalContext.intensity > 7
  
  console.log(`\n${passed ? '✅' : '❌'} TEST 2: ${passed ? 'PASS' : 'FAIL'}\n`)
  return passed
}

// ═══════════════════════════════════════════════════════════════
// TEST 3: Subtext Detection
// ═══════════════════════════════════════════════════════════════

async function test3_subtextDetection() {
  console.log('═'.repeat(70))
  console.log('TEST 3: SUBTEXT PATTERN DETECTION')
  console.log('═'.repeat(70))
  
  const input = "OK, I understand. But what if I lose my job?"
  console.log(`Input: "${input}"\n`)
  
  const subtexts = SubtextDetector.detect(input, {
    previousTopics: ['budget'],
    currentTopic: 'financial_planning'
  })
  
  const prioritized = SubtextDetector.prioritizeSubtexts(subtexts)
  
  console.log(`✅ Found ${subtexts.length} subtext pattern(s):\n`)
  prioritized.slice(0, 2).forEach((s, i) => {
    console.log(`  ${i+1}. ${s.subtext} (${(s.confidence*100).toFixed(0)}%)`)
    console.log(`     → ${s.responseMode}`)
  })
  
  const hasConcern = subtexts.some(s => s.subtext === 'CONCERN_RAISED')
  const passed = hasConcern && subtexts.length > 0
  
  console.log(`\n${passed ? '✅' : '❌'} TEST 3: ${passed ? 'PASS' : 'FAIL'}\n`)
  return passed
}

// ═══════════════════════════════════════════════════════════════
// TEST 4: Response Generation
// ═══════════════════════════════════════════════════════════════

async function test4_responseGeneration() {
  console.log('═'.repeat(70))
  console.log('TEST 4: DYNAMIC RESPONSE GENERATION')
  console.log('═'.repeat(70))
  
  const formData = {
    incSalary: 1500,
    expTotal: 1800,
    debts: [{ balance: 5000 }]
  }
  
  const reasoning = {
    emotionalContext: { vulnerable: true },
    financialContext: { isDeficit: true, hasDebt: true, income: 1500 },
    needsAnalysis: { critical: [{ area: 'housing' }] },
    responseMode: 'EMOTIONAL_FIRST'
  }
  
  const response = ResponseGenerator.generate(reasoning, formData, { lang: 'en', turnCount: 1 })
  
  console.log(`✅ Generated response (${response.length} chars):\n`)
  console.log(response.substring(0, 200) + '...\n')
  
  const passed = response.length > 50 && response.length < 500
  
  console.log(`\n${passed ? '✅' : '❌'} TEST 4: ${passed ? 'PASS' : 'FAIL'}\n`)
  return passed
}

// ═══════════════════════════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('\n')
  console.log('╔' + '═'.repeat(68) + '╗')
  console.log('║' + ' '.repeat(20) + 'PHASE 5: HUMANIZATION TESTING' + ' '.repeat(20) + '║')
  console.log('╚' + '═'.repeat(68) + '╝')
  
  try {
    const test1 = await test1_multiIntent()
    const test2 = await test2_emotionalRouting()
    const test3 = await test3_subtextDetection()
    const test4 = await test4_responseGeneration()
    
    const results = [
      { name: 'Multi-Intent Detection', passed: test1 },
      { name: 'Emotional Routing', passed: test2 },
      { name: 'Subtext Detection', passed: test3 },
      { name: 'Response Generation', passed: test4 }
    ]
    
    // Summary
    console.log('═'.repeat(70))
    console.log('SUMMARY')
    console.log('═'.repeat(70))
    
    const passCount = results.filter(r => r.passed).length
    results.forEach(r => {
      console.log(`${r.passed ? '✅' : '❌'} ${r.name}`)
    })
    
    console.log('\n' + '═'.repeat(70))
    console.log(`TOTAL: ${passCount}/${results.length} tests passed`)
    console.log(passCount === results.length ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAIL')
    console.log('═'.repeat(70) + '\n')
    
    return passCount === results.length
    
  } catch (error) {
    console.error('\n❌ Test execution error:', error.message)
    console.error(error.stack)
    return false
  }
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1)
})
