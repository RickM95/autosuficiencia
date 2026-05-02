import { useCurrency } from './CurrencyContext'

export default function Header({ activeTab, setActiveTab }) {
  const { currency, setCurrency, buyRate, setBuyRate, sellRate, setSellRate, rateMode, setRateMode } = useCurrency()

  const tabs = [
    { id: 'budget', label: 'Presupuesto', labelEn: 'Budget' },
    { id: 'survey', label: 'Evaluación', labelEn: 'Assessment' },
    { id: 'plan', label: 'Mi Plan', labelEn: 'My Plan' },
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
              >
                {tab.label} <span style={{ opacity: 0.65, fontSize: '0.75em' }}>/ {tab.labelEn}</span>
              </button>
            ))}
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
