import { useState, useRef, useEffect } from 'react'
import {
  ConversationMemory, PythonBridge, KnowledgeBase, DocumentImporter,
  ReasoningEngine,
  assembleResponse, buildWelcomeMessage,
  detectLanguage, getBrowserLanguage,
  NephiBootSystem,
} from '../ai/index.js'
import { validateChatMessage, sanitizeMessage, validateStoredMessages } from '../ai/SecurityGuard.js'
import KnowledgeBasePanel from './KnowledgeBasePanel.jsx'

let pySingleton = null
let kbSingleton = null
let engineSingleton = null

function getPyBridge() {
  if (!pySingleton) pySingleton = new PythonBridge()
  return pySingleton
}

function getKB() {
  if (!kbSingleton) kbSingleton = new KnowledgeBase()
  return kbSingleton
}

function getEngine(memory, debugMode) {
  if (!engineSingleton) {
    engineSingleton = new ReasoningEngine(memory, debugMode)
  }
  return engineSingleton
}

const bootSystemRef = { current: null }

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  const isPlan = msg.role === 'assistant' && msg.content.startsWith('╔')
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem', gap: '0.5rem', alignItems: 'flex-end',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary-darker), var(--color-primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.875rem', flexShrink: 0, color: 'white', fontWeight: 700,
        }}>AS</div>
      )}
      <div style={{
        maxWidth: '80%', padding: '0.75rem 1rem',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--color-primary)' : 'var(--color-white)',
        color: isUser ? 'white' : 'var(--color-text)',
        boxShadow: 'var(--shadow-sm)', fontSize: '0.875rem', lineHeight: 1.6,
        border: isUser ? 'none' : '1px solid var(--color-border)', whiteSpace: 'pre-wrap',
        fontFamily: isPlan ? 'monospace' : 'inherit',
      }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', flexShrink: 0, color: 'var(--color-primary-darker)', fontWeight: 700,
        }}>Tú</div>
      )}
    </div>
  )
}

function TypingIndicator({ text, language }) {
  const displayText = text && text.includes(' / ')
    ? (language === 'es' ? text.split(' / ')[0] : text.split(' / ')[1])
    : text
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--color-primary-darker), var(--color-primary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.875rem', flexShrink: 0, color: 'white', fontWeight: 700,
      }}>AS</div>
      <div style={{
        padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px',
        background: 'var(--color-white)', border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {text ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{displayText}</span>
        ) : (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const QUICK_PROMPTS = [
  { es: '📊 Diagnosticar mi situación', en: '📊 Diagnose my situation' },
  { es: '🎯 Estructurar mis metas', en: '🎯 Structure my goals' },
  { es: '💳 Analizar deudas', en: '💳 Analyze debts' },
  { es: '📋 Generar plan preciso', en: '📋 Generate precise plan' },
  { es: '🛡️ Evaluar fondo de emergencia', en: '🛡️ Evaluate emergency fund' },
  { es: '🧠 Intervención de estrés', en: '🧠 Stress intervention' },
]

export default function AIAssistant({ userContext, budgetData, isOpen, onToggle }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_messages')
      if (saved) {
        const parsed = JSON.parse(saved)
        const validated = validateStoredMessages(parsed)
        return validated || []
      }
    } catch { /* empty */ }
    return []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [language, setLanguage] = useState('es')
  const [showKb, setShowKb] = useState(false)
  const [pyStatus, setPyStatus] = useState('initializing')
  const [pyProgress, setPyProgress] = useState(0)
  const [kbStats, setKbStats] = useState({ documentCount: 0 })

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const dropRef = useRef(null)

  const memoryRef = useRef(new ConversationMemory())
  const pyRef = useRef(null)
  const kbRef = useRef(null)
  const importerRef = useRef(null)
  const engineRef = useRef(null)

  // ═══════════════════════════════════════════════════════════════
  // EAGER BACKGROUND BOOT — runs on mount, not gated by isOpen
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (bootSystemRef.current) return
    const debugMode = window.location.search.includes('debug=true')
    const boot = new NephiBootSystem()
    bootSystemRef.current = boot

    boot.setProgressCallback((progress) => {
      setPyProgress(progress.overallPercent)
      setLoadingText(debugMode ? `[${progress.stage}] ${progress.message}` : progress.message)
    })

    boot.boot(debugMode).then((result) => {
      if (result.systemState === 'SYSTEM_READY') {
        setPyStatus('ready')
        setPyProgress(100)
        setLoadingText('')
      } else if (result.systemState === 'FAILED_SAFE_STATE') {
        setPyStatus('error')
        setLoadingText(`Boot failed at stage: ${(result.stages.find(s => s.status === 'FAILED') || {}).stage || 'unknown'}`)
      } else {
        setPyStatus('local')
        setPyProgress(100)
        setLoadingText('')
      }

      const py = getPyBridge()
      const kb = getKB()
      pyRef.current = py
      kbRef.current = kb

      if (!importerRef.current) {
        const importer = new DocumentImporter(kb, py)
        importerRef.current = importer
        importer.getExtraResources().catch(() => {})
      }

      const engine = getEngine(memoryRef.current, debugMode)
      engineRef.current = engine
      engine.init().catch(() => {})

      kb.getStats().then(stats => setKbStats(stats)).catch(() => {})

      if (memoryRef.current.interactionCount === 0) {
        const lang = getBrowserLanguage()
        const welcome = assembleResponse('WELCOME', {}, userContext || {}, budgetData || [], memoryRef.current, '', lang)
        setMessages([{ role: 'assistant', content: welcome, id: Date.now() }])
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ═══════════════════════════════════════════════════════════════
  // OPEN-ONLY: focus input
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  // ═══════════════════════════════════════════════════════════════
  // SCROLL + PERSISTENCE effects (always active)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    try { localStorage.setItem('ai_messages', JSON.stringify(messages.slice(-50))) } catch { /* empty */ }
  }, [messages])

  async function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    if (!importerRef.current) {
      const lang = language
      setMessages(prev => [...prev, {
        role: 'assistant', content: lang === 'es'
          ? '⏳ El sistema se está inicializando. Espera un momento y vuelve a intentar.'
          : '⏳ System is initializing. Please wait a moment and try again.',
        id: Date.now(),
      }])
      return
    }

    setIsLoading(true)
    for (const file of files) {
      setLoadingText(`Importando: ${file.name}...`)
      await importerRef.current.importFromFile(file, (pct, msg) => {
        setLoadingText(msg || `Procesando: ${pct}%`)
      })
      const lang = language
      setMessages(prev => [...prev, {
        role: 'assistant', content: lang === 'es'
          ? `✅ **Documento importado:** "${file.name}" — el contenido ha sido agregado a mi base de conocimiento.`
          : `✅ **Document imported:** "${file.name}" — content has been added to my knowledge base.`,
        id: Date.now(),
      }])
    }
    const stats = await kbRef.current.getStats()
    setKbStats(stats)
    setLoadingText('')
    setIsLoading(false)
  }

  async function sendMessage(text) {
    const userText = sanitizeMessage((text || input).trim())
    if (!userText || isLoading) return

    const validation = validateChatMessage(userText)
    if (!validation.valid) return

    const detectedLang = detectLanguage(userText)
    setLanguage(detectedLang)
    memoryRef.current.setLanguage(detectedLang)

    const userMsg = { role: 'user', content: userText, id: performance.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400))

      const engine = engineRef.current
      if (!engine) {
        setMessages(prev => [...prev, {
          role: 'assistant', content: detectedLang === 'es'
            ? '⏳ El sistema se está iniciando. Por favor espera un momento...'
            : '⏳ The system is starting up. Please wait a moment...',
          id: performance.now(),
        }])
        setIsLoading(false)
        return
      }

      await engine.init()
      const analysis = engine.processMessage(userContext || {}, budgetData || [], userText)
      const lang = detectedLang
      const reply = assembleResponse(
        analysis.stage, analysis, userContext || {}, budgetData || [], memoryRef.current, userText, lang
      )

      memoryRef.current.recordInteraction('assistant', reply, analysis.stage)

      setMessages(prev => [...prev, { role: 'assistant', content: reply, id: performance.now() }])

      if (analysis.stage === 'PLAN_BUILD' || analysis.stage === 'PLAN_REVIEW') {
        memoryRef.current.updatePlanProgress('needs', 100)
      }
    } catch (err) {
      const lang = language
      setMessages(prev => [...prev, {
        role: 'assistant', content: lang === 'es'
          ? `⚠️ Ocurrió un error: ${err.message}`
          : `⚠️ An error occurred: ${err.message}`,
        id: performance.now(),
      }])
    } finally {
      setIsLoading(false)
      setLoadingText('')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function clearChat() {
    memoryRef.current.reset()
    setMessages([])
    try { localStorage.removeItem('ai_messages') } catch { /* empty */ }
    const lang = language
    const welcome = buildWelcomeMessage(memoryRef.current, userContext || {}, lang)
    setMessages([{ role: 'assistant', content: welcome, id: Date.now() }])
  }

  return (
    <>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.5);opacity:0} }
      `}</style>

      <div className="no-print" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
        {!isOpen && (
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'var(--color-primary)', animation: 'pulseRing 2s ease-out infinite',
            }} />
            <button onClick={onToggle} title="Nephi Dev Agent"
              style={{
                width: 60, height: 60, borderRadius: '50%',
                background: pyStatus === 'initializing'
                  ? 'conic-gradient(var(--color-primary) ' + pyProgress + '%, var(--color-border) ' + pyProgress + '%)'
                  : 'linear-gradient(135deg, var(--color-primary-darker), var(--color-primary))',
                border: '3px solid white', boxShadow: 'var(--shadow-lg)',
                color: 'white', fontSize: '1.5rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >{pyStatus === 'initializing' ? pyProgress + '%' : '🤖'}</button>
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem',
              background: 'var(--color-primary-darker)', color: 'white',
              padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-sm)',
            }}>
              {pyStatus === 'initializing'
                ? (language === 'es' ? `Inicializando ${pyProgress}%` : `Initializing ${pyProgress}%`)
                : '⚡ Nephi Dev Agent'}
            </div>

            {/* Thin progress bar under the bubble */}
            {pyStatus === 'initializing' && (
              <div style={{
                position: 'absolute', bottom: '-6px', left: '4px', right: '4px',
                height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pyProgress}%`,
                  background: 'var(--color-primary)', borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="no-print" style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: 'min(420px, calc(100vw - 2rem))', height: 'min(600px, calc(100vh - 4rem))',
          background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
          zIndex: 1000, animation: 'slideUp 0.25s ease-out',
          border: '1px solid var(--color-border)', overflow: 'hidden',
        }} ref={dropRef}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary-darker), var(--color-primary))',
            padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
              }}>🤖</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.2 }}>Nephi Dev Agent</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>
                  {pyStatus === 'ready'
                    ? `🟢 ${language === 'es' ? 'Motor de razonamiento activo' : 'Reasoning engine active'}`
                    : pyStatus === 'initializing'
                      ? `🟡 ${language === 'es' ? `Inicializando base de conocimiento... ${pyProgress}%` : `Initializing knowledge base... ${pyProgress}%`}`
                      : pyStatus === 'error'
                        ? `🔴 ${language === 'es' ? `Error: ${loadingText || 'inicialización fallida'}` : `Error: ${loadingText || 'initialization failed'}`}`
                        : `🟠 ${language === 'es' ? 'Modo local' : 'Local mode'}`}
                  {kbStats.documentCount > 0 && ` · 📚 ${kbStats.documentCount}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {[
                { icon: '📚', action: () => setShowKb(s => !s), title: 'Knowledge Base' },
                { icon: '🔄', action: clearChat, title: 'New chat' },
                { icon: '✕', action: onToggle, title: 'Close' },
              ].map(({ icon, action, title }) => (
                <button key={icon} onClick={action} title={title} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  color: 'white', cursor: 'pointer', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{icon}</button>
              ))}
            </div>
          </div>

          {userContext?.name && (
            <div style={{
              background: '#eaf8ee', borderBottom: '1px solid var(--color-border)',
              padding: '0.4rem 1.25rem', flexShrink: 0,
            }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-success)', fontWeight: 600 }}>
                ✅ {userContext.name} — {userContext.location || 'Honduras'}
                {engineRef.current && ` · ${memoryRef.current.overallPlanProgress}% plan`}
              </span>
            </div>
          )}

          {showKb && (
            <KnowledgeBasePanel
              kb={kbRef.current}
              closePanel={() => setShowKb(false)}
              language={language}
            />
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column' }}
            onDragOver={e => { if (showKb) return; e.preventDefault(); e.currentTarget.style.background = 'var(--color-bg-light)' }}
            onDragLeave={e => { e.currentTarget.style.background = '' }}
            onDrop={e => { if (showKb) return; handleDrop(e); e.currentTarget.style.background = '' }}
          >
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                <p>{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
              </div>
            ) : messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
            {isLoading && <TypingIndicator text={loadingText} language={language} />}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div style={{
              padding: '0.5rem 1.25rem', borderTop: '1px solid var(--color-border)',
              display: 'flex', flexWrap: 'wrap', gap: '0.375rem', flexShrink: 0,
              background: 'var(--color-white)',
            }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p[language] || p.es)}
                  style={{
                    padding: '0.3rem 0.625rem', border: '1px solid var(--color-border-dark)',
                    borderRadius: '999px', background: 'var(--color-white)',
                    color: 'var(--color-text-subdued)', fontSize: '0.68rem',
                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-white)'; e.currentTarget.style.color = 'var(--color-text-subdued)'; e.currentTarget.style.borderColor = 'var(--color-border-dark)' }}
                >{p[language] || p.es}</button>
              ))}
            </div>
          )}

          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-white)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} rows={1} disabled={isLoading}
                placeholder={language === 'es' ? 'Escribe tu pregunta... (o arrastra un PDF)' : 'Type your question... (or drag a PDF)'}
                style={{
                  flex: 1, padding: '0.625rem 0.875rem',
                  border: '1px solid var(--color-border-dark)', borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem', resize: 'none', fontFamily: 'var(--font-base)',
                  lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto', outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border-dark)' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px' }}
              />
              <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none',
                  background: input.trim() && !isLoading ? 'var(--color-primary)' : 'var(--color-border)',
                  color: 'white', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0, transition: 'background 0.2s',
                }}
              >{isLoading ? '⏳' : '➤'}</button>
            </div>
            <p style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', marginTop: '0.375rem', textAlign: 'center' }}>
              {language === 'es' ? 'Enter para enviar · Shift+Enter nueva línea · Arrastra PDFs para importar' : 'Enter to send · Shift+Enter new line · Drag PDFs to import'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
