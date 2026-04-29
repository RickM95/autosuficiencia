/**
 * PHASE 5: HUMANIZATION TESTING
 * 
 * Direct module testing to verify:
 * 1. Multi-intent detection
 * 2. Emotional routing
 * 3. Subtext detection
 * 4. Context continuity
 * 5. Response variation
 */

import { IntentTree } from './IntentTree.js'
import { EmotionalIntelligence } from './EmotionalIntelligence.js'
import { SubtextDetector } from './SubtextDetector.js'
import { DualLayerReasoner } from './DualLayerReasoner.js'
import { ResponseGenerator } from './ResponseGenerator.js'

// ═══════════════════════════════════════════════════════════════
// TEST 1: Multi-Intent Detection (Confusion Scenario)
// ═══════════════════════════════════════════════════════════════

export const TEST_1_MULTI_INTENT = {
  name: "Test 1: Multi-Intent Detection",
  scenario: "User confused about finances",
  input: "I don't know where to start with my finances. I have debt but no emergency fund and I'm stressed about it.",
  
  run: function() {
    console.log('\n' + '='.repeat(70))
    console.log('TEST 1: MULTI-INTENT DETECTION')
    console.log('='.repeat(70))
    console.log(`Scenario: ${this.scenario}`)
    console.log(`Input: "${this.input}"\n`)
    
    // Create mock form data
    const formData = {
      incSalary: 1500,
      expTotal: 1800,
      debts: [{ balance: 5000 }],
      emergencyFund: 0,
      name: 'Test User'
    }
    
    // Create mock memory
    const memory = {
      stage: 'WELCOME',
      recordedTopics: [],
      interactionCount: 1
    }
    
    // Run intent tree evaluation
    const intents = IntentTree.evaluate(this.input, formData, {
      needs: { critical: ['food'] },
      finances: { isDeficit: true, hasDebt: true, hasNoEmergencyFund: true }
    }, memory)
    
    // Get top 3 intents
    const topIntents = IntentTree.getTopIntents(intents, 3)
    
    console.log('✅ RESULTS:')
    console.log(`   Found ${intents.length} total intents`)
    console.log(`\n   Top 3 intents (by confidence):`)
    topIntents.forEach((intent, i) => {
      console.log(`   ${i+1}. ${intent.intent.toUpperCase()} (confidence: ${(intent.confidence * 100).toFixed(0)}%)`)
    })
    
    // Verify multi-intent works
    const isMultiIntent = topIntents.length > 1
    const hasConfidence = topIntents.every(i => i.confidence > 0)
    const isSorted = topIntents.every((i, idx) => idx === 0 || i.confidence <= topIntents[idx-1].confidence)
    
    const passed = isMultiIntent && hasConfidence && isSorted
    console.log(`\n${passed ? '✅' : '❌'} Multi-intent detection: ${passed ? 'PASS' : 'FAIL'}`)
    console.log(`   - Multiple intents found: ${isMultiIntent ? '✓' : '✗'}`)
    console.log(`   - All have confidence scores: ${hasConfidence ? '✓' : '✗'}`)
    console.log(`   - Sorted by confidence: ${isSorted ? '✓' : '✗'}`)
    
    return { passed, intents, topIntents }
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST 2: Emotional Routing (Crisis Blocks Dev Agent)
// ═══════════════════════════════════════════════════════════════

export const TEST_2_EMOTIONAL_ROUTING = {
  name: "Test 2: Emotional Routing & Crisis Detection",
  scenario: "User in desperation/crisis state",
  input: "I'm giving up. I can't do this anymore. Everything is hopeless.",
  
  run: function() {
    console.log('\n' + '='.repeat(70))
    console.log('TEST 2: EMOTIONAL ROUTING (CRISIS DETECTION)')
    console.log('='.repeat(70))
    console.log(`Scenario: ${this.scenario}`)
    console.log(`Input: "${this.input}"\n`)
    
    // Run emotional intelligence detection
    const emotionalContext = EmotionalIntelligence.detect(this.input, {
      financialAnalysis: { isDeficit: true, hasDebt: true },
      needsAnalysis: { critical: ['housing'] }
    })
    
    console.log('✅ RESULTS:')
    console.log(`   Detected emotions: ${emotionalContext.detectedEmotions.map(e => e.emotion).join(', ')}`)
    console.log(`   Emotional intensity: ${emotionalContext.intensity}/10`)
    console.log(`   Coping capacity: ${emotionalContext.copingCapacity}/10`)
    console.log(`   Intervention need: ${emotionalContext.interventionNeed}`)
    console.log(`   Should block dev agent: ${emotionalContext.shouldBlockDevAgent}`)
    
    // Verify crisis detection
    const hasDesperation = emotionalContext.detectedEmotions.some(e => e.emotion === 'DESPERATION')
    const highIntensity = emotionalContext.intensity > 7
    const immediateIntervention = emotionalContext.interventionNeed === 'IMMEDIATE'
    const blocksDevAgent = emotionalContext.shouldBlockDevAgent === true
    
    const passed = hasDesperation && highIntensity && immediateIntervention && blocksDevAgent
    console.log(`\n${passed ? '✅' : '❌'} Crisis detection & dev agent blocking: ${passed ? 'PASS' : 'FAIL'}`)
    console.log(`   - Desperation emotion detected: ${hasDesperation ? '✓' : '✗'}`)
    console.log(`   - High intensity (>7): ${highIntensity ? '✓' : '✗'}`)
    console.log(`   - Intervention = IMMEDIATE: ${immediateIntervention ? '✓' : '✗'}`)
    console.log(`   - Dev agent blocked: ${blocksDevAgent ? '✓' : '✗'}`)
    
    return { passed, emotionalContext }
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST 3: Subtext Pattern Detection
// ═══════════════════════════════════════════════════════════════

export const TEST_3_SUBTEXT_DETECTION = {
  name: "Test 3: Subtext Pattern Detection",
  scenario: "User raises concern with 'but' statement",
  input: "OK, I understand the budget approach. But what if I lose my job?",
  
  run: function() {
    console.log('\n' + '='.repeat(70))
    console.log('TEST 3: SUBTEXT PATTERN DETECTION')
    console.log('='.repeat(70))
    console.log(`Scenario: ${this.scenario}`)
    console.log(`Input: "${this.input}"\n`)
    
    // Run subtext detection
    const subtexts = SubtextDetector.detect(this.input, {
      previousTopics: ['budget'],
      currentTopic: 'financial_planning',
      lang: 'en'
    })
    
    const prioritized = SubtextDetector.prioritizeSubtexts(subtexts)
    
    console.log('✅ RESULTS:')
    console.log(`   Found ${subtexts.length} subtext pattern(s)\n`)
    prioritized.slice(0, 3).forEach((s, i) => {
      console.log(`   ${i+1}. ${s.subtext}`)
      console.log(`      - Implies: ${s.implies}`)
      console.log(`      - Response mode: ${s.responseMode}`)
      console.log(`      - Confidence: ${(s.confidence * 100).toFixed(0)}%`)
    })
    
    // Verify concern detection
    const hasConcernRaised = subtexts.some(s => s.subtext === 'CONCERN_RAISED')
    const hasResponseMode = subtexts.every(s => s.responseMode)
    const isConfident = subtexts.length > 0
    
    const passed = hasConcernRaised && hasResponseMode && isConfident
    console.log(`\n${passed ? '✅' : '❌'} Subtext detection: ${passed ? 'PASS' : 'FAIL'}`)
    console.log(`   - CONCERN_RAISED detected: ${hasConcernRaised ? '✓' : '✗'}`)
    console.log(`   - Response modes assigned: ${hasResponseMode ? '✓' : '✗'}`)
    console.log(`   - Patterns identified: ${isConfident ? '✓' : '✗'}`)
    
    return { passed, subtexts, prioritized }
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST 4: Dual-Layer Reasoning (Human vs System)
// ═══════════════════════════════════════════════════════════════

export const TEST_4_DUAL_LAYER = {
  name: "Test 4: Dual-Layer Reasoning",
  scenario: "Vague user input requiring human reasoning",
  input: "I'm confused about what to do.",
  
  run: async function() {
    console.log('\n' + '='.repeat(70))
    console.log('TEST 4: DUAL-LAYER REASONING')
    console.log('='.repeat(70))
    console.log(`Scenario: ${this.scenario}`)
    console.log(`Input: "${this.input}"\n`)
    
    const formData = { incSalary: 1500, expTotal: 1800 }
    const reasoning = await DualLayerReasoner.reason(this.input, formData, {
      userMessage: this.input,
      stage: 'WELCOME'
    })
    
    console.log('✅ RESULTS:')
    console.log(`   Human layer reasoning: ${JSON.stringify(reasoning.humanLayer.needsAssessment.realNeed)}`)
    console.log(`   System layer reasoning: ${reasoning.systemLayer.intent}`)
    console.log(`   Selected layer: ${reasoning.decision.layer}`)
    console.log(`   Reason: ${reasoning.decision.reason}`)
    console.log(`\n   Human confidence: ${(reasoning.humanLayer.confidence * 100).toFixed(0)}%`)
    console.log(`   System confidence: ${(reasoning.systemLayer.confidence * 100).toFixed(0)}%`)
    
    // Verify human layer prioritized for vague input
    const humanSelected = reasoning.decision.layer === 'HUMAN'
    const humanHasConfidence = reasoning.humanLayer.confidence > 0
    const systemHasConfidence = reasoning.systemLayer.confidence > 0
    
    const passed = humanSelected && humanHasConfidence && systemHasConfidence
    console.log(`\n${passed ? '✅' : '❌'} Dual-layer reasoning: ${passed ? 'PASS' : 'FAIL'}`)
    console.log(`   - Human layer selected for vague input: ${humanSelected ? '✓' : '✗'}`)
    console.log(`   - Both layers executed: ${humanHasConfidence && systemHasConfidence ? '✓' : '✗'}`)
    console.log(`   - Decision rationale provided: ${reasoning.decision.reason ? '✓' : '✗'}`)
    
    return { passed, reasoning }
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST 5: Response Generation with Variation
// ═══════════════════════════════════════════════════════════════

export const TEST_5_RESPONSE_GENERATION = {
  name: "Test 5: Dynamic Response Generation",
  scenario: "Generate contextual response to financial crisis",
  
  run: function() {
    console.log('\n' + '='.repeat(70))
    console.log('TEST 5: DYNAMIC RESPONSE GENERATION')
    console.log('='.repeat(70))
    console.log(`Scenario: ${this.scenario}\n`)
    
    const formData = {
      incSalary: 1500,
      expTotal: 1800,
      debts: [{ balance: 5000 }],
      name: 'Test User'
    }
    
    const reasoning = {
      emotionalContext: { vulnerable: true },
      financialContext: { isDeficit: true, hasDebt: true, hasNoEmergencyFund: true, income: 1500 },
      needsAnalysis: { critical: [{ area: 'housing' }] },
      responseMode: 'EMOTIONAL_FIRST',
      subtexts: []
    }
    
    const context = { lang: 'en', turnCount: 1 }
    
    // Generate response
    const response = ResponseGenerator.generate(reasoning, formData, context)
    
    console.log('✅ GENERATED RESPONSE:')
    console.log('─'.repeat(70))
    console.log(response)
    console.log('─'.repeat(70))
    
    // Verify response structure
    const hasOpening = response.length > 50
    const hasValidation = response.includes('valid') || response.includes('understand')
    const hasAction = response.includes('•') || response.includes('**') || response.includes('action')
    const isLessThan500 = response.length < 500
    
    // Generate again with turn count 2 to check variation
    const context2 = { lang: 'en', turnCount: 2 }
    const response2 = ResponseGenerator.generate(reasoning, formData, context2)
    const isDifferent = response !== response2
    
    const passed = hasOpening && hasValidation && hasAction && isLessThan500
    console.log(`\n${passed ? '✅' : '❌'} Response generation: ${passed ? 'PASS' : 'FAIL'}`)
    console.log(`   - Has opening: ${hasOpening ? '✓' : '✗'}`)
    console.log(`   - Has validation: ${hasValidation ? '✓' : '✗'}`)
    console.log(`   - Has action items: ${hasAction ? '✓' : '✗'}`)
    console.log(`   - Length appropriate (<500 chars): ${isLessThan500 ? '✓' : '✗'}`)
    console.log(`   - Variation on turn 2: ${isDifferent ? '✓' : '✗'}`)
    
    return { passed, response, response2, isDifferent }
  }
}

// ═══════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ═══════════════════════════════════════════════════════════════

export async function runAllTests() {
  console.log('\n\n')
  console.log('╔' + '═'.repeat(68) + '╗')
  console.log('║' + ' '.repeat(15) + 'PHASE 5: HUMANIZATION TESTING' + ' '.repeat(24) + '║')
  console.log('╚' + '═'.repeat(68) + '╝')
  
  const results = []
  
  // Test 1
  const test1 = TEST_1_MULTI_INTENT.run()
  results.push({ name: TEST_1_MULTI_INTENT.name, passed: test1.passed })
  
  // Test 2
  const test2 = TEST_2_EMOTIONAL_ROUTING.run()
  results.push({ name: TEST_2_EMOTIONAL_ROUTING.name, passed: test2.passed })
  
  // Test 3
  const test3 = TEST_3_SUBTEXT_DETECTION.run()
  results.push({ name: TEST_3_SUBTEXT_DETECTION.name, passed: test3.passed })
  
  // Test 4
  const test4 = await TEST_4_DUAL_LAYER.run()
  results.push({ name: TEST_4_DUAL_LAYER.name, passed: test4.passed })
  
  // Test 5
  const test5 = TEST_5_RESPONSE_GENERATION.run()
  results.push({ name: TEST_5_RESPONSE_GENERATION.name, passed: test5.passed })
  
  // Summary
  console.log('\n\n' + '═'.repeat(70))
  console.log('PHASE 5 TEST SUMMARY')
  console.log('═'.repeat(70))
  
  let passCount = 0
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌'
    console.log(`${icon} ${r.name}: ${r.passed ? 'PASS' : 'FAIL'}`)
    if (r.passed) passCount++
  })
  
  const totalPassed = `${passCount}/${results.length}`
  console.log('\n' + '═'.repeat(70))
  console.log(`OVERALL: ${totalPassed} tests passed`)
  console.log(`Status: ${passCount === results.length ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAIL'}`)
  console.log('═'.repeat(70))
  
  return results
}

// Export for testing
export default { runAllTests }
