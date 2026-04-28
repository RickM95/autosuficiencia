import { useState } from 'react'
import { useCurrency } from './CurrencyContext'

const CATEGORIES = [
  { id: 'tithes', emoji: '🙏', name: 'Diezmos y Ofrendas', nameEn: 'Tithes & Offerings', pct: '10%', color: '#8e44ad', items: [{ id: 1, label: 'Diezmo / Tithe', amount: '' }, { id: 2, label: 'Ofrenda / Offering', amount: '' }] },
  { id: 'housing', emoji: '🏠', name: 'Vivienda', nameEn: 'Housing', pct: '25–35%', color: '#0073b9', items: [{ id: 1, label: 'Alquiler/Hipoteca / Rent/Mortgage', amount: '' }, { id: 2, label: 'Impuesto predial / Property tax', amount: '' }] },
  { id: 'food', emoji: '🍽️', name: 'Alimentación', nameEn: 'Food', pct: '10–15%', color: '#e67e22', items: [{ id: 1, label: 'Supermercado / Groceries', amount: '' }, { id: 2, label: 'Restaurantes / Dining out', amount: '' }] },
  { id: 'transport', emoji: '🚗', name: 'Transporte', nameEn: 'Transportation', pct: '10–15%', color: '#27ae60', items: [{ id: 1, label: 'Combustible / Fuel', amount: '' }, { id: 2, label: 'Transporte público / Public transit', amount: '' }, { id: 3, label: 'Mantenimiento / Maintenance', amount: '' }] },
  { id: 'utilities', emoji: '💡', name: 'Servicios Básicos', nameEn: 'Utilities', pct: '5–10%', color: '#f39c12', items: [{ id: 1, label: 'Electricidad / Electricity', amount: '' }, { id: 2, label: 'Agua / Water', amount: '' }, { id: 3, label: 'Gas / Gas', amount: '' }, { id: 4, label: 'Internet / Internet', amount: '' }, { id: 5, label: 'Teléfono / Phone', amount: '' }] },
  { id: 'health', emoji: '🏥', name: 'Salud', nameEn: 'Health', pct: '5–10%', color: '#e74c3c', items: [{ id: 1, label: 'Seguro médico / Health insurance', amount: '' }, { id: 2, label: 'Medicamentos / Medications', amount: '' }, { id: 3, label: 'Consultas / Doctor visits', amount: '' }] },
  { id: 'clothing', emoji: '👗', name: 'Ropa y Calzado', nameEn: 'Clothing', pct: '2–7%', color: '#e91e63', items: [{ id: 1, label: 'Ropa / Clothing', amount: '' }, { id: 2, label: 'Calzado / Shoes', amount: '' }] },
  { id: 'education', emoji: '📚', name: 'Educación', nameEn: 'Education', pct: '5–10%', color: '#3498db', items: [{ id: 1, label: 'Matrícula / Tuition', amount: '' }, { id: 2, label: 'Útiles / Supplies', amount: '' }, { id: 3, label: 'Cursos / Courses', amount: '' }] },
  { id: 'debt', emoji: '💳', name: 'Pagos de Deuda', nameEn: 'Debt Payments', pct: 'Variable', color: '#c0392b', items: [{ id: 1, label: 'Tarjeta de crédito / Credit card', amount: '' }, { id: 2, label: 'Préstamo personal / Personal loan', amount: '' }] },
  { id: 'savings', emoji: '💰', name: 'Ahorro', nameEn: 'Savings', pct: '10–15%', color: '#1b8533', items: [{ id: 1, label: 'Fondo de emergencia / Emergency fund', amount: '' }, { id: 2, label: 'Ahorro a largo plazo / Long-term savings', amount: '' }] },
  { id: 'personal', emoji: '🎉', name: 'Personal y Recreación', nameEn: 'Personal & Recreation', pct: '5–10%', color: '#9b59b6', items: [{ id: 1, label: 'Entretenimiento / Entertainment', amount: '' }, { id: 2, label: 'Suscripciones / Subscriptions', amount: '' }, { id: 3, label: 'Cuidado personal / Personal care', amount: '' }] },
  { id: 'other', emoji: '➕', name: 'Otros Gastos', nameEn: 'Other Expenses', pct: '', color: '#7f8c8d', items: [{ id: 1, label: 'Otro / Other', amount: '' }] },
]

function MoneyDisplay({ amount }) {
  const { fmtBoth } = useCurrency()
  const { primary, secondary } = fmtBoth(amount)
  return (
    <div className="money-display">
      <span className="money-primary">{primary}</span>
      <span className="money-secondary">{secondary}</span>
    </div>
  )
}

function BudgetCategory({ cat, onUpdate }) {
  const [open, setOpen] = useState(false)
  const { symbol } = useCurrency()
  const total = cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)

  function updateItem(id, field, value) {
    onUpdate(cat.id, cat.items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  function addItem() {
    const newId = Math.max(...cat.items.map(i => i.id), 0) + 1
    onUpdate(cat.id, [...cat.items, { id: newId, label: '', amount: '' }])
  }

  function removeItem(id) {
    if (cat.items.length <= 1) return
    onUpdate(cat.id, cat.items.filter(i => i.id !== id))
  }

  return (
    <div className={`budget-category${total > 0 ? ' has-value' : ''}`} style={{ borderLeftColor: total > 0 ? cat.color : undefined }}>
      <div className="budget-category-header" onClick={() => setOpen(o => !o)}>
        <div className="budget-category-left">
          <span className="budget-category-emoji">{cat.emoji}</span>
          <div className="budget-category-info">
            <div className="budget-category-name">{cat.name} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.8em' }}>/ {cat.nameEn}</span></div>
            {cat.pct && <div className="budget-category-pct">Recomendado / Recommended: {cat.pct}</div>}
          </div>
        </div>
        <div className="budget-category-right">
          <div className="budget-category-total">
            <MoneyDisplay amount={total} />
          </div>
          <span className={`budget-category-chevron${open ? ' open' : ''}`}>▼</span>
        </div>
      </div>

      {open && (
        <div className="budget-category-body">
          <div className="budget-line-items">
            {cat.items.map(item => (
              <div key={item.id} className="budget-line-item">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Descripción / Description"
                  value={item.label}
                  onChange={e => updateItem(item.id, 'label', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
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
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
                <button className="remove-btn" onClick={() => removeItem(item.id)} title="Eliminar / Remove">×</button>
              </div>
            ))}
          </div>
          <button className="budget-add-btn" onClick={addItem}>
            + Agregar línea / Add line
          </button>
        </div>
      )}
    </div>
  )
}

function ProgressBar({ label, emoji, pct, color }) {
  const capped = Math.min(pct, 100)
  const over = pct > 100
  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-header">
        <span className="progress-bar-label">{emoji} {label}</span>
        <span className="progress-bar-pct" style={{ color: over ? 'var(--color-error)' : undefined }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${capped}%`, background: over ? 'var(--color-error)' : color }} />
      </div>
    </div>
  )
}

export default function BudgetCalculator({ budgetData, setBudgetData }) {
  const { symbol, fmtBoth } = useCurrency()

  // Income state
  const [income, setIncome] = useState({
    salary: '', otherFamily: '', govAid: '', otherIncome: ''
  })

  const totalIncome = Object.values(income).reduce((s, v) => s + (parseFloat(v) || 0), 0)

  function updateCategory(catId, newItems) {
    setBudgetData(prev => prev.map(c => c.id === catId ? { ...c, items: newItems } : c))
  }

  const totalExpenses = budgetData.reduce((sum, cat) =>
    sum + cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), 0)

  const balance = totalIncome - totalExpenses
  const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero'

  const { primary: balPrimary, secondary: balSecondary } = fmtBoth(Math.abs(balance))

  return (
    <div>
      <div className="section-hero">
        <h1>Calculadora de <span className="hero-accent">Presupuesto</span></h1>
        <p>Budget Calculator — Ingresa tus ingresos y gastos mensuales / Enter your monthly income and expenses</p>
      </div>

      <div className="budget-layout">
        {/* Left: Income + Categories */}
        <div>
          {/* Income Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon" style={{ background: '#eaf8ee' }}>💵</div>
                <div>
                  <div className="card-title">Ingresos Mensuales / Monthly Income</div>
                  <div className="card-subtitle">Todos los miembros del hogar / All household members</div>
                </div>
              </div>
              <MoneyDisplay amount={totalIncome} />
            </div>
            <div className="card-body">
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Salario(s) / Salary(ies)</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">{symbol}</span>
                    <input type="number" className="form-input" placeholder="0.00" value={income.salary} min={0} step={0.01} onChange={e => setIncome(p => ({ ...p, salary: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Otros ingresos familiares / Other family income</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">{symbol}</span>
                    <input type="number" className="form-input" placeholder="0.00" value={income.otherFamily} min={0} step={0.01} onChange={e => setIncome(p => ({ ...p, otherFamily: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ayuda del gobierno / Government aid</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">{symbol}</span>
                    <input type="number" className="form-input" placeholder="0.00" value={income.govAid} min={0} step={0.01} onChange={e => setIncome(p => ({ ...p, govAid: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Otros recursos / Other resources</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">{symbol}</span>
                    <input type="number" className="form-input" placeholder="0.00" value={income.otherIncome} min={0} step={0.01} onChange={e => setIncome(p => ({ ...p, otherIncome: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-subdued)' }}>
              Gastos Mensuales / Monthly Expenses — <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Haz clic para expandir / Click to expand</span>
            </h2>
          </div>
          <div className="budget-categories">
            {budgetData.map(cat => (
              <BudgetCategory key={cat.id} cat={cat} onUpdate={updateCategory} />
            ))}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="budget-summary">
          <div className="summary-card">
            <div className="summary-header">
              <h3>Resumen / Summary</h3>
            </div>
            <div className="summary-body">
              <div className="summary-row">
                <span className="summary-row-label">💵 Ingresos / Income</span>
                <div className="summary-row-value text-success">
                  <MoneyDisplay amount={totalIncome} />
                </div>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">📊 Gastos / Expenses</span>
                <div className="summary-row-value text-error">
                  <MoneyDisplay amount={totalExpenses} />
                </div>
              </div>

              <div className={`summary-balance ${balanceClass}`}>
                <div className="summary-balance-label">
                  {balance >= 0 ? '✅ Sobrante / Surplus' : '⚠️ Déficit / Deficit'}
                </div>
                <div className="summary-balance-amount">{balance >= 0 ? '' : '-'}{balPrimary}</div>
                <div className="summary-balance-secondary">{balance >= 0 ? '' : '-'}{balSecondary}</div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          {totalExpenses > 0 && (
            <div className="summary-card">
              <div className="summary-header">
                <h3>Distribución / Breakdown</h3>
              </div>
              <div className="summary-body">
                {budgetData.map(cat => {
                  const catTotal = cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
                  if (catTotal === 0) return null
                  const pct = totalIncome > 0 ? (catTotal / totalIncome) * 100 : 0
                  return (
                    <ProgressBar
                      key={cat.id}
                      label={`${cat.name}`}
                      emoji={cat.emoji}
                      pct={pct}
                      color={cat.color}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Reducible expenses */}
          <div className="summary-card">
            <div className="summary-header">
              <h3>💡 Gastos a reducir / Expenses to reduce</h3>
            </div>
            <div className="summary-body">
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                Identifica gastos que podrías reducir o eliminar / Identify expenses you could reduce or eliminate
              </p>
              <textarea
                className="form-textarea"
                placeholder="Ej: Suscripciones innecesarias, comer fuera con frecuencia... / E.g.: Unnecessary subscriptions, eating out often..."
                rows={4}
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CATEGORIES }
