import { useState, useEffect, useRef } from 'react'
import { CurrencyProvider, useCurrency } from './components/CurrencyContext'
import Header from './components/Header'
import BudgetCalculator, { CATEGORIES_BASE } from './components/BudgetCalculator'
import SelfSufficiencyForm from './components/SelfSufficiencyForm'
import SelfSufficiencyPlan from './components/SelfSufficiencyPlan'
import AIAssistant from './components/AIAssistant'
import AdditionalResources from './components/AdditionalResources'
import FoodSelfSufficiencySystem from './components/FoodSelfSufficiencySystem'
import { matchResources } from './components/resourceMatcher'
import { canAccessPlan, canAccessSurvey, sanitizeFormData } from './ai/SecurityGuard.js'
import './App.css'

const PLAN_LIBRARY_KEY = 'ss_plan_library'
const ACTIVE_BUDGET_KEY = 'ss_active_budget'
const ACTIVE_FORM_KEY = 'ss_active_form'

function loadPlanLibrary() {
  try { return JSON.parse(localStorage.getItem(PLAN_LIBRARY_KEY)) || [] } catch { return [] }
}

function loadActiveBudget() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACTIVE_BUDGET_KEY))
    if (saved) return saved
  } catch { /* empty */ }
  return {
    categories: CATEGORIES_BASE.map(c => ({ ...c, items: c.items.map(i => ({ ...i })) })),
    incomeSources: [{ id: 1, label: 'Trabajo principal / Main Job', amount: '' }],
    location: 'HN',
    householdSize: 1,
    notes: ''
  }
}

function loadActiveForm() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_FORM_KEY)) || {} } catch { return {} }
}

// ─── Plan Library Screen ──────────────────────────────────────────────────────
function PlanLibrary({ plans, onView, onPrint, onDelete, onClearAll, onNewSession }) {
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            📚 Biblioteca de Planes <span style={{ opacity: 0.5, fontWeight: 400, fontSize: '0.85em' }}>/ Plan Library</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
            {plans.length === 0
              ? 'No hay planes guardados aún. / No plans saved yet.'
              : `${plans.length} plan${plans.length !== 1 ? 'es' : ''} guardado${plans.length !== 1 ? 's' : ''} / ${plans.length} plan${plans.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={onNewSession}
          >
            ➕ Nueva Evaluación / New Assessment
          </button>
          {plans.length > 0 && (
            confirmClear ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fef2f2', border: '1px solid #f87171', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>¿Borrar todo? / Delete all?</span>
                <button onClick={() => { onClearAll(); setConfirmClear(false) }}
                  style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                  Sí / Yes
                </button>
                <button onClick={() => setConfirmClear(false)}
                  style={{ background: 'var(--color-border)', border: 'none', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                style={{ background: 'none', border: '1.5px solid #f87171', color: '#dc2626', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
              >
                🗑️ Admin: Borrar Todo / Clear All
              </button>
            )
          )}
        </div>
      </div>

      {plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-white)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-border)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>Sin planes aún / No plans yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Completa una evaluación para generar el primer plan.<br />
            <em>Complete an assessment to generate the first plan.</em>
          </p>
          <button className="btn btn-accent btn-lg" onClick={onNewSession}>
            🎯 Comenzar / Start
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {plans.map((plan, idx) => {
            const date = new Date(plan.timestamp)
            const dateStr = date.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
            const timeStr = date.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })
            return (
              <div key={plan.id} style={{
                background: 'var(--color-white)', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)',
                overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              >
                {/* Card header */}
                <div style={{ background: 'linear-gradient(135deg, var(--color-primary-darker), var(--color-primary))', padding: '1rem 1.25rem', color: 'white' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>👤</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>{plan.name || 'Sin nombre'}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem' }}>Plan #{idx + 1}</div>
                </div>
                {/* Card body */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    📅 {dateStr} · ⏰ {timeStr}
                  </div>
                  {plan.formData?.location && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      📍 {plan.formData.location === 'US' ? 'Estados Unidos' : 'Honduras'}
                    </div>
                  )}
                  {plan.formData?.householdSize && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      👨‍👩‍👧 {plan.formData.householdSize} persona{plan.formData.householdSize !== 1 ? 's' : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => onView(plan)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem' }}
                    >
                      👁️ Ver Plan
                    </button>
                    <button
                      onClick={() => onPrint(plan)}
                      style={{ background: 'var(--color-bg-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}
                      title="Imprimir / Print"
                    >
                      🖨️
                    </button>
                    <button
                      onClick={() => onDelete(plan.id)}
                      style={{ background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.65rem', cursor: 'pointer', fontSize: '0.85rem' }}
                      title="Eliminar / Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function MainApp() {
  const [activeTab, setActiveTab] = useState('budget')
  const [tabError, setTabError] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Multi-user plan library
  const [allPlans, setAllPlans] = useState(loadPlanLibrary)

  // Active session: budget
  const [activeBudget, setActiveBudget] = useState(loadActiveBudget)

  // Active session: form
  const [formData, setFormData] = useState(loadActiveForm)

  // Currently viewed plan (when browsing library)
  const [viewingPlan, setViewingPlan] = useState(null)

  // Whether current session has a generated plan
  const [planGenerated, setPlanGenerated] = useState(() => {
    return localStorage.getItem('ss_current_plan') !== null
  })

  const { currency, activeRate } = useCurrency()
  const prevCurrencyRef = useRef(currency)

  // ── Persist active budget
  useEffect(() => {
    localStorage.setItem(ACTIVE_BUDGET_KEY, JSON.stringify(activeBudget))
  }, [activeBudget])

  // ── Persist active form
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(ACTIVE_FORM_KEY, JSON.stringify(formData))
      setLastSaved(new Date())
    }
  }, [formData])

  // ── Sync formData.dependents -> activeBudget.householdSize
  useEffect(() => {
    if (formData.dependents !== undefined && formData.dependents !== '') {
      const size = parseInt(formData.dependents, 10) + 1;
      if (!isNaN(size) && size !== activeBudget.householdSize) {
        setActiveBudget(prev => ({ ...prev, householdSize: size }));
      }
    }
  }, [formData.dependents]);

  // ── Persist plan library
  useEffect(() => {
    localStorage.setItem(PLAN_LIBRARY_KEY, JSON.stringify(allPlans))
  }, [allPlans])

  // ── Currency conversion for budget categories
  useEffect(() => {
    if (prevCurrencyRef.current !== currency) {
      const factor = (prevCurrencyRef.current === 'HNL' && currency === 'USD') ? (1 / activeRate) :
        (prevCurrencyRef.current === 'USD' && currency === 'HNL') ? activeRate : 1
      if (factor !== 1) {
        setActiveBudget(prev => ({
          ...prev,
          categories: prev.categories.map(cat => ({
            ...cat,
            items: cat.items.map(item => ({
              ...item,
              amount: item.amount ? (parseFloat(item.amount) * factor).toFixed(2) : ''
            }))
          })),
          incomeSources: prev.incomeSources.map(src => ({
            ...src,
            amount: src.amount ? (parseFloat(src.amount) * factor).toFixed(2) : ''
          }))
        }))
      }
      prevCurrencyRef.current = currency
    }
  }, [currency, activeRate])

  // ── Tab guard
  function handleSetActiveTab(tab) {
    setTabError('')
    setViewingPlan(null)
    if (tab === 'resources' || tab === 'library') { setActiveTab(tab); return }
    const guard = tab === 'plan'
      ? canAccessPlan(formData)
      : tab === 'survey'
        ? canAccessSurvey(formData)
        : { allowed: true, reason: '' }
    if (!guard.allowed) { setTabError(guard.reason); return }
    setActiveTab(tab)
  }

  // ── Generate plan: save to library AND mark session complete
  function handleGeneratePlan() {
    if (!formData.name || !formData.name.trim()) {
      setTabError('El nombre es requerido antes de generar el plan / Name is required before generating the plan.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const mergedData = { 
      ...formData, 
      country: activeBudget.location, 
      householdSize: activeBudget.householdSize 
    };
    const sanitized = sanitizeFormData(mergedData)
    setFormData(sanitized)

    const newPlan = {
      id: `plan_${Date.now()}`,
      name: sanitized.name || 'Sin nombre',
      timestamp: new Date().toISOString(),
      formData: sanitized,
      budgetSnapshot: activeBudget,
    }

    setAllPlans(prev => [...prev, newPlan])
    localStorage.setItem('ss_current_plan', JSON.stringify(sanitized))
    setPlanGenerated(true)
    setActiveTab('plan')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Start a completely new session (keeps library intact)
  function handleNewSession() {
    const freshBudget = {
      categories: CATEGORIES_BASE.map(c => ({ ...c, items: c.items.map(i => ({ ...i, amount: '' })) })),
      incomeSources: [{ id: 1, label: 'Trabajo principal / Main Job', amount: '' }],
      location: 'HN',
      householdSize: 1,
      notes: ''
    }
    setActiveBudget(freshBudget)
    setFormData({})
    setPlanGenerated(false)
    setViewingPlan(null)
    localStorage.removeItem(ACTIVE_FORM_KEY)
    localStorage.removeItem('ss_current_plan')
    setActiveTab('budget')
    setTabError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── View a saved plan from library
  function handleViewLibraryPlan(plan) {
    setViewingPlan(plan)
    setActiveTab('plan')
  }

  // ── Print a saved plan
  function handlePrintLibraryPlan(plan) {
    setViewingPlan(plan)
    setActiveTab('plan')
    setTimeout(() => window.print(), 300)
  }

  // ── Delete single plan from library
  function handleDeletePlan(id) {
    setAllPlans(prev => prev.filter(p => p.id !== id))
  }

  // ── Admin clear all plans
  function handleClearAll() {
    setAllPlans([])
    localStorage.removeItem(PLAN_LIBRARY_KEY)
  }

  function handleEditPlan() {
    setPlanGenerated(false)
    setViewingPlan(null)
    setActiveTab('survey')
  }

  function handleFormUpdate(update) {
    setFormData(prev => ({ ...prev, ...update }))
  }

  // The form data shown in the plan view (either live session or library plan)
  const planFormData = viewingPlan ? viewingPlan.formData : formData

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        planCount={allPlans.length}
        onNewSession={handleNewSession}
      />

      {tabError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #f87171', color: '#dc2626',
          padding: '0.75rem 1rem', margin: '0 1rem', borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span>⛔</span>
          <span>{tabError}</span>
          <button onClick={() => setTabError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* ── BUDGET TAB ── */}
      {activeTab === 'budget' && (
        <BudgetCalculator
          budgetData={activeBudget.categories}
          setBudgetData={cats => setActiveBudget(prev => ({ ...prev, categories: typeof cats === 'function' ? cats(prev.categories) : cats }))}
          incomeSources={activeBudget.incomeSources}
          setIncomeSources={srcs => setActiveBudget(prev => ({ ...prev, incomeSources: typeof srcs === 'function' ? srcs(prev.incomeSources) : srcs }))}
          location={activeBudget.location}
          setLocation={loc => setActiveBudget(prev => ({ ...prev, location: typeof loc === 'function' ? loc(prev.location) : loc }))}
          householdSize={activeBudget.householdSize}
          setHouseholdSize={sz => {
            const num = typeof sz === 'function' ? sz(activeBudget.householdSize) : sz;
            setActiveBudget(prev => ({ ...prev, householdSize: num }));
            setFormData(prev => ({ ...prev, dependents: Math.max(0, num - 1) }));
          }}
          notes={activeBudget.notes}
          setNotes={n => setActiveBudget(prev => ({ ...prev, notes: typeof n === 'function' ? n(prev.notes) : n }))}
        />
      )}

      {/* ── SURVEY TAB ── */}
      {activeTab === 'survey' && !planGenerated && (
        <div>
          {lastSaved && (
            <div style={{ textAlign: 'right', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              ✅ Progreso guardado automáticamente / Progress auto-saved ({lastSaved.toLocaleTimeString()})
            </div>
          )}
          <SelfSufficiencyForm
            formData={formData}
            setFormData={handleFormUpdate}
            onComplete={handleGeneratePlan}
            budgetData={activeBudget.categories}
            incomeSources={activeBudget.incomeSources}
          />
        </div>
      )}

      {activeTab === 'survey' && planGenerated && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '0.5rem' }}>¡Plan generado! / Plan generated!</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Tu plan de autosuficiencia ha sido creado y guardado.<br />
              <em>Your self-sufficiency plan has been created and saved.</em>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('plan')}>📄 Ver Plan / View Plan</button>
              <button className="btn btn-ghost" onClick={() => setPlanGenerated(false)}>✏️ Editar / Edit</button>
              <button className="btn btn-accent" onClick={handleNewSession}>🔄 Nuevo Usuario / New User</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN TAB ── */}
      {activeTab === 'plan' && !planGenerated && !viewingPlan && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Aún no hay plan / No plan yet</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Completa la evaluación de autosuficiencia para generar tu plan personalizado.<br />
              <em>Complete the self-sufficiency assessment to generate your personalized plan.</em>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-accent btn-lg" onClick={() => handleSetActiveTab('survey')}>🎯 Comenzar Evaluación / Start Assessment</button>
              {allPlans.length > 0 && (
                <button className="btn btn-ghost" onClick={() => setActiveTab('library')}>📚 Ver Planes Guardados / View Saved Plans</button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plan' && (planGenerated || viewingPlan) && (
        <>
          {viewingPlan && (
            <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-darker)' }}>
                👤 Viendo plan de: <strong>{viewingPlan.name}</strong> · {new Date(viewingPlan.timestamp).toLocaleDateString()}
              </span>
              <button onClick={() => { setViewingPlan(null); setActiveTab('library') }}
                style={{ background: 'none', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                ← Volver a Biblioteca / Back to Library
              </button>
            </div>
          )}
          <SelfSufficiencyPlan formData={planFormData} onEdit={handleEditPlan} />
          {/* Contextual resource CTA */}
          {(() => {
            const loc = planFormData.location === 'US' ? 'US' : 'HN'
            const matched = matchResources({
              location: loc, surplus: 0, tier: planFormData.tier || 'survival',
              householdSize: parseInt(planFormData.householdSize) || 1, categories: [],
              evaluation: { hasDebt: !!planFormData.hasDebt, stressLevel: planFormData.stressLevel || 'low', employmentStatus: planFormData.employmentStatus || '' }
            }, 'ES')
            const top3 = matched.resources.slice(0, 3)
            const CATICONS = { food: '🥗', income: '💼', education: '🎓', health: '🏥', financial: '💰', housing: '🏠', mental: '🧠', utilities: '⚡' }
            return top3.length > 0 ? (
              <div className="recommended-resources-widget" style={{ maxWidth: 860, margin: '0 auto 2rem', padding: '0 1.5rem' }}>
                <div className="recommended-widget-header"><span style={{ fontSize: '1.25rem' }}>🎯</span><h3>Recursos Recomendados para Ti / Recommended for You</h3></div>
                <div className="recommended-priority-msg">{matched.priorityMessage}</div>
                <div className="recommended-cards">
                  {top3.map(r => (
                    <div key={r.id} className="recommended-card">
                      <div className="recommended-card-icon">{CATICONS[r.category] || '📌'}</div>
                      <div className="recommended-card-body">
                        <div className="recommended-card-name">{r.name}</div>
                        <div className="recommended-card-reason">{r.reason}</div>
                        <div className="recommended-card-actions">
                          {r.access?.website && <a href={r.access.website} target="_blank" rel="noopener noreferrer" className="recommended-card-link">🔗 Visitar / Visit</a>}
                          {r.access?.phone && <span className="recommended-card-phone">📞 {r.access.phone}</span>}
                        </div>
                      </div>
                      <span className="recommended-card-tag">{r.tag}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('resources')}>Ver todos los recursos / View all resources →</button>
                </div>
              </div>
            ) : null
          })()}
        </>
      )}

      {/* ── FOOD TAB ── */}
      {activeTab === 'food' && (
        <FoodSelfSufficiencySystem formData={{ ...formData, country: activeBudget.location, householdSize: activeBudget.householdSize }} />
      )}

      {/* ── RESOURCES TAB ── */}
      {activeTab === 'resources' && (
        <AdditionalResources lang="ES" userContext={{ ...formData, country: activeBudget.location }} />
      )}

      {/* ── PLAN LIBRARY TAB ── */}
      {activeTab === 'library' && (
        <PlanLibrary
          plans={allPlans}
          onView={handleViewLibraryPlan}
          onPrint={handlePrintLibraryPlan}
          onDelete={handleDeletePlan}
          onClearAll={handleClearAll}
          onNewSession={() => { handleNewSession(); setActiveTab('survey') }}
        />
      )}

      <AIAssistant
        userContext={formData}
        budgetData={activeBudget.categories}
        setFormData={setFormData}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(o => !o)}
      />
    </div>
  )
}

export default function App() {
  return (
    <CurrencyProvider>
      <MainApp />
    </CurrencyProvider>
  )
}
