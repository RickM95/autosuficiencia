import { useState, useMemo, useEffect } from 'react'
import { useCurrency } from './CurrencyContext'
import {
  EDUCATION,
  SECURITY_LEVELS,
  INCOME_PLANS,
  WEEKLY_MEAL_PLANS,
  MONTHLY_ROTATION,
  RECIPES,
  STORAGE_GUIDE,
  ANTI_OVERWHELM,
  BEHAVIORAL_GUIDANCE
} from './foodSelfSufficiencyData'
import { resources as RESOURCE_DB } from './resourcesData'
import { FOOD_CATEGORIES, FOOD_ITEMS, TIER_CONFIG as FOOD_TIER_CONFIG, LOCATION_COSTS } from './foodData'

function Section({ title, titleEn, icon, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen !== false)
  return (
    <div className="fss-section">
      <button className="fss-section-header" onClick={() => setOpen(!open)}>
        <span className="fss-section-icon">{icon}</span>
        <span className="fss-section-title">{title} <span className="fss-section-title-en">/ {titleEn}</span></span>
        <span className={`fss-chevron ${open ? 'open' : ''}`}>▼</span>
      </button>
      {open && <div className="fss-section-body">{children}</div>}
    </div>
  )
}

function InfoCard({ icon, title, titleEn, children }) {
  return (
    <div className="fss-info-card">
      <div className="fss-info-card-header">
        <span className="fss-info-card-icon">{icon}</span>
        <span className="fss-info-card-title">{title}<br /><span className="fss-info-card-title-en">{titleEn}</span></span>
      </div>
      <div className="fss-info-card-body">{children}</div>
    </div>
  )
}

function getPlanLevel(formData) {
  const income = parseFloat(formData.ingresos) || parseFloat(formData.incSalary) || 0
  const tier = formData.tier || 'survival'
  const location = formData.country || formData.location || 'HN'
  const householdSize = formData.householdSize || parseInt(formData.dependents) + 1 || 1
  return { income, tier, location, householdSize }
}

export default function FoodSelfSufficiencySystem({ formData }) {
  const { lang, activeRate, fmtDisplay, symbol, currency } = useCurrency()
  const { income, tier, location, householdSize } = getPlanLevel(formData)
  const isES = lang === 'ES'

  const t = (obj) => obj?.es || obj?.en || ''

  const [activeTab, setActiveTab] = useState('overview')
  const [activeWeek, setActiveWeek] = useState(0)

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140; // Adjust for sticky header + sub-tabs
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, {
      rootMargin: '-150px 0px -70% 0px',
      threshold: 0
    });

    const sections = document.querySelectorAll('.fss-scroll-section');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  const levelColors = {
    red: '#dc2626',
    orange: '#ea580c',
    yellow: '#ca8a04',
    green: '#16a34a',
    blue: '#2563eb',
    purple: '#7c3aed'
  }

  const currentLevel = tier === 'survival' ? 1 : tier === 'lower-middle' ? 3 : 5

  const incomePlan = INCOME_PLANS[tier] || INCOME_PLANS['survival']

  const userRecipes = RECIPES.filter(r => r.tier.includes(tier))

  // --- Calculator Logic ---
  const [calcLoc, setCalcLoc] = useState(location)
  const [calcTier, setCalcTier] = useState(tier)
  const [numAdults, setNumAdults] = useState(householdSize)
  const [numChildren, setNumChildren] = useState(0)
  const [calcTimeframe, setCalcTimeframe] = useState(1) // 1, 3, 6, 12, 36 months
  const [showComparison, setShowComparison] = useState(false)
  const [showInventory, setShowInventory] = useState(false)

  const timeframes = [
    { value: 1, es: '1 Mes', en: '1 Month' },
    { value: 3, es: '3 Meses', en: '3 Months' },
    { value: 6, es: '6 Meses', en: '6 Months' },
    { value: 12, es: '1 Año', en: '1 Year' },
    { value: 36, es: '3 Años', en: '3 Years' },
  ]

  const KG_TO_LBS = 2.20462

  const calculateForMonths = (months) => {
    const config = FOOD_TIER_CONFIG[calcTier] || FOOD_TIER_CONFIG['lower-middle']
    const locConfig = LOCATION_COSTS[calcLoc] || LOCATION_COSTS['HN']
    const adultCals = numAdults * 2200 * 30 * months
    const childCals = numChildren * 1600 * 30 * months
    const totalMonthlyCalories = adultCals + childCals
    const effectiveSize = numAdults + (numChildren * 0.75)
    
    const normLoc = (calcLoc?.toLowerCase().includes('hn') || calcLoc?.toLowerCase().includes('honduras')) ? 'HN' : 
                    (calcLoc?.toLowerCase().includes('us') || calcLoc?.toLowerCase().includes('usa') || calcLoc?.toLowerCase().includes('united states')) ? 'US' : 
                    calcLoc
    const normTier = calcTier?.toLowerCase().includes('survival') ? 'survival' :
                     calcTier?.toLowerCase().includes('lower') ? 'lower-middle' :
                     calcTier?.toLowerCase().includes('middle') ? 'middle' :
                     'survival'

    const plan = (FOOD_ITEMS || []).filter(item => {
      // Normalize location match
      const lowLoc = (calcLoc || '').toLowerCase();
      const matchLoc = (lowLoc.includes('hn') || lowLoc.includes('honduras')) ? 'HN' : 
                       (lowLoc.includes('us') || lowLoc.includes('usa') || lowLoc.includes('united states')) ? 'US' : 
                       'HN'; // Fallback to HN
      
      // Normalize tier match
      const lowTier = (calcTier || '').toLowerCase();
      const matchTier = lowTier.includes('survival') ? 'survival' :
                        lowTier.includes('lower') ? 'lower-middle' :
                        lowTier.includes('middle') ? 'middle' :
                        'survival'; // Fallback to survival

      const locIsMatch = Array.isArray(item.relevance) && item.relevance.includes(matchLoc);
      const tierIsMatch = Array.isArray(item.tierRelevance) && item.tierRelevance.includes(matchTier);
      
      return locIsMatch && tierIsMatch;
    }).map(item => {
      const vFactor = config?.varietyFactor || 1.0;
      const qty = parseFloat((item.baseQty * effectiveSize * vFactor * months).toFixed(1));
      let weightLbs = 0;
      let weightKg = 0;
      if (item.unit === 'kg') {
        weightKg = qty;
        weightLbs = qty * KG_TO_LBS;
      } else if (item.unit === 'liters') {
        weightKg = qty * 0.92;
        weightLbs = weightKg * KG_TO_LBS;
      }
      return { ...item, qty, weightKg: weightKg || 0, weightLbs: weightLbs || 0 };
    });

    const totalCostUSD = locConfig.basePerPersonUSD * effectiveSize * config.costFactor * months
    const totalWeightKg = plan.reduce((sum, item) => sum + (item.weightKg || 0), 0)
    const totalWeightLbs = plan.reduce((sum, item) => sum + (item.weightLbs || 0), 0)

    return { totalMonthlyCalories, plan, totalCostUSD, totalWeightKg, totalWeightLbs, costPerPerson: totalCostUSD / (numAdults + numChildren) }
  }

  const calcResults = useMemo(() => calculateForMonths(calcTimeframe), [calcLoc, calcTier, numAdults, numChildren, calcTimeframe])

  const comparisonData = useMemo(() => {
    return timeframes.map(tf => ({
      ...tf,
      data: calculateForMonths(tf.value)
    }))
  }, [calcLoc, calcTier, numAdults, numChildren])

  const groupedCalcPlan = calcResults.plan.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc;
  }, {})

  // --- External Resources Logic ---
  const foodResources = useMemo(() => {
    return RESOURCE_DB.filter(r => 
      r.category === 'food' && 
      (r.availability === 'INT' || r.availability.includes(location))
    )
  }, [location])

  return (
    <div className="fss-container">
      <div className="fss-hero">
        <h1 className="fss-hero-title">Sistema de Autosuficiencia Alimentaria</h1>
        <p className="fss-hero-sub">Food Self-Sufficiency System — De la supervivencia a la resiliencia completa</p>
        <div className="fss-hero-meta">
          <span className="fss-hero-badge">📍 {location === 'HN' ? 'Honduras' : 'United States'}</span>
          <span className="fss-hero-badge">👥 {householdSize} {householdSize === 1 ? 'persona' : 'personas'}</span>
          <span className="fss-hero-badge">💰 {incomePlan.es.title || incomePlan.en.title}</span>
        </div>
      </div>

      <div className="fss-tabs no-print">
        {[
          { id: 'calculator', label: 'Calculadora', en: 'Calculator', icon: '🧮' },
          { id: 'overview', label: 'Vista General', en: 'Overview', icon: '📊' },
          { id: 'meals', label: 'Comidas', en: 'Meals', icon: '🍽️' },
          { id: 'recipes', label: 'Recetas', en: 'Recipes', icon: '📝' },
          { id: 'storage', label: 'Almacenamiento', en: 'Storage', icon: '📦' },
          { id: 'external-resources', label: 'Apoyo Externo', en: 'External Support', icon: '🤝' },
          { id: 'education', label: 'Educación', en: 'Education', icon: '📖' },
          { id: 'levels', label: 'Niveles', en: 'Levels', icon: '📈' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`fss-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => scrollToSection(tab.id)}
          >
            {tab.icon} {tab.label}<span className="fss-tab-en"> / {tab.en}</span>
          </button>
        ))}
      </div>

      <div className="fss-content">

        {/* Section: Calculator */}
        <div id="calculator" className="fss-scroll-section">
          <div className="fss-calculator">
            <h2 className="fss-section-main-title">{isES ? "🧮 Calculadora de Autosuficiencia" : "🧮 Self-Sufficiency Calculator"}</h2>
            
            <div className="fss-calc-controls budget-actions no-print" style={{ marginBottom: '2rem' }}>
              <div className="config-grid">
                <div className="config-group">
                  <label className="form-label">{isES ? "Ubicación" : "Location"}</label>
                  <select className="form-select" value={calcLoc} onChange={e => setCalcLoc(e.target.value)}>
                    <option value="HN">Honduras 🇭🇳</option>
                    <option value="US">USA 🇺🇸</option>
                  </select>
                </div>
                <div className="config-group">
                  <label className="form-label">{isES ? "Nivel" : "Tier"}</label>
                  <select className="form-select" value={calcTier} onChange={e => setCalcTier(e.target.value)}>
                    <option value="survival">{isES ? "Supervivencia" : "Survival"}</option>
                    <option value="lower-middle">{isES ? "Bajo-Medio" : "Lower-Middle"}</option>
                    <option value="middle">{isES ? "Medio" : "Middle"}</option>
                  </select>
                </div>
                <div className="config-group">
                  <label className="form-label">{isES ? "Adultos" : "Adults"}</label>
                  <input type="number" className="form-input" value={numAdults} min={1} onChange={e => setNumAdults(parseInt(e.target.value) || 1)} />
                </div>
                <div className="config-group">
                  <label className="form-label">{isES ? "Niños" : "Children"}</label>
                  <input type="number" className="form-input" value={numChildren} min={0} onChange={e => setNumChildren(parseInt(e.target.value) || 0)} />
                </div>
              </div>

              <div className="timeframe-toggle-wrapper" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">{isES ? "Tiempo de Reserva:" : "Reserve Time:"}</label>
                <div className="fss-week-tabs">
                  {timeframes.map(tf => (
                    <button 
                      key={tf.value} 
                      className={`fss-week-tab ${calcTimeframe === tf.value && !showComparison ? 'active' : ''}`} 
                      onClick={() => { setCalcTimeframe(tf.value); setShowComparison(false); }}
                    >
                      {isES ? tf.es : tf.en}
                    </button>
                  ))}
                  <button 
                    className={`fss-week-tab ${showComparison ? 'active' : ''}`} 
                    onClick={() => setShowComparison(true)}
                    style={{ marginLeft: 'auto', background: showComparison ? '#2563eb' : '', borderColor: showComparison ? '#2563eb' : '' }}
                  >
                    ⚖️ {isES ? 'Comparar' : 'Compare'}
                  </button>
                </div>
              </div>
            </div>

            {showComparison ? (
              <div className="fss-comparison-view">
                <h3 className="fss-subsection-title">{isES ? "Comparativa por Periodo" : "Comparison by Period"}</h3>
                <div className="comparison-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>{isES ? 'Alimento' : 'Food'}</th>
                        {timeframes.map(tf => <th key={tf.value}>{isES ? tf.es : tf.en}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {FOOD_ITEMS.filter(item => {
                        const lowLoc = (calcLoc || '').toLowerCase();
                        const matchLoc = (lowLoc.includes('hn') || lowLoc.includes('honduras')) ? 'HN' : 
                                         (lowLoc.includes('us') || lowLoc.includes('usa') || lowLoc.includes('united states')) ? 'US' : 
                                         'HN';
                        
                        const lowTier = (calcTier || '').toLowerCase();
                        const matchTier = lowTier.includes('survival') ? 'survival' :
                                          lowTier.includes('lower') ? 'lower-middle' :
                                          lowTier.includes('middle') ? 'middle' :
                                          'survival';

                        return Array.isArray(item.relevance) && item.relevance.includes(matchLoc) && 
                               Array.isArray(item.tierRelevance) && item.tierRelevance.includes(matchTier);
                      }).map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{isES ? item.nameEs : item.nameEn}</td>
                          {comparisonData.map(cd => {
                            const found = cd.data.plan.find(p => p.id === item.id)
                            return (
                              <td key={cd.value}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{Math.ceil(found?.qty || 0)} {item.unit}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                                  ({found?.qty.toFixed(1)})
                                </div>
                                {item.id === 'eggs' && found?.qty > 0 && (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                    📦 {Math.ceil(found.qty / 30)}ct
                                  </div>
                                )}
                                {found?.weightKg > 0 && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {found.weightLbs.toFixed(1)} lb / {found.weightKg.toFixed(1)} kg
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                      <tr className="table-total-row">
                        <td><strong>{isES ? 'Peso Total' : 'Total Weight'}</strong></td>
                        {comparisonData.map(cd => (
                          <td key={cd.value}>
                            <div style={{ fontWeight: 700 }}>{cd.data.totalWeightLbs.toFixed(1)} lbs</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>({cd.data.totalWeightKg.toFixed(1)} kg)</div>
                          </td>
                        ))}
                      </tr>
                      <tr className="table-total-row">
                        <td><strong>{isES ? 'Costo Total' : 'Total Cost'}</strong></td>
                        {comparisonData.map(cd => (
                          <td key={cd.value}>
                            <strong style={{ color: 'var(--color-success)' }}>{fmtDisplay(currency === 'USD' ? cd.data.totalCostUSD : cd.data.totalCostUSD * activeRate)}</strong>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <div className="fss-calc-summary food-summary-cards">
                  <div className="summary-card">
                    <div className="summary-header"><h3>{isES ? "Calorías Totales" : "Total Calories"}</h3></div>
                    <div className="summary-body">
                      <div className="balance-amount" style={{ color: 'var(--color-primary)' }}>{calcResults.totalMonthlyCalories.toLocaleString()} kcal</div>
                      <div className="micro-encouragement">{calcTimeframe} {isES ? 'mes(es)' : 'month(s)'}</div>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-header"><h3>{isES ? "Costo Estimado" : "Estimated Cost"}</h3></div>
                    <div className="summary-body">
                      <div className="balance-amount" style={{ color: 'var(--color-success)' }}>
                        {fmtDisplay(currency === 'USD' ? calcResults.totalCostUSD : calcResults.totalCostUSD * activeRate)}
                      </div>
                      <div className="micro-encouragement">{isES ? "Para" : "For"} {numAdults + numChildren} {isES ? "personas" : "people"}</div>
                    </div>
                  </div>
                </div>

                <div className="fss-inventory-toggle-wrapper" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <button 
                    className="fss-inventory-btn"
                    onClick={() => setShowInventory(!showInventory)}
                    style={{
                      background: showInventory ? 'var(--color-primary)' : 'white',
                      color: showInventory ? 'white' : 'var(--color-primary)',
                      border: '2px solid var(--color-primary)',
                      padding: '0.75rem 2rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {showInventory ? '📂' : '📁'} {isES ? "Ver Inventario Detallado" : "View Detailed Inventory"}
                    <span style={{ transform: showInventory ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                  </button>
                </div>

                {showInventory && (
                  <div className="fss-condensed-inventory" style={{ 
                    background: '#f8fafc', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '1.5rem', 
                    marginBottom: '2rem',
                    border: '1px solid var(--color-border)',
                    animation: 'slideDown 0.3s ease-out'
                  }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text)', fontSize: '1.25rem', textAlign: 'center', fontWeight: 800 }}>
                      📋 {isES ? "Lista Maestra de Provisiones" : "Master Provisions List"}
                      <div style={{ fontSize: '0.9rem', fontWeight: 400, marginTop: '0.25rem', color: 'var(--color-text-muted)' }}>
                        {isES ? "Calculado para" : "Calculated for"} {calcTimeframe} {isES ? 'mes(es)' : 'month(s)'} ({numAdults} {isES ? 'adultos' : 'adults'} & {numChildren} {isES ? 'niños' : 'children'})
                      </div>
                    </h3>
                    <div className="comparison-table-wrapper">
                      <table className="comparison-table">
                        <thead>
                          <tr>
                            <th>{isES ? 'Categoría' : 'Category'}</th>
                            <th>{isES ? 'Alimento' : 'Food'}</th>
                            <th>{isES ? 'Cantidad Total' : 'Total Quantity'}</th>
                            <th>{isES ? 'Peso Requerido (lb/kg)' : 'Required Weight (lb/kg)'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calcResults.plan.map(item => (
                            <tr key={item.id}>
                              <td style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                                {FOOD_CATEGORIES[item.category]?.[isES ? 'es' : 'en']}
                              </td>
                              <td style={{ fontWeight: 600 }}>{isES ? item.nameEs : item.nameEn}</td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
                                    {Math.ceil(item.qty)} {isES ? (
                                      item.unit === 'units' ? 'unid.' : 
                                      item.unit === 'loaves' ? 'hogazas' : 
                                      item.unit === 'cans' ? 'latas' : 
                                      item.unit === 'liters' ? 'litros' : 
                                      item.unit === 'dozen' ? 'docenas' : 
                                      item.unit === 'heads' ? 'cabezas' : 
                                      item.unit === 'box (20ct)' ? 'cajas' :
                                      item.unit === 'pack (12ct)' ? 'paq (12u)' :
                                      item.unit
                                    ) : (
                                      item.unit === 'units' ? 'units' : 
                                      item.unit === 'loaves' ? 'loaves' : 
                                      item.unit === 'cans' ? 'cans' : 
                                      item.unit === 'liters' ? 'liters' : 
                                      item.unit === 'dozen' ? 'dozen' : 
                                      item.unit === 'heads' ? 'heads' : 
                                      item.unit === 'box (20ct)' ? 'boxes' :
                                      item.unit
                                    )}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                    {isES ? 'Exacto' : 'Exact'}: {item.qty.toFixed(2)}
                                  </span>
                                  {item.id === 'eggs' && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                                      📦 {Math.ceil(item.qty / 30)} {isES ? 'cartones (30u)' : 'cartons (30u)'}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {item.weightKg > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, color: '#1e40af' }}>{item.weightLbs.toFixed(2)} lbs</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({item.weightKg.toFixed(2)} kg)</span>
                                  </div>
                                ) : <span className="fss-text-muted">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                            <td colSpan="2">{isES ? 'TOTALES GENERALES' : 'GRAND TOTALS'}</td>
                            <td>{isES ? 'Suma de provisiones' : 'Total Provisions'}</td>
                            <td>
                              <div style={{ color: '#1e40af' }}>{calcResults.totalWeightLbs.toFixed(2)} lbs</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>({calcResults.totalWeightKg.toFixed(2)} kg)</div>
                              <div style={{ marginTop: '0.25rem', color: 'var(--color-success)', fontSize: '1rem' }}>
                                {fmtDisplay(currency === 'USD' ? calcResults.totalCostUSD : calcResults.totalCostUSD * activeRate)}
                              </div>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="fss-calc-plan">
                  {Object.keys(FOOD_CATEGORIES).map(catKey => {
                    const items = groupedCalcPlan[catKey]
                    if (!items) return null
                    const cat = FOOD_CATEGORIES[catKey]
                    return (
                      <div key={catKey} className="food-category-block">
                        <div className="food-category-header">
                          <span className="cat-icon">{cat.icon}</span>
                          <h3>{isES ? cat.es : cat.en}</h3>
                        </div>
                        <div className="food-items-grid">
                          {items.map(item => (
                            <div key={item.id} className="food-item-card">
                              <div className="food-item-info">
                                <div className="food-item-name">{isES ? item.nameEs : item.nameEn}</div>
                                <div className="food-item-qty">
                                  <span style={{ fontWeight: 700, color: 'var(--color-primary-darker)', fontSize: '1.1rem' }}>
                                    {Math.ceil(item.qty)} {isES ? (
                                      item.unit === 'units' ? 'unid.' : 
                                      item.unit === 'loaves' ? 'hogazas' : 
                                      item.unit === 'cans' ? 'latas' : 
                                      item.unit === 'liters' ? 'litros' : 
                                      item.unit === 'dozen' ? 'docenas' : 
                                      item.unit === 'heads' ? 'cabezas' : 
                                      item.unit === 'box (20ct)' ? 'cajas' :
                                      item.unit === 'pack (12ct)' ? 'paq (12u)' :
                                      item.unit
                                    ) : (
                                      item.unit === 'units' ? 'units' : 
                                      item.unit === 'loaves' ? 'loaves' : 
                                      item.unit === 'cans' ? 'cans' : 
                                      item.unit === 'liters' ? 'liters' : 
                                      item.unit === 'dozen' ? 'dozen' : 
                                      item.unit === 'heads' ? 'heads' : 
                                      item.unit === 'box (20ct)' ? 'boxes' :
                                      item.unit
                                    )}
                                  </span>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '0.1rem' }}>
                                    ({item.qty.toFixed(2)})
                                  </div>
                                  {item.id === 'eggs' && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem' }}>
                                      📦 {Math.ceil(item.qty / 30)} {isES ? 'cartones' : 'cartons'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {item.weightKg > 0 && (
                                <div className="food-item-weight" style={{ margin: '0.25rem 0', padding: '0.25rem 0', borderTop: '1px dashed var(--color-border)', fontSize: '0.85rem' }}>
                                  <strong>⚖️ {item.weightLbs.toFixed(2)} lbs</strong> / {item.weightKg.toFixed(2)} kg
                                </div>
                              )}

                              <div className="food-item-storage">
                                <span className={`storage-tag ${item.storage.toLowerCase()}`}>
                                  {isES ? (item.storage === 'Dry' ? 'Seco' : item.storage === 'Cold' ? 'Frío' : 'Congelado') : item.storage}
                                </span>
                                <span className="shelf-life">⌛ {isES ? item.shelfLifeEs : item.shelfLifeEn}</span>
                              </div>
                              <div className="food-item-tip">💡 {isES ? item.tipEs : item.tipEn}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section: Overview */}
        <div id="overview" className="fss-scroll-section">
          <div className="fss-overview">
            <h2 className="fss-section-main-title">Tu Plan Personalizado / Your Personalized Plan</h2>

            <div className="fss-level-progress">
              <p className="fss-level-label">Tu nivel actual de seguridad alimentaria: <strong>Nivel {currentLevel}</strong></p>
              <div className="fss-level-bar">
                {SECURITY_LEVELS.map((lvl, i) => (
                  <div key={lvl.level} className="fss-level-segment" style={{
                    background: i < currentLevel ? levelColors[lvl.color] : 'var(--color-border)',
                    width: `${100 / SECURITY_LEVELS.length}%`
                  }}>
                    <span className="fss-level-dot">{i < currentLevel ? '✓' : lvl.level}</span>
                  </div>
                ))}
              </div>
              <p className="fss-level-desc">{currentLevel >= 1 ? t(SECURITY_LEVELS[currentLevel - 1]?.titleEs ? { es: SECURITY_LEVELS[currentLevel - 1].titleEs } : {}) : ''}</p>
            </div>

            <div className="fss-overview-grid">
              <Section icon="🎓" title="Educación Alimentaria" titleEn="Food Education" defaultOpen={false}>
                <div className="fss-edu-grid">
                  {Object.entries(EDUCATION).map(([key, val]) => (
                    <InfoCard key={key} icon={key === 'whyStorage' ? '🛡️' : key === 'whyVariety' ? '🌈' : key === 'whySeasoning' ? '🧂' : '📋'} title={val.es.split('.')[0]} titleEn={val.en.split('.')[0]}>
                      <p>{val.es}</p>
                      <p className="fss-text-muted">{val.en}</p>
                    </InfoCard>
                  ))}
                </div>
              </Section>

              <Section icon={tier === 'survival' ? '⚡' : tier === 'lower-middle' ? '🌱' : '🌟'} title={incomePlan.es.title} titleEn={incomePlan.en.title} defaultOpen={true}>
                <p className="fss-text-muted" style={{ marginBottom: '0.75rem' }}>{incomePlan.es.description}</p>
                <p className="fss-focus-label">{incomePlan.es.focus}</p>
                <ul className="fss-strategy-list">
                  {incomePlan.es.strategy.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <div className="fss-golden-rule">{incomePlan.es.rule}</div>
              </Section>

              <Section icon="🍽️" title="Comidas de la Semana" titleEn="This Week's Meals" defaultOpen={true}>
                <div className="fss-week-tabs">
                  {WEEKLY_MEAL_PLANS.map((week, i) => (
                    <button key={i} className={`fss-week-tab ${activeWeek === i ? 'active' : ''}`} onClick={() => setActiveWeek(i)}>
                      {t(week.label)}
                    </button>
                  ))}
                </div>
                <div className="fss-week-table">
                  <div className="fss-week-header">
                    <span className="fss-week-col-day">Día</span>
                    <span className="fss-week-col">Desayuno</span>
                    <span className="fss-week-col">Almuerzo</span>
                    <span className="fss-week-col">Cena</span>
                  </div>
                  {WEEKLY_MEAL_PLANS[activeWeek]?.days.map((day, i) => (
                    <div key={i} className="fss-week-row">
                      <span className="fss-week-col-day">{t(day.day)}</span>
                      <span className="fss-week-col">{t(day.breakfast)}</span>
                      <span className="fss-week-col">{t(day.lunch)}</span>
                      <span className="fss-week-col">{t(day.dinner)}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            <div className="fss-behavioral-box">
              <h3 className="fss-behavioral-title">🧠 Guía de Comportamiento / Behavioral Guidance</h3>
              <div className="fss-behavioral-grid">
                {BEHAVIORAL_GUIDANCE.map((item, i) => (
                  <div key={i} className="fss-behavioral-item">
                    <span className="fss-behavioral-bullet">•</span>
                    <div>
                      <p className="fss-behavioral-es">{item.es}</p>
                      <p className="fss-behavioral-en">{item.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Education */}
        <div id="education" className="fss-scroll-section">
          <div className="fss-education">
            <h2 className="fss-section-main-title">📖 Educación Alimentaria / Food Education</h2>
            <div className="fss-edu-full-grid">
              <InfoCard icon="🛡️" title="¿Por qué almacenar?" titleEn="Why store food?">
                <p>{EDUCATION.whyStorage.es}</p>
                <p className="fss-text-muted">{EDUCATION.whyStorage.en}</p>
                <div className="fss-edu-takeaway">
                  <strong>Conclusión:</strong> Tener comida almacenada es tu mejor seguro contra la inflación y emergencias.
                </div>
              </InfoCard>
              <InfoCard icon="🌈" title="¿Por qué variedad?" titleEn="Why variety?">
                <p>{EDUCATION.whyVariety.es}</p>
                <p className="fss-text-muted">{EDUCATION.whyVariety.en}</p>
                <div className="fss-edu-takeaway">
                  <strong>Conclusión:</strong> Cada grupo de alimentos aporta algo único. Arcoíris en tu plato = salud.
                </div>
              </InfoCard>
              <InfoCard icon="🧂" title="¿Por qué sazonar?" titleEn="Why season?">
                <p>{EDUCATION.whySeasoning.es}</p>
                <p className="fss-text-muted">{EDUCATION.whySeasoning.en}</p>
                <div className="fss-edu-takeaway">
                  <strong>Conclusión:</strong> La sal y las especias son la diferencia entre un plan que funciona y uno que abandonas.
                </div>
              </InfoCard>
              <InfoCard icon="📋" title="¿Por qué planificar?" titleEn="Why plan?">
                <p>{EDUCATION.whyPlanning.es}</p>
                <p className="fss-text-muted">{EDUCATION.whyPlanning.en}</p>
                <div className="fss-edu-takeaway">
                  <strong>Conclusión:</strong> 15 minutos de plan el domingo = menos estrés y más dinero toda la semana.
                </div>
              </InfoCard>
            </div>

            <div className="fss-anti-overwhelm">
              <h3 className="fss-behavioral-title">🧠 Anti-Saturación / Anti-Overwhelm System</h3>
              <div className="fss-anti-grid">
                {ANTI_OVERWHELM.map((item, i) => (
                  <div key={i} className="fss-anti-card">
                    <h4 className="fss-anti-title">{t(item.title)}</h4>
                    <p className="fss-anti-tip">{t(item.tip)}</p>
                    <div className="fss-anti-example">
                      <strong>💡 Ejemplo: </strong>{t(item.example)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Levels */}
        <div id="levels" className="fss-scroll-section">
          <div className="fss-levels">
            <h2 className="fss-section-main-title">📈 Niveles de Seguridad Alimentaria / Food Security Levels</h2>
            <p className="fss-levels-intro">
              Construye tu seguridad alimentaria paso a paso. Cada nivel se basa en el anterior.
              No intentes saltar del nivel 1 al 5 — el progreso sostenible es el que dura.
            </p>
            {SECURITY_LEVELS.map((lvl, i) => (
              <div key={lvl.level} className={`fss-level-card ${i < currentLevel ? 'achieved' : ''}`} style={{ borderLeftColor: levelColors[lvl.color] }}>
                <div className="fss-level-card-header">
                  <span className="fss-level-emoji">{lvl.emoji}</span>
                  <div className="fss-level-card-title">
                    <span className="fss-level-title-text">{lvl.titleEs}</span>
                    <span className="fss-level-title-en">{lvl.titleEn}</span>
                  </div>
                  {i < currentLevel && <span className="fss-level-achieved-badge">✓ ALCANZADO</span>}
                  {i === currentLevel && <span className="fss-level-current-badge">◉ ACTUAL</span>}
                </div>
                <div className="fss-level-card-body">
                  <p className="fss-level-goal"><strong>Meta:</strong> {lvl.goalEs} / <em>{lvl.goalEn}</em></p>
                  <div className="fss-level-details">
                    <strong>Detalles:</strong>
                    <ul>{lvl.detailsEs.map((d, j) => <li key={j}>{d}</li>)}</ul>
                    <ul className="fss-text-muted">{lvl.detailsEn.map((d, j) => <li key={j}>{d}</li>)}</ul>
                  </div>
                  <div className="fss-level-staples">
                    <strong>Provisiones clave:</strong> {lvl.staples.es}
                    <br /><span className="fss-text-muted">{lvl.staples.en}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Support Resources */}
        <div id="external-resources" className="fss-scroll-section">
          <div className="fss-external">
            <h2 className="fss-section-main-title">{isES ? "Apoyo Externo y Recursos" : "External Support & Resources"}</h2>
            <p className="fss-text-muted" style={{ marginBottom: '2rem' }}>
              {isES 
                ? "Si tu situación es crítica, estos recursos gratuitos pueden ayudarte a estabilizarte mientras construyes tu autosuficiencia."
                : "If your situation is critical, these free resources can help you stabilize while you build your self-sufficiency."}
            </p>
            <div className="fss-resources-grid">
              {foodResources.length > 0 ? foodResources.map(r => (
                <div key={r.id} className="resource-card">
                  <div className="resource-card-header">
                    <div className="resource-card-name">{isES ? r.nameEs : r.name}</div>
                    <div className="resource-avail-badge">{r.availability}</div>
                  </div>
                  <p className="resource-desc">{isES ? r.descEs : r.descEn}</p>
                  <div className="resource-why">
                    <span className="resource-why-icon">💡</span>
                    <span>{isES ? r.reasonEs : r.reasonEn}</span>
                  </div>
                  <div className="resource-access">
                    {r.website && <a href={r.website} target="_blank" rel="noopener noreferrer" className="resource-link">🔗 {isES ? "Visitar" : "Visit"}</a>}
                    {r.phone && <span className="resource-phone">📞 {r.phone}</span>}
                    {r.address && <span className="resource-phone">📍 {r.address}</span>}
                  </div>
                </div>
              )) : (
                <div className="resources-empty">
                  <span>🔎</span>
                  <p>{isES ? "No se encontraron recursos para tu ubicación." : "No resources found for your location."}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Meals */}
        <div id="meals" className="fss-scroll-section">
          <div className="fss-meals">
            <h2 className="fss-section-main-title">🍽️ Sistema de Comidas / Meal System</h2>

            <div className="fss-meal-rotation">
              <h3 className="fss-subsection-title">{t(MONTHLY_ROTATION[0].label)}</h3>
              <div className="fss-rotation-grid">
                {MONTHLY_ROTATION[0].weeks.map((w, i) => (
                  <div key={i} className={`fss-rotation-card ${activeWeek === i ? 'active' : ''}`} onClick={() => setActiveWeek(i)}>
                    <span className="fss-rotation-num">Semana {i + 1}</span>
                    <p>{t(w)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="fss-meal-rotation">
              <h3 className="fss-subsection-title">{t(MONTHLY_ROTATION[1].label)}</h3>
              <div className="fss-rotation-grid">
                {MONTHLY_ROTATION[1].weeks.map((w, i) => (
                  <div key={i} className="fss-rotation-card" style={{ cursor: 'default' }}>
                    <span className="fss-rotation-num">Semana {i + 1}</span>
                    <p>{t(w)}</p>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="fss-subsection-title">Plan Semanal Detallado / Detailed Weekly Plan</h3>
            <div className="fss-week-tabs">
              {WEEKLY_MEAL_PLANS.map((week, i) => (
                <button key={i} className={`fss-week-tab ${activeWeek === i ? 'active' : ''}`} onClick={() => setActiveWeek(i)}>
                  {t(week.label)}
                </button>
              ))}
            </div>
            <div className="fss-week-table">
              <div className="fss-week-header">
                <span className="fss-week-col-day">Día / Day</span>
                <span className="fss-week-col">Desayuno / Breakfast</span>
                <span className="fss-week-col">Almuerzo / Lunch</span>
                <span className="fss-week-col">Cena / Dinner</span>
              </div>
              {WEEKLY_MEAL_PLANS[activeWeek]?.days.map((day, i) => (
                <div key={i} className="fss-week-row">
                  <span className="fss-week-col-day">{t(day.day)}</span>
                  <span className="fss-week-col">{t(day.breakfast)}</span>
                  <span className="fss-week-col">{t(day.lunch)}</span>
                  <span className="fss-week-col">{t(day.dinner)}</span>
                </div>
              ))}
            </div>

            <div className="fss-income-plan-reminder">
              <h3>{incomePlan.es.title}</h3>
              <p>{incomePlan.es.description}</p>
              <ul>{incomePlan.es.strategy.map((s, i) => <li key={i}>{s}</li>)}</ul>
              <div className="fss-golden-rule">{incomePlan.es.rule}</div>
            </div>
          </div>
        </div>

        {/* Section: Recipes */}
        <div id="recipes" className="fss-scroll-section">
          <div className="fss-recipes">
            <h2 className="fss-section-main-title">📝 Recetas Completas / Full Recipes</h2>
            <p className="fss-recipes-intro">
              Cada receta incluye ingredientes exactos, medidas, pasos detallados, costo estimado y compatibilidad con almacenamiento.
              Estas recetas usan alimentos que deberías tener en tu despensa según tu nivel actual.
            </p>
            <div className="fss-recipes-grid">
              {userRecipes.map(recipe => (
                <div key={recipe.id} className="fss-recipe-card">
                  <div className="fss-recipe-header">
                    <div>
                      <h3 className="fss-recipe-name">{recipe.nameEs} / {recipe.nameEn}</h3>
                      <div className="fss-recipe-meal">{recipe.meal.es} / {recipe.meal.en}</div>
                    </div>
                    <div className="fss-recipe-cost">
                      <span className="fss-recipe-cost-label">Costo / Cost:</span>
                      <span className="fss-recipe-cost-amount">
                        {symbol}{recipe.cost[location]?.min || recipe.cost.HN.min} - {symbol}{recipe.cost[location]?.max || recipe.cost.HN.max}
                      </span>
                    </div>
                  </div>
                  <div className="fss-recipe-body">
                    <div className="fss-recipe-section">
                      <strong>Ingredientes / Ingredients:</strong>
                      <ul className="fss-recipe-ingredients">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing.es}<br /><span className="fss-text-muted">{ing.en}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="fss-recipe-section">
                      <strong>Instrucciones / Steps:</strong>
                      <ol className="fss-recipe-steps">
                        {recipe.steps.map((step, i) => (
                          <li key={i}>{step.es}<br /><span className="fss-text-muted">{step.en}</span></li>
                        ))}
                      </ol>
                    </div>
                    <div className="fss-recipe-storage-tip">
                      <strong>📦 Almacenamiento / Storage:</strong> {recipe.storage.es}<br />
                      <span className="fss-text-muted">{recipe.storage.en}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Storage */}
        <div id="storage" className="fss-scroll-section">
          <div className="fss-storage">
            <h2 className="fss-section-main-title">📦 Almacenamiento / Storage Education</h2>
            <p className="fss-storage-intro">
              Cómo almacenas tu comida es TAN importante como qué compras. Un buen almacenamiento previene pérdidas,
              plagas y desperdicio. Aquí te enseñamos todo lo que necesitas saber.
            </p>
            <div className="fss-storage-grid">
              {STORAGE_GUIDE.map((item, i) => (
                <div key={i} className="fss-storage-card">
                  <h3 className="fss-storage-category">{item.category.es}<br /><span className="fss-text-muted">{item.category.en}</span></h3>
                  <div className="fss-storage-detail">
                    <span className="fss-storage-label">Método / Method:</span>
                    <p>{item.method.es}<br /><span className="fss-text-muted">{item.method.en}</span></p>
                  </div>
                  <div className="fss-storage-detail">
                    <span className="fss-storage-label">🐛 Control de plagas:</span>
                    <p>{item.pestPrevention.es}<br /><span className="fss-text-muted">{item.pestPrevention.en}</span></p>
                  </div>
                  <div className="fss-storage-detail">
                    <span className="fss-storage-label">⏳ Vida útil / Shelf life:</span>
                    <p>{item.shelfLife.es}<br /><span className="fss-text-muted">{item.shelfLife.en}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="fss-anti-overwhelm" style={{ marginTop: '2rem' }}>
              <h3 className="fss-behavioral-title">🧠 Anti-Saturación / Anti-Overwhelm Tips</h3>
              <div className="fss-anti-grid">
                {ANTI_OVERWHELM.map((item, i) => (
                  <div key={i} className="fss-anti-card">
                    <h4 className="fss-anti-title">{t(item.title)}</h4>
                    <p className="fss-anti-tip">{t(item.tip)}</p>
                    <div className="fss-anti-example">
                      <strong>💡 Ejemplo: </strong>{t(item.example)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
