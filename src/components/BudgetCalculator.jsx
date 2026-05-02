import { useState, useEffect, useRef } from 'react'
import { useCurrency } from './CurrencyContext'
import { getIncomeTier, getAdjustedModel, getHumanizedFeedback } from './budgetModels'
import { translations as t } from './translations'

const CATEGORIES_BASE = [
  { id: 'tithes', emoji: '🙏', color: '#8e44ad', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'savings', emoji: '💰', color: '#1b8533', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'housing', emoji: '🏠', color: '#0073b9', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'utilities', emoji: '💡', color: '#f39c12', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'food', emoji: '🍽️', color: '#e67e22', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'transport', emoji: '🚗', color: '#27ae60', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'clothing', emoji: '👗', color: '#e91e63', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'health', emoji: '🏥', color: '#e74c3c', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'insurance', emoji: '🛡️', color: '#2c3e50', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'personal', emoji: '🎉', color: '#9b59b6', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'recreation', emoji: '🎭', color: '#34495e', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'debt', emoji: '💳', color: '#c0392b', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'education', emoji: '📚', color: '#3498db', items: [{ id: 1, label: '', amount: '' }] },
  { id: 'other', emoji: '➕', color: '#7f8c8d', items: [{ id: 1, label: '', amount: '' }] },
]

function MoneyDisplay({ amount }) {
  const { fmtDisplay } = useCurrency()
  return (
    <div className="money-display">
      <span className="money-primary">{fmtDisplay(amount)}</span>
    </div>
  )
}

function BudgetCategory({ cat, onUpdate, totalIncome, currentModel, lang, householdSize, tier, location }) {
  const [open, setOpen] = useState(false)
  const { symbol, fmtDisplay } = useCurrency()
  
  const totalActual = cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const actualPct = totalIncome > 0 ? Math.round((totalActual / totalIncome) * 100) : 0
  const modelRange = currentModel?.[cat.id] || [0, 0]
  const rangeLabel = modelRange[0] === modelRange[1] ? `${modelRange[0]}%` : `${modelRange[0]}–${modelRange[1]}%`
  
  const targetPct = cat.targetPct ?? modelRange[0]
  const targetAmount = totalIncome * (targetPct / 100)
  const diff = totalActual - targetAmount

  const feedback = getHumanizedFeedback(cat.id, actualPct, targetPct, modelRange, lang, householdSize, tier, totalActual, totalIncome, location)

  function updateItem(id, field, value) {
    onUpdate(cat.id, { items: cat.items.map(i => i.id === id ? { ...i, [field]: value } : i) })
  }

  function updateTargetPct(val) {
    const num = parseFloat(val) || 0
    onUpdate(cat.id, { targetPct: Math.min(100, Math.max(0, num)) })
  }

  function addItem() {
    const newId = Math.max(...cat.items.map(i => i.id), 0) + 1
    onUpdate(cat.id, { items: [...cat.items, { id: newId, label: '', amount: '' }] })
  }

  function removeItem(id) {
    if (cat.items.length <= 1) return
    onUpdate(cat.id, { items: cat.items.filter(i => i.id !== id) })
  }

  const catName = t[lang].categories[cat.id] || cat.id

  return (
    <div className={`budget-category${totalActual > 0 ? ' has-value' : ''}`} style={{ borderLeftColor: totalActual > 0 ? cat.color : undefined }}>
      <div className="budget-category-header" onClick={() => setOpen(o => !o)}>
        <div className="budget-category-left">
          <span className="budget-category-emoji">{cat.emoji}</span>
          <div className="budget-category-info">
            <div className="budget-category-name">{catName}</div>
            <div className="budget-category-pct no-print">
              <span className={`status-badge status-${feedback.status}`}>{t[lang].status[feedback.status]}</span>
              <span className="rec-hint">{t[lang].recommended}: {rangeLabel}</span>
            </div>
          </div>
        </div>
        <div className="budget-category-right">
          <div className="print-table-row print-only">
            <div className="print-col">{rangeLabel}</div>
            <div className="print-col">{fmtDisplay(targetAmount)}</div>
            <div className="print-col">{fmtDisplay(totalActual)}</div>
            <div className="print-col">{fmtDisplay(diff)}</div>
          </div>

          <div className="budget-category-comparison no-print">
            <div className="comparison-item">
              <span className="comparison-label">{t[lang].target}</span>
              <span className="comparison-value">{fmtDisplay(targetAmount)}</span>
            </div>
            <div className="comparison-item">
              <span className="comparison-label">{t[lang].actual}</span>
              <span className="comparison-value" style={{ color: feedback.status === 'critical' ? 'var(--color-error)' : feedback.status === 'high' ? 'var(--color-warning)' : 'inherit' }}>
                {fmtDisplay(totalActual)}
              </span>
            </div>
          </div>
          <span className={`budget-category-chevron${open ? ' open' : ''} no-print`}>▼</span>
        </div>
      </div>

      {open && (
        <div className="budget-category-body no-print">
          <div className="human-feedback-box">
             <p className="feedback-text">{feedback.explanation}</p>
             <p className="category-explanation" style={{ fontSize: '0.75rem', color: 'var(--color-text-subdued)', marginTop: '0.5rem', fontStyle: 'italic' }}>
               {t[lang].categoryExplanation}
             </p>
          </div>
          
          {cat.id === 'food' && totalIncome > 0 && feedback.costPerPerson && (
            <div className="food-ideal-box" style={{ background: '#fdf3eb', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', borderLeft: '4px solid var(--color-warning)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#b95c00' }}>
                {t[lang].idealFoodBudget} {fmtDisplay(feedback.costPerPerson * householdSize)}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#d35400', marginBottom: '0.5rem' }}>
                {t[lang].foodPerPerson.replace('{amount}', fmtDisplay(feedback.costPerPerson)).replace('{size}', householdSize)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#e67e22', lineHeight: 1.4 }}>
                {t[lang].foodScaleNote}
              </div>
            </div>
          )}
          
          <div className="budget-target-config">
            <div className="form-group" style={{ maxWidth: '180px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>{t[lang].target} %</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  className="form-input"
                  value={Math.round(targetPct)}
                  min={0}
                  max={100}
                  onChange={e => updateTargetPct(e.target.value)}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>

          <div className="budget-line-items">
            {cat.items.map(item => (
              <div key={item.id} className="budget-line-item">
                <input
                  type="text"
                  className="form-input"
                  placeholder={lang === 'ES' ? 'Descripción' : 'Description'}
                  value={item.label}
                  onChange={e => updateItem(item.id, 'label', e.target.value)}
                />
                <div className="input-with-prefix">
                  <span className="input-prefix">{symbol}</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={item.amount}
                    min={0}
                    step={0.01}
                    onChange={e => updateItem(item.id, 'amount', e.target.value)}
                  />
                </div>
                <button className="remove-btn" onClick={() => removeItem(item.id)}>×</button>
              </div>
            ))}
          </div>
          <button className="budget-add-btn" onClick={addItem}>
            {t[lang].addExpense}
          </button>
        </div>
      )}
    </div>
  )
}

function DonutChart({ data, total }) {
  let cumulativePct = 0
  const size = 180
  const radius = 70
  const stroke = 20
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="donut-chart-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, i) => {
          if (item.value <= 0) return null
          const pct = item.value / total
          const dashArray = `${pct * circumference} ${circumference}`
          const dashOffset = -cumulativePct * circumference
          cumulativePct += pct
          return (
            <circle
              key={item.label}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          )
        })}
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" style={{ fontSize: '1.1rem', fill: 'var(--color-text)', fontWeight: 700 }}>
          {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </text>
      </svg>
    </div>
  )
}

export default function BudgetCalculator({ budgetData, setBudgetData }) {
  const { symbol, fmt, fmtDisplay, lang, setLang, displayMode, setDisplayMode, currency, activeRate } = useCurrency()

  const [location, setLocation] = useState('HN')
  const [householdSize, setHouseholdSize] = useState(1)
  const [incomeSources, setIncomeSources] = useState([
    { id: 1, label: 'Trabajo principal / Main Job', amount: '' }
  ])
  const [notes, setNotes] = useState('')
  const [showIncomeSuggestions, setShowIncomeSuggestions] = useState(false)
  const [hasPersonalPlan, setHasPersonalPlan] = useState(false)

  const prevCurrencyRef = useRef(currency)

  useEffect(() => {
    if (prevCurrencyRef.current !== currency) {
      const factor = (prevCurrencyRef.current === 'HNL' && currency === 'USD') ? (1 / activeRate) : 
                     (prevCurrencyRef.current === 'USD' && currency === 'HNL') ? activeRate : 1;
      
      if (factor !== 1) {
        setIncomeSources(prev => prev.map(src => ({
          ...src,
          amount: src.amount ? (parseFloat(src.amount) * factor).toFixed(2) : ''
        })))
      }
      prevCurrencyRef.current = currency
    }
  }, [currency, activeRate])

  const totalIncome = incomeSources.reduce((s, src) => s + (parseFloat(src.amount) || 0), 0)
  const tier = getIncomeTier(location, totalIncome)
  const currentModel = getAdjustedModel(location, tier, householdSize, totalIncome)

  const totalExpenses = budgetData.reduce((sum, cat) =>
    sum + cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), 0)
  const balance = totalIncome - totalExpenses
  
  const [encouragement, setEncouragement] = useState('')

  useEffect(() => {
    if (balance > 10) setEncouragement(t[lang].encouragement.surplus)
    else if (balance < -10) setEncouragement(t[lang].encouragement.deficit)
    else setEncouragement('')
  }, [balance, lang])

  function updateIncomeSource(id, field, value) {
    setIncomeSources(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function addSuggestedIncome(type) {
    const newId = Math.max(...incomeSources.map(s => s.id), 0) + 1
    setIncomeSources([...incomeSources, { id: newId, label: type, amount: '' }])
    setShowIncomeSuggestions(false)
  }

  function removeIncomeSource(id) {
    if (incomeSources.length <= 1) return
    setIncomeSources(incomeSources.filter(s => s.id !== id))
  }

  function updateCategory(catId, update) {
    setBudgetData(prev => prev.map(c => c.id === catId ? { ...c, ...update } : c))
  }

  function autoFill() {
    if (totalIncome <= 0) {
      alert(lang === 'ES' ? "Ingresa tus ingresos primero" : "Enter your income first")
      return
    }
    setBudgetData(prev => prev.map(cat => {
      const modelRange = currentModel?.[cat.id] || [0, 0]
      const targetPct = cat.targetPct ?? modelRange[0]
      const targetAmount = (totalIncome * (targetPct / 100)).toFixed(2)
      const newItems = [...cat.items]
      if (newItems.length > 0) {
        newItems[0] = { ...newItems[0], amount: targetAmount }
      }
      return { ...cat, items: newItems }
    }))
  }

  const chartData = budgetData.map(cat => ({
    label: t[lang].categories[cat.id] || cat.id,
    value: cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0),
    color: cat.color
  })).filter(d => d.value > 0)

  return (
    <div className="budget-calculator-root">
      {/* Premium Print Header */}
      <div className="print-header print-only">
        <div className="print-header-top">
          <div className="print-logo-container">
            <h1 className="print-app-name">{t[lang].appName}</h1>
            <p className="print-motto">{t[lang].appMotto}</p>
          </div>
          <div className="print-header-right">
            <h2>{t[lang].appSub}</h2>
            <div className="print-date">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div className="print-strategy-meta">
          <div className="meta-item"><strong>{t[lang].location}:</strong> {location === 'HN' ? t[lang].hn : t[lang].us}</div>
          <div className="meta-item"><strong>{t[lang].tier}:</strong> {t[lang].tiers[tier]}</div>
          <div className="meta-item"><strong>{t[lang].householdSize}:</strong> {householdSize}</div>
        </div>
      </div>

      <div className="section-hero no-print">
        <h1>{t[lang].appName} <span className="hero-accent">{t[lang].appSub}</span></h1>
        <p>{t[lang].appMotto}</p>
      </div>

      <div className="budget-actions no-print">
        <div className="config-grid">
          <div className="config-group">
            <label className="form-label">{t[lang].lang}</label>
            <select className="form-select" value={lang} onChange={e => setLang(e.target.value)}>
              <option value="ES">Español</option>
              <option value="EN">English</option>
            </select>
          </div>
          <div className="config-group">
            <label className="form-label">{t[lang].currencyMode}</label>
            <select className="form-select" value={displayMode} onChange={e => setDisplayMode(e.target.value)}>
              <option value="HNL">HNL (Lempiras)</option>
              <option value="USD">USD (Dólares)</option>
              <option value="BOTH">{t[lang].both} (L + $)</option>
            </select>
          </div>
          <div className="config-group">
            <label className="form-label">{t[lang].location}</label>
            <select className="form-select" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="HN">{t[lang].hn}</option>
              <option value="US">{t[lang].us}</option>
            </select>
          </div>
          <div className="config-group">
            <label className="form-label">{t[lang].householdSize}</label>
            <select 
              className="form-select" 
              value={householdSize} 
              onChange={e => setHouseholdSize(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="config-group actions-group">
            <button className="btn btn-secondary" onClick={autoFill}>
              {t[lang].autoAssign}
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              {t[lang].print}
            </button>
          </div>
        </div>
        <div className="helper-text">{t[lang].householdHelp}</div>
      </div>

      <div className="budget-layout">
        <div className="budget-main">
          {/* Income Section */}
          <div className="card income-section-print" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon no-print" style={{ background: '#eaf8ee' }}>💵</div>
                <div>
                  <div className="card-title">{t[lang].incomeTitle}</div>
                  <div className="card-subtitle no-print">{t[lang].incomeSub}</div>
                </div>
              </div>
              <div className="card-header-right">
                <div className="print-total-income">{fmtDisplay(totalIncome)}</div>
              </div>
            </div>
            <div className="card-body no-print">
              <div className="budget-line-items">
                {incomeSources.map(src => (
                  <div key={src.id} className="budget-line-item">
                    <input
                      type="text"
                      className="form-input"
                      placeholder={lang === 'ES' ? 'Nombre de ingreso' : 'Income name'}
                      value={src.label}
                      onChange={e => updateIncomeSource(src.id, 'label', e.target.value)}
                    />
                    <div className="input-with-prefix">
                      <span className="input-prefix">{symbol}</span>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={src.amount}
                        min={0}
                        step={0.01}
                        onChange={e => updateIncomeSource(src.id, 'amount', e.target.value)}
                      />
                    </div>
                    <button className="remove-btn" onClick={() => removeIncomeSource(src.id)}>×</button>
                  </div>
                ))}
              </div>
              
              <div className="income-add-container">
                <button className="budget-add-btn" onClick={() => setShowIncomeSuggestions(!showIncomeSuggestions)}>
                  {t[lang].addIncome}
                </button>
                {showIncomeSuggestions && (
                  <div className="income-suggestions-menu">
                    <div className="suggestions-header">{t[lang].suggestedIncomeTitle}</div>
                    <div className="suggestions-list">
                      {t[lang].incomeSuggestions[location].map(type => (
                        <button key={type} className="suggestion-item" onClick={() => addSuggestedIncome(type)}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card-body print-only">
              <div className="income-sources-list">
                {incomeSources.map(src => (
                  <div key={src.id} className="income-source-item">
                    <span className="source-label">{src.label || (lang === 'ES' ? 'Ingreso' : 'Income')}</span>
                    <span className="source-amount">{fmtDisplay(src.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>



          <div className="budget-categories no-print">
            {budgetData.map(cat => (
              <BudgetCategory 
                key={cat.id} 
                cat={cat} 
                onUpdate={updateCategory} 
                totalIncome={totalIncome} 
                currentModel={currentModel} 
                lang={lang} 
                householdSize={householdSize}
                tier={tier}
                location={location}
              />
            ))}
          </div>


          {/* ====== PRINT WORKBOOK SECTIONS ====== */}

          {/* Print Summary Box */}
          <div className="print-summary-box print-only">
            <div className="print-summary-grid">
              <div className="print-summary-chart">
                {totalExpenses > 0 && <DonutChart data={chartData} total={totalExpenses} />}
              </div>
              <div className="print-summary-numbers">
                <div className="print-stat-row">
                  <span>{t[lang].income}</span>
                  <strong>{fmtDisplay(totalIncome)}</strong>
                </div>
                <div className="print-stat-row">
                  <span>{t[lang].expenses}</span>
                  <strong>{fmtDisplay(totalExpenses)}</strong>
                </div>
                <div className={`print-balance-box ${balance < 0 ? 'deficit' : 'surplus'}`}>
                  <span>{balance >= 0 ? t[lang].surplus : t[lang].deficit}</span>
                  <strong>{fmtDisplay(balance)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Print Analysis Table -> Progress Bars */}
          <div className="print-analysis print-only">
            <h3 className="section-title-print">{t[lang].printAnalysisTitle}</h3>
            <div className="print-progress-list">
              {budgetData.map(cat => {
                const catTotal = cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
                if (catTotal === 0) return null
                const pct = totalIncome > 0 ? Math.round((catTotal / totalIncome) * 100) : 0
                const modelRange = currentModel?.[cat.id] || [0, 0]
                const targetPct = cat.targetPct ?? modelRange[0]
                const feedback = getHumanizedFeedback(cat.id, pct, targetPct, modelRange, lang, householdSize, tier, catTotal, totalIncome, location)
                return (
                  <div key={cat.id} className="summary-progress-item print-progress-item">
                    <div className="progress-item-header">
                      <span>{cat.emoji} <strong>{t[lang].categories[cat.id]}</strong> ({pct}%)</span>
                      <span className={`print-status-pill pill-${feedback.status}`}>{t[lang].status[feedback.status]}</span>
                    </div>
                    <div className="progress-bar-track print-track">
                      <div className="progress-bar-fill print-fill" style={{ width: `${Math.min(pct, 100)}%`, background: cat.color }} />
                      <div className="progress-target-marker print-marker" style={{ left: `${targetPct}%` }} />
                    </div>
                    <div className="progress-meta">
                      <span className="target-label">{t[lang].recommended}: {modelRange[0]}–{modelRange[1]}%</span>
                      <span className="actual-label">{t[lang].actual}: {fmtDisplay(catTotal)}</span>
                    </div>
                    <div className="human-explanation-mini">{feedback.explanation}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Print Education: How to Improve */}
          <div className="print-education print-only">
            <h3 className="section-title-print">{t[lang].printHowToImprove}</h3>

            <div className="edu-columns">
              <div className="edu-col">
                <h4>{t[lang].printPriority}</h4>
                <ol className="priority-list">
                  {t[lang].printPrioritySteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                <h4>{t[lang].printPractical}</h4>
                <ul className="practical-list">
                  {Object.values(t[lang].printPracticalTips).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="edu-col">
                <div className="small-wins-box">
                  <h4>{t[lang].printSmallWins}</h4>
                  <p>{t[lang].printSmallWinsText}</p>
                </div>

                <div className="pct-explain-box">
                  <h4>{t[lang].printPctExplain}</h4>
                  <p>{t[lang].printPctExplainText}</p>
                  <p className="tradeoff-line">{t[lang].printTradeoff}</p>
                </div>

                <h4>{t[lang].printReflection}</h4>
                <ol className="reflection-list">
                  {t[lang].printReflectionQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Print Action Box + Signature */}
          <div className="print-action-box print-only">
            <h4>{t[lang].printNextStep}</h4>
            <p className="action-hint">{t[lang].printNextStepHint}</p>
            <div className="action-write-line" />
            <div className="action-write-line" />

            <div className="print-bottom-row">
              <div className="print-reevaluate">{t[lang].reEvaluate}</div>
              <div className="print-signature">
                <div className="sig-line" />
                <label>{t[lang].commitmentLine}</label>
              </div>
            </div>
          </div>

          {/* Personalized Plan CTA (web) */}
          <div className="card evaluation-cta no-print">
             <div className="card-body">
                <h3>{t[lang].evalTitle}</h3>
                <p>{t[lang].evalText}</p>
                <button className="btn btn-primary btn-large">{t[lang].evalBtn}</button>
             </div>
          </div>

          <div className="re-evaluate-hint no-print">
            {t[lang].reEvaluate}
          </div>
        </div>

        {/* Web Sidebar */}
        <div className="budget-sidebar no-print">
          <div className="summary-card">
            <div className="summary-header">
              <h3>{t[lang].summaryTitle}</h3>
              <span className="tier-tag">{t[lang].tiers[tier]}</span>
            </div>
            <div className="summary-body">
              {totalExpenses > 0 && <DonutChart data={chartData} total={totalExpenses} />}
              <div className="summary-stats">
                <div className="summary-row">
                  <span>{t[lang].income}</span>
                  <span className="text-success">{fmtDisplay(totalIncome)}</span>
                </div>
                <div className="summary-row">
                  <span>{t[lang].expenses}</span>
                  <span className="text-error">{fmtDisplay(totalExpenses)}</span>
                </div>
                <div className={`summary-balance ${balance < 0 ? 'negative' : 'positive'}`}>
                  <div>{balance >= 0 ? t[lang].surplus : t[lang].deficit}</div>
                  <div className="balance-amount">{fmtDisplay(balance)}</div>
                </div>
              </div>
              {encouragement && (
                <div className="micro-encouragement">
                  <span className="encouragement-icon">💡</span>
                  {encouragement}
                </div>
              )}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-header">
              <h3>{t[lang].distributionTitle}</h3>
            </div>
            <div className="summary-body">
              {budgetData.map(cat => {
                const catTotal = cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
                if (catTotal === 0) return null
                const pct = totalIncome > 0 ? Math.round((catTotal / totalIncome) * 100) : 0
                const modelRange = currentModel?.[cat.id] || [0, 0]
                const targetPct = cat.targetPct ?? modelRange[0]
                const feedback = getHumanizedFeedback(cat.id, pct, targetPct, modelRange, lang, householdSize, tier, catTotal, totalIncome, location)
                return (
                  <div key={cat.id} className="summary-progress-item">
                    <div className="progress-item-header">
                      <span>{cat.emoji} {t[lang].categories[cat.id]}</span>
                      <span className={`status-text status-${feedback.status}`}>{t[lang].status[feedback.status]}</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: cat.color }} />
                      <div className="progress-target-marker" style={{ left: `${targetPct}%` }} />
                    </div>
                    <div className="human-explanation-mini">{feedback.explanation}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="summary-card notes-section-web">
            <div className="summary-header">
              <h3>{t[lang].notes}</h3>
            </div>
            <div className="summary-body">
              <textarea
                className="web-notes-area"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={lang === 'ES' ? 'Reflexiones sobre tu presupuesto...' : 'Reflections on your budget...'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CATEGORIES_BASE as CATEGORIES }
