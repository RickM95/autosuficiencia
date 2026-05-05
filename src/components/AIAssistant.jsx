import { useState, useRef, useEffect } from 'react'
import {
  ConversationMemory, buildWelcomeMessage,
  detectLanguage,
} from '../ai/index.js'
import { validateChatMessage, sanitizeMessage, validateStoredMessages } from '../ai/SecurityGuard.js'
import { extractFormDataFromMemory, formatFormUpdateMessage } from '../ai/formFiller.js'
import DebugPanel from './DebugPanel.jsx'

function inlineMd(text) {
  if (!text) return null
  const parts = []
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let lastIndex = 0
  let match
  let k = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(<span key={k++}>{text.slice(lastIndex, match.index)}</span>)
    if (match[1] !== undefined) parts.push(<strong key={k++} style={{ fontWeight: 700 }}>{match[1]}</strong>)
    else if (match[2] !== undefined) parts.push(<em key={k++}>{match[2]}</em>)
    else if (match[3] !== undefined) parts.push(<code key={k++} style={{ background: 'rgba(0,0,0,0.07)', padding: '0 3px', borderRadius: 3, fontFamily: 'monospace', fontSize: '0.85em' }}>{match[3]}</code>)
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(<span key={k++}>{text.slice(lastIndex)}</span>)
  return parts.length > 0 ? parts : text
}

function renderMarkdown(text) {
  if (!text) return []
  const lines = text.split('\n')
  const elements = []
  let key = 0
  for (const line of lines) {
    if (line.trim() === '') { elements.push(<div key={key++} style={{ height: '0.35rem' }} />); continue }
    if (/^#{1,3}\s/.test(line)) {
      elements.push(<div key={key++} style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>{inlineMd(line.replace(/^#{1,3}\s/, ''))}</div>)
      continue
    }
    if (/^[-*]\s/.test(line)) {
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.2rem', marginBottom: '0.1rem' }}>
          <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>•</span>
          <span>{inlineMd(line.slice(2))}</span>
        </div>
      )
      continue
    }
    const numMatch = line.match(/^(\d+)[.)]\s(.*)/)
    if (numMatch) {
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.2rem', marginBottom: '0.1rem' }}>
          <span style={{ color: 'var(--color-primary)', flexShrink: 0, fontWeight: 600, minWidth: '1.2rem' }}>{numMatch[1]}.</span>
          <span>{inlineMd(numMatch[2])}</span>
        </div>
      )
      continue
    }
    elements.push(<div key={key++} style={{ marginBottom: '0.05rem' }}>{inlineMd(line)}</div>)
  }
  return elements
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  const isPlan = msg.role === 'assistant' && msg.content && msg.content.startsWith('╔')
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
        }}>N</div>
      )}
      <div style={{
        maxWidth: '80%', padding: '0.75rem 1rem',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--color-primary)' : 'var(--color-white)',
        color: isUser ? 'white' : 'var(--color-text)',
        boxShadow: 'var(--shadow-sm)', fontSize: '0.875rem', lineHeight: 1.6,
        border: isUser ? 'none' : '1px solid var(--color-border)',
        fontFamily: isPlan ? 'monospace' : 'inherit',
      }}>
        {isUser || isPlan
          ? <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          : renderMarkdown(msg.content)
        }
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

export default function AIAssistant({ userContext, budgetData, isOpen, onToggle, setFormData }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_messages')
      if (saved) {
        const parsed = JSON.parse(saved)
        const validated = validateStoredMessages(parsed)
        return validated || []
      }
    } catch { }
    return []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [language, setLanguage] = useState('es')
  const [debugMode, setDebugMode] = useState(false)
  const [lastDebugData, setLastDebugData] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const memoryRef = useRef(new ConversationMemory())
  const workerRef = useRef(null)

  const languageRef = useRef(language)
  const debugModeRef = useRef(debugMode)
  const userContextRef = useRef(userContext)
  const budgetDataRef = useRef(budgetData)
  const setFormDataRef = useRef(setFormData)

  useEffect(() => { languageRef.current = language }, [language])
  useEffect(() => { debugModeRef.current = debugMode }, [debugMode])
  useEffect(() => { userContextRef.current = userContext }, [userContext])
  useEffect(() => { budgetDataRef.current = budgetData }, [budgetData])
  useEffect(() => { setFormDataRef.current = setFormData }, [setFormData])

  const dataVersionRef = useRef(Date.now())

  useEffect(() => {
    dataVersionRef.current = Date.now()
    const worker = workerRef.current
    if (worker) {
      worker.postMessage({
        action: 'SYNC_STATE',
        payload: {
          formData: userContext || {},
          budgetData: budgetData || [],
          userContext: userContext || {},
          version: dataVersionRef.current
        }
      })
    }
  }, [userContext, budgetData])

  function restartWorker() {
    const oldWorker = workerRef.current
    if (oldWorker) oldWorker.terminate()

    const worker = new Worker(
      new URL('../ai/aiWorker.js', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    worker.postMessage({
      action: 'SYNC_STATE',
      payload: {
        formData: userContextRef.current || {},
        budgetData: budgetDataRef.current || [],
        userContext: userContextRef.current || {},
        version: Date.now()
      }
    })
    worker.postMessage({ action: 'INIT' })

    worker.onmessage = (e) => {
      const { type, payload } = e.data

      switch (type) {
        case 'onVersionedResponse': {
          const reply = payload.response
          memoryRef.current.recordInteraction('assistant', reply, 'CONVERSATION')
          setMessages(prev => [...prev, { role: 'assistant', content: reply, id: performance.now() }])
          setIsLoading(false)
          setLoadingText('')

          const currentUC = userContextRef.current || {}
          const formUpdates = extractFormDataFromMemory(memoryRef.current, currentUC)
          const currentSetFormData = setFormDataRef.current
          if (currentSetFormData && Object.keys(formUpdates).length > 0) {
            currentSetFormData(prev => ({ ...prev, ...formUpdates }))
            const updateMsg = formatFormUpdateMessage(formUpdates, languageRef.current)
            if (updateMsg) {
              setMessages(prev => [...prev, { role: 'assistant', content: updateMsg, id: performance.now() + 1, isFillNotice: true }])
            }
          }
          break
        }
        case 'onResponse':
          setIsLoading(false)
          setLoadingText('')
          break
        case 'onThinking':
          setLoadingText(payload || 'Pensando...')
          break
        case 'onError':
          setIsLoading(false)
          setLoadingText('')
          break
        case 'onDataUpdate':
          break
        case 'onDebug':
          if (debugModeRef.current) setLastDebugData(prev => ({ ...prev, worker: payload }))
          break
        case 'INIT_COMPLETE':
          break
        case 'MEMORY_CLEARED':
          break
        case 'DOCUMENT_IMPORTED':
          setIsLoading(false)
          setLoadingText('')
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: payload.success
              ? (languageRef.current === 'es' ? `✅ **Documento importado:** "${payload.name}"` : `✅ **Document imported:** "${payload.name}"`)
              : (languageRef.current === 'es' ? `⚠️ Error al importar: "${payload.name}"` : `⚠️ Error importing: "${payload.name}"`),
            id: Date.now(),
          }])
          break
      }
    }

    worker.onerror = (err) => {
      setIsLoading(false)
      setLoadingText('')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: languageRef.current === 'es'
          ? '⚠️ El worker se detuvo. Reintentando...'
          : '⚠️ Worker stopped. Retrying...',
        id: Date.now(),
      }])
      restartWorker()
    }

    return worker
  }

  useEffect(() => {
    if (workerRef.current) return

    const worker = restartWorker()

    const debugModeActive = typeof window !== 'undefined' && window.location.search.includes('debug=true')
    setDebugMode(debugModeActive)

    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'd') {
        setDebugMode(prev => !prev)
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      worker.terminate()
      workerRef.current = null
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus()
  }, [isLoading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    try { localStorage.setItem('ai_messages', JSON.stringify(messages.slice(-50))) } catch { }
  }, [messages])

  async function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    const worker = workerRef.current
    if (!worker) {
      setMessages(prev => [...prev, {
        role: 'assistant', content: languageRef.current === 'es'
          ? '⏳ El sistema se está iniciando. Espera un momento y vuelve a intentar.'
          : '⏳ System is initializing. Please wait a moment and try again.',
        id: Date.now(),
      }])
      return
    }

    setIsLoading(true)
    for (const file of files) {
      setLoadingText(`Importando: ${file.name}...`)
      worker.postMessage({ action: 'IMPORT_DOCUMENT', payload: { file } })
    }
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
      await new Promise(r => requestAnimationFrame(r))

      const worker = workerRef.current
      if (!worker) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: detectedLang === 'es'
            ? '⏳ El sistema se está iniciando. Por favor espera un momento...'
            : '⏳ The system is starting up. Please wait a moment...',
          id: performance.now(),
        }])
        setIsLoading(false)
        return
      }

      worker.postMessage({
        action: 'PROCESS_MESSAGE',
        payload: {
          userMessage: userText,
          formData: userContextRef.current || {},
          budgetData: budgetDataRef.current || [],
          userContext: userContextRef.current || {},
          version: dataVersionRef.current
        }
      })
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: languageRef.current === 'es'
          ? `⚠️ Ocurrió un error: ${err.message}`
          : `⚠️ An error occurred: ${err.message}`,
        id: performance.now(),
      }])
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function clearChat() {
    memoryRef.current.reset()
    setMessages([])
    try { localStorage.removeItem('ai_messages') } catch { }
    const lang = languageRef.current
    const welcome = buildWelcomeMessage(memoryRef.current, userContextRef.current || {}, lang)
    setMessages([{ role: 'assistant', content: welcome, id: Date.now() }])

    const worker = workerRef.current
    if (worker) worker.postMessage({ action: 'CLEAR_MEMORY' })
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
            <button onClick={onToggle} title="Nephi — Asesor AS"
              style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary-darker), var(--color-primary))',
                border: '3px solid white', boxShadow: 'var(--shadow-lg)',
                color: 'white', fontSize: '1.5rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >🤖</button>
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem',
              background: 'var(--color-primary-darker)', color: 'white',
              padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-sm)',
            }}>
              🧠 Nephi — Asesor AS
            </div>
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
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary-darker), var(--color-primary))',
            padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
              }}>🧠</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.2 }}>Nephi — Asesor AS</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>
                  🟢 Worker activo
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {[
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

          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column'
          }}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'var(--color-bg-light)' }}
            onDragLeave={e => { e.currentTarget.style.background = '' }}
            onDrop={e => { handleDrop(e); e.currentTarget.style.background = '' }}
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
                <button key={i} onClick={() => { sendMessage(p[language] || p.es) }}
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
      {debugMode && <DebugPanel debugData={lastDebugData} />}
    </>
  )
}
