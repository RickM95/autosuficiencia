import { useCurrency } from './CurrencyContext'

export default function Header({ activeTab, setActiveTab, planCount, onNewSession }) {
  const { currency, setCurrency, buyRate, setBuyRate, sellRate, setSellRate, rateMode, setRateMode } = useCurrency()

  const tabs = [
    { id: 'budget', label: 'Presupuesto', labelEn: 'Budget', icon: '💰' },
    { id: 'survey', label: 'Evaluación', labelEn: 'Assessment', icon: '📋' },
    { id: 'plan', label: 'Mi Plan', labelEn: 'My Plan', icon: '📄' },
    { id: 'food', label: 'Alimentación', labelEn: 'Food', icon: '🥗' },
    { id: 'resources', label: 'Recursos', labelEn: 'Resources', icon: '🔗' },
    { id: 'library', label: 'Planes', labelEn: 'All Plans', icon: '📚', badge: planCount },
  ]

  return (
    <>
      <header className="header no-print">
        <div className="header-inner">
          <div className="header-logo">
            <div className="header-logo-icon">AS</div>
            <div className="header-logo-text">
              <span className="header-logo-title">Autosuficiencia</span>
              <span className="header-logo-subtitle">Self-Sufficiency Plan</span>
            </div>
          </div>
          <nav className="header-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ position: 'relative' }}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span>{tab.label} <span style={{ opacity: 0.65, fontSize: '0.75em' }}>/ {tab.labelEn}</span></span>
                {tab.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: 'var(--color-accent)', color: 'var(--color-primary-darker)',
                    borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800,
                    minWidth: '18px', height: '18px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px', border: '2px solid white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}

            {/* New Session Button */}
            <button
              className="nav-btn nav-btn-new-session"
              onClick={onNewSession}
              title="Nuevo usuario / New user session"
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 700,
                padding: '0.4rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              🔄 <span>Nuevo / New</span>
            </button>
          </nav>
        </div>

      {/* Currency Panel */}
      <div className="currency-panel no-print">
        <div className="currency-inner">
          <span className="currency-label">Moneda / Currency:</span>

          <div className="currency-toggle-group">
            <button
              className={`currency-toggle-btn${currency === 'HNL' ? ' active' : ''}`}
              onClick={() => setCurrency('HNL')}
            >
              🇭🇳 HNL (L)
            </button>
            <button
              className={`currency-toggle-btn${currency === 'USD' ? ' active' : ''}`}
              onClick={() => setCurrency('USD')}
            >
              🇺🇸 USD ($)
            </button>
          </div>

          <div className="currency-rates">
            <span className="currency-label">Tasa / Rate:</span>

            {/* Rate mode toggle */}
            <div className="currency-toggle-group">
              <button
                className={`currency-toggle-btn${rateMode === 'buy' ? ' active' : ''}`}
                onClick={() => setRateMode('buy')}
                title="Tasa de compra del banco / Bank buy rate"
              >
                Compra
              </button>
              <button
                className={`currency-toggle-btn${rateMode === 'sell' ? ' active' : ''}`}
                onClick={() => setRateMode('sell')}
                title="Tasa de venta del banco / Bank sell rate"
              >
                Venta
              </button>
            </div>

            <div className="rate-field">
              <span className="rate-badge buy">Compra / Buy</span>
              <label htmlFor="buyRate">L</label>
              <input
                id="buyRate"
                type="number"
                className="rate-input"
                value={buyRate}
                min={1}
                step={0.01}
                onChange={e => setBuyRate(parseFloat(e.target.value) || 24.50)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ $1</span>
            </div>

            <div className="rate-field">
              <span className="rate-badge sell">Venta / Sell</span>
              <label htmlFor="sellRate">L</label>
              <input
                id="sellRate"
                type="number"
                className="rate-input"
                value={sellRate}
                min={1}
                step={0.01}
                onChange={e => setSellRate(parseFloat(e.target.value) || 25.20)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ $1</span>
            </div>
          </div>
        </div>
      </div>
      </header>
    </>
  )
}
