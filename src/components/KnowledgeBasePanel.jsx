import { useState, useEffect, useRef } from 'react'

const TABS = { browse: '📂', import: '📥', resources: '🗂️' }

export default function KnowledgeBasePanel({ kb, closePanel, language }) {
  const lang = language || 'es'
  const [tab, setTab] = useState('browse')
  const [documents, setDocuments] = useState([])
  const [resources, setResources] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importMsg, setImportMsg] = useState('')
  const [stats, setStats] = useState({ documentCount: 0, resourceCount: 0, templateCount: 0, patternCount: 0 })
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    loadData()
    const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation() }
    const dropEl = dropRef.current
    if (dropEl) {
      dropEl.addEventListener('dragover', preventDefaults)
      dropEl.addEventListener('dragenter', preventDefaults)
      return () => {
        dropEl.removeEventListener('dragover', preventDefaults)
        dropEl.removeEventListener('dragenter', preventDefaults)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    if (!kb) return
    try {
      const docs = await kb.getDocuments()
      setDocuments(docs)
      const res = await kb.getResources()
      setResources(res)
      const s = await kb.getStats()
      setStats(s)
    } catch (e) {
      console.warn('Failed to load knowledge base:', e)
    }
  }

  async function handleFileUpload(e) {
    const files = e.target.files || e.dataTransfer?.files
    if (!files || files.length === 0) return
    setIsImporting(true)
    setImportProgress(0)

    try {
      for (const file of files) {
        setImportMsg(lang === 'es' ? `Importando: ${file.name}` : `Importing: ${file.name}`)
        const { DocumentImporter } = await import('../ai/index.js')
        const importer = new DocumentImporter(kb, null)
        await importer.importFromFile(file, (pct, msg) => {
          setImportProgress(pct)
          if (msg) setImportMsg(msg)
        })
      }
      setImportProgress(100)
      setImportMsg(lang === 'es' ? 'Importación completada' : 'Import complete')
      await loadData()
    } catch (e) {
      setImportMsg(lang === 'es' ? `Error: ${e.message}` : `Error: ${e.message}`)
    } finally {
      setTimeout(() => { setIsImporting(false); setImportProgress(0); setImportMsg('') }, 2000)
    }
  }

  async function handleUrlImport() {
    if (!importUrl.trim()) return
    setIsImporting(true)
    setImportProgress(0)

    try {
      setImportMsg(lang === 'es' ? `Importando: ${importUrl}` : `Importing: ${importUrl}`)
      const { DocumentImporter } = await import('../ai/index.js')
      const importer = new DocumentImporter(kb, null)
      await importer.importFromUrl(importUrl, (pct, msg) => {
        setImportProgress(pct)
        if (msg) setImportMsg(msg)
      })
      setImportProgress(100)
      setImportMsg(lang === 'es' ? 'Importación completada' : 'Import complete')
      setImportUrl('')
      await loadData()
    } catch (e) {
      setImportMsg(lang === 'es' ? `Error: ${e.message}` : `Error: ${e.message}`)
    } finally {
      setTimeout(() => { setIsImporting(false); setImportProgress(0); setImportMsg('') }, 2000)
    }
  }

  async function handleDeleteDoc(id) {
    if (!kb) return
    try {
      await kb.deleteDocument(id)
      await loadData()
    } catch (e) {
      console.warn('Delete failed:', e)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } })
    }
  }

  const filteredDocs = documents.filter(d =>
    !searchQuery || (d.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{
      background: 'var(--color-white)', borderTop: '1px solid var(--color-border)',
      padding: '0.75rem 1.25rem', flexShrink: 0, maxHeight: '45%', overflow: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
          📚 {lang === 'es' ? 'Base de Conocimiento' : 'Knowledge Base'}
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
            {stats.documentCount} {lang === 'es' ? 'docs' : 'docs'} · {stats.resourceCount} {lang === 'es' ? 'recursos' : 'resources'}
          </span>
        </span>
        <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-text-muted)' }}>✕</button>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
        {Object.entries(TABS).map(([key, emoji]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '0.3rem 0', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            background: tab === key ? 'var(--color-primary)' : 'var(--color-bg)',
            color: tab === key ? 'white' : 'var(--color-text-subdued)', fontSize: '0.8rem', fontWeight: 600,
          }}>{emoji} {key === 'browse' ? (lang === 'es' ? 'Explorar' : 'Browse') : key === 'import' ? (lang === 'es' ? 'Importar' : 'Import') : (lang === 'es' ? 'Recursos' : 'Resources')}</button>
        ))}
      </div>

      {tab === 'browse' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem', overflow: 'auto' }}>
          <input placeholder={lang === 'es' ? 'Buscar documentos...' : 'Search documents...'} value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--color-border-dark)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {filteredDocs.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
                {lang === 'es' ? 'No hay documentos importados' : 'No imported documents'}
              </p>
            ) : filteredDocs.slice(-20).reverse().map(doc => (
              <div key={doc.id} style={{
                padding: '0.375rem 0.5rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                    {doc.category} · {doc.sourceType} · {new Date(doc.dateImported).toLocaleDateString()}
                  </div>
                  {doc.summary && <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subdued)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.summary}</div>}
                </div>
                <button onClick={() => handleDeleteDoc(doc.id)} style={{
                  background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.7rem', padding: '0.125rem', flexShrink: 0,
                }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'import' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          ref={dropRef} onDrop={handleDrop}
        >
          <div style={{
            border: '2px dashed var(--color-border-dark)', borderRadius: 'var(--radius-md)',
            padding: '1.25rem', textAlign: 'center', cursor: 'pointer',
            background: isImporting ? 'var(--color-bg)' : 'var(--color-white)',
          }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.currentTarget.style.background = 'var(--color-bg-light)' }}
            onDragLeave={e => { e.currentTarget.style.background = '' }}
          >
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.csv,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📄</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subdued)', margin: 0 }}>
              {lang === 'es' ? 'Arrastra archivos aquí o haz clic para seleccionar' : 'Drag files here or click to select'}
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
              PDF, TXT, CSV, JSON
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <input value={importUrl} onChange={e => setImportUrl(e.target.value)}
              placeholder={lang === 'es' ? 'O pega un enlace web...' : 'Or paste a web link...'}
              style={{ flex: 1, padding: '0.3rem 0.5rem', border: '1px solid var(--color-border-dark)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}
            />
            <button onClick={handleUrlImport} disabled={!importUrl.trim() || isImporting}
              style={{
                padding: '0.3rem 0.75rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: importUrl.trim() && !isImporting ? 'var(--color-primary)' : 'var(--color-border)', color: 'white', fontSize: '0.75rem', fontWeight: 600,
              }}
            >{lang === 'es' ? 'Importar' : 'Import'}</button>
          </div>

          {isImporting && (
            <div>
              <div style={{
                height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden',
              }}>
                <div style={{ height: '100%', width: `${importProgress}%`, background: 'var(--color-primary)', transition: 'width 0.3s' }} />
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>{importMsg}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'resources' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem', overflow: 'auto' }}>
          {resources.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
              {lang === 'es' ? 'No hay recursos cargados' : 'No resources loaded'}
            </p>
          ) : resources.map((res, i) => (
            <div key={res.id || i} style={{
              padding: '0.375rem 0.5rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>{res.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{res.description}</div>
              {res.contact && <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>📞 {res.contact}</div>}
              {res.tags && <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.125rem', flexWrap: 'wrap' }}>
                {(res.tags || []).map(t => (
                  <span key={t} style={{ background: 'var(--color-accent)', color: 'var(--color-primary-darker)', padding: '0.0625rem 0.375rem', borderRadius: '999px', fontSize: '0.6rem', fontWeight: 600 }}>{t}</span>
                ))}
              </div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
