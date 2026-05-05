import { useState, useEffect } from 'react'
import { useCurrency } from './CurrencyContext'

const STEPS = [
  { num: 1, label: 'Información', labelEn: 'Info' },
  { num: 2, label: 'Necesidades', labelEn: 'Needs' },
  { num: 3, label: 'Ingresos', labelEn: 'Income' },
  { num: 4, label: 'Gastos', labelEn: 'Expenses' },
  { num: 5, label: 'Recursos', labelEn: 'Resources' },
  { num: 6, label: 'Metas', labelEn: 'Goals' },
  { num: 7, label: 'Servicio', labelEn: 'Service' },
]

const STEP_TITLES = {
  1: { es: 'Información Personal', en: 'Personal Information' },
  2: { es: 'Evaluación de Necesidades', en: 'Needs Assessment' },
  3: { es: 'Ingresos y Finanzas', en: 'Income & Finances' },
  4: { es: 'Gastos Mensuales', en: 'Monthly Expenses' },
  5: { es: 'Recursos y Habilidades', en: 'Resources & Skills' },
  6: { es: 'Metas y Plan de Acción', en: 'Goals & Action Plan' },
  7: { es: 'Trabajo y Servicio', en: 'Work & Service' },
}

// ─── Shared sub-components (declared at module level) ────────────────────────

function ScaleInput({ field, label, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="scale-input">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button"
            className={`scale-btn ${value === n ? 'selected' : ''}`}
            onClick={() => onChange(field, n)}
          >{n}</button>
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center', marginLeft: '0.5rem' }}>
          1=Crítico/Critical · 5=Bien/Good
        </span>
      </div>
    </div>
  )
}

function GoalSection({ title, titleEn, timeframe, goals, onUpdate, onAdd, onRemove, onApplySuggestion, placeholder, suggestions }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ background: 'var(--color-accent)', color: 'var(--color-primary-darker)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{timeframe}</span>
        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{title} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.85em' }}>/ {titleEn}</span></span>
      </div>
      {suggestions && suggestions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {suggestions.map((sug, i) => (
            <button 
              key={i} 
              className="suggestion-chip" 
              style={{ 
                fontSize: '0.8rem', 
                padding: '0.75rem 1rem', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--color-white)', 
                color: 'var(--color-text)', 
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.3
              }} 
              onClick={() => onApplySuggestion(sug)}
            >
              <span style={{ fontWeight: 600 }}>{sug.title.split(' / ')[0]}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{sug.title.split(' / ')[1]}</span>
            </button>
          ))}
        </div>
      )}
      {goals.map((goal, idx) => (
        <div key={goal.id} className="goal-item">
          <div className="goal-item-header">
            <span className="goal-item-title">Meta #{idx + 1} / Goal #{idx + 1}</span>
            {goals.length > 1 && (
              <button className="btn btn-sm" style={{ background: '#fcedeb', color: 'var(--color-error)', border: 'none' }}
                onClick={() => onRemove(goal.id)}>✕</button>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Meta / Goal</label>
            <input className="form-input" value={goal.goal} onChange={e => onUpdate(goal.id, 'goal', e.target.value)} placeholder={placeholder} />
          </div>
          <div className="form-group">
            <label className="form-label">Pasos a seguir / Steps to take</label>
            <textarea className="form-textarea" value={goal.steps} onChange={e => onUpdate(goal.id, 'steps', e.target.value)}
              placeholder="¿Qué pasos específicos tomarás? / What specific steps will you take?" rows={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha límite / Deadline</label>
            <input type="date" className="form-input" value={goal.deadline} onChange={e => onUpdate(goal.id, 'deadline', e.target.value)} />
          </div>
        </div>
      ))}
      <button className="budget-add-btn" onClick={onAdd}>+ Agregar meta / Add goal</button>
    </div>
  )
}

function StepProgress({ current }) {
  return (
    <div className="ss-progress">
      <div className="ss-progress-steps">
        {STEPS.map((step, idx) => (
          <div key={step.num} className="ss-step-item">
            <div className={`ss-step-circle ${current === step.num ? 'active' : current > step.num ? 'done' : ''}`}>
              {current > step.num ? '✓' : step.num}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`ss-step-line ${current > step.num ? 'done' : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div className="ss-step-labels">
        {STEPS.map(step => (
          <span key={step.num} className={`ss-step-label ${current === step.num ? 'active' : current > step.num ? 'done' : ''}`}>
            {step.label}<br /><span style={{ opacity: 0.7 }}>{step.labelEn}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── STEP 1 ──────────────────────────────────────────────────────────────────
function Step1({ data, onChange }) {
  const f = (field, val) => onChange({ ...data, [field]: val })
  return (
    <div>
      <div className="info-box" style={{ background: '#f0f9ff', borderLeft: '4px solid var(--color-primary)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          📋 <strong>¿Por qué pedimos esto? / Why do we ask this?</strong><br/>
          Esta información nos ayuda a crear un plan realista. No te preocupes por tu situación actual; esto solo sirve para encontrar las mejores oportunidades y recursos adaptados a tu realidad.<br />
          <em style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>This helps us create a realistic plan. Don't worry about your current situation; this is only used to find the best opportunities and resources tailored to your reality.</em>
        </p>
      </div>
      <p className="form-section-title">Información Personal / Personal Information</p>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Nombre completo / Full name <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input className="form-input" value={data.name || ''} onChange={e => f('name', e.target.value)} placeholder="Nombre y apellidos / First and last name" />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha / Date</label>
          <input type="date" className="form-input" value={data.date || ''} onChange={e => f('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Edad / Age</label>
          <input type="number" className="form-input" value={data.age || ''} onChange={e => f('age', e.target.value)} placeholder="Años / Years" min={0} max={120} />
        </div>
        <div className="form-group">
          <label className="form-label">Estado civil / Marital status</label>
          <select className="form-select" value={data.maritalStatus || ''} onChange={e => f('maritalStatus', e.target.value)}>
            <option value="">Seleccionar / Select</option>
            <option value="single">Soltero/a / Single</option>
            <option value="married">Casado/a / Married</option>
            <option value="divorced">Divorciado/a / Divorced</option>
            <option value="widowed">Viudo/a / Widowed</option>
            <option value="union">Unión libre / Common-law</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Nombre del cónyuge / Spouse name</label>
          <input className="form-input" value={data.spouseName || ''} onChange={e => f('spouseName', e.target.value)} placeholder="Si aplica / If applicable" />
        </div>
        <div className="form-group">
          <label className="form-label">Número de dependientes / Number of dependents</label>
          <input type="number" className="form-input" value={data.dependents || ''} onChange={e => f('dependents', e.target.value)} placeholder="0" min={0} />
        </div>
        <div className="form-group">
          <label className="form-label">Edades de dependientes / Ages of dependents</label>
          <input className="form-input" value={data.dependentAges || ''} onChange={e => f('dependentAges', e.target.value)} placeholder="Ej: 5, 8, 12 / E.g.: 5, 8, 12" />
        </div>
        <div className="form-group">
          <label className="form-label">Ciudad / Departamento / City / Department</label>
          <input className="form-input" value={data.location || ''} onChange={e => f('location', e.target.value)} placeholder="Ej: Tegucigalpa, Francisco Morazán" />
        </div>
      </div>
      <hr className="divider" />
      <p className="form-section-title">Situación Laboral / Employment Situation</p>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Estado de empleo / Employment status</label>
          <select className="form-select" value={data.employmentStatus || ''} onChange={e => f('employmentStatus', e.target.value)}>
            <option value="">Seleccionar / Select</option>
            <option value="employed_full">Empleado tiempo completo / Full-time employed</option>
            <option value="employed_part">Empleado tiempo parcial / Part-time employed</option>
            <option value="self_employed">Trabajador independiente / Self-employed</option>
            <option value="unemployed">Desempleado / Unemployed</option>
            <option value="looking">Buscando empleo / Job seeking</option>
            <option value="retired">Jubilado / Retired</option>
            <option value="student">Estudiante / Student</option>
            <option value="homemaker">Ama de casa / Homemaker</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Ocupación / Occupation</label>
          <input className="form-input" value={data.occupation || ''} onChange={e => f('occupation', e.target.value)} placeholder="Ej: Maestro, Comerciante / E.g.: Teacher, Merchant" />
        </div>
        <div className="form-group">
          <label className="form-label">Nivel educativo / Education level</label>
          <select className="form-select" value={data.education || ''} onChange={e => f('education', e.target.value)}>
            <option value="">Seleccionar / Select</option>
            <option value="none">Sin estudios / No formal education</option>
            <option value="primary">Primaria / Primary school</option>
            <option value="secondary">Secundaria / Secondary school</option>
            <option value="high_school">Bachillerato / High school</option>
            <option value="technical">Técnico / Technical degree</option>
            <option value="university">Universidad / University</option>
            <option value="postgrad">Posgrado / Postgraduate</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Años en situación actual / Years in current situation</label>
          <input type="number" className="form-input" value={data.yearsInSituation || ''} onChange={e => f('yearsInSituation', e.target.value)} placeholder="0" min={0} />
        </div>
      </div>
    </div>
  )
}

// ─── STEP 2 ──────────────────────────────────────────────────────────────────
function Step2({ data, onChange }) {
  const f = (field, val) => onChange({ ...data, [field]: val })
  return (
    <div>
      <div className="info-box" style={{ background: '#fffbeb', borderLeft: '4px solid var(--color-warning)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          🔍 <strong>Sé completamente honesto / Be completely honest</strong><br/>
          Marcar un 1 (Crítico) no es un fracaso, es el primer paso para conseguir ayuda urgente. Tu plan priorizará estas áreas automáticamente para asegurar tu bienestar inmediato antes de enfocarse en metas a largo plazo.<br />
          <em style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>Marking a 1 (Critical) isn't a failure, it's the first step to getting urgent help. Your plan will prioritize these areas automatically.</em>
        </p>
      </div>
      <p className="form-section-title">Necesidades Inmediatas / Immediate Needs</p>
      <ScaleInput field="foodSecurity" label="🍽️ Seguridad alimentaria / Food security" value={data.foodSecurity} onChange={f} />
      <ScaleInput field="housingSecurity" label="🏠 Estabilidad de vivienda / Housing stability" value={data.housingSecurity} onChange={f} />
      <ScaleInput field="healthStatus" label="🏥 Salud física / Physical health" value={data.healthStatus} onChange={f} />
      <ScaleInput field="mentalHealth" label="🧠 Salud emocional/mental / Emotional/mental health" value={data.mentalHealth} onChange={f} />
      <ScaleInput field="safetyLevel" label="🛡️ Seguridad personal / Personal safety" value={data.safetyLevel} onChange={f} />
      <ScaleInput field="clothingNeeds" label="👗 Necesidades de ropa / Clothing needs" value={data.clothingNeeds} onChange={f} />
      <ScaleInput field="transportAccess" label="🚗 Acceso a transporte / Transportation access" value={data.transportAccess} onChange={f} />
      <hr className="divider" />
      <p className="form-section-title">Detalles / Details</p>
      <div className="form-group">
        <label className="form-label">Situación de vivienda / Housing situation</label>
        <div className="radio-group">
          {[['own','Casa propia / Own home'],['rent','Alquiler / Renting'],['family','Casa de familiar / Family home'],['unstable','Situación inestable / Unstable situation'],['homeless','Sin vivienda / Homeless']].map(([val, lbl]) => (
            <div key={val} className="radio-item">
              <input type="radio" id={`housing_${val}`} name="housingSituation" value={val} checked={data.housingSituation === val} onChange={() => f('housingSituation', val)} />
              <label htmlFor={`housing_${val}`}>{lbl}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Necesidades médicas específicas / Specific medical needs</label>
        <textarea className="form-textarea" value={data.medicalNeeds || ''} onChange={e => f('medicalNeeds', e.target.value)} placeholder="Describe condiciones médicas, medicamentos necesarios, etc." rows={3} />
      </div>
      <div className="form-group">
        <label className="form-label">Necesidades emocionales / Emotional needs</label>
        <textarea className="form-textarea" value={data.emotionalNeeds || ''} onChange={e => f('emotionalNeeds', e.target.value)} placeholder="Describe situaciones de estrés, ansiedad, duelo, etc." rows={3} />
      </div>
      <div className="form-group">
        <label className="form-label">Otras necesidades inmediatas / Other immediate needs</label>
        <textarea className="form-textarea" value={data.otherNeeds || ''} onChange={e => f('otherNeeds', e.target.value)} placeholder="Cualquier otra necesidad urgente / Any other urgent need" rows={3} />
      </div>
    </div>
  )
}

// ─── STEP 3 ──────────────────────────────────────────────────────────────────
function Step3({ data, onChange, incomeSources }) {
  const { symbol, fmt } = useCurrency()
  const f = (field, val) => onChange({ ...data, [field]: val })
  const [debts, setDebts] = useState(data.debts || [{ id: 1, type: '', creditor: '', balance: '', payment: '', rate: '' }])

  const totalFromBudget = incomeSources ? incomeSources.reduce((sum, src) => sum + (parseFloat(src.amount) || 0), 0) : 0

  function autofillFromBudget() {
    if (!incomeSources) return;
    const newData = { ...data };
    let primary = 0;
    let secondary = 0;
    let business = 0;
    let other = 0;
    incomeSources.forEach(src => {
      const amt = parseFloat(src.amount) || 0;
      const n = (src.name || '').toLowerCase();
      if (n.includes('principal') || n.includes('salario')) primary += amt;
      else if (n.includes('secundari') || n.includes('conyug') || n.includes('espos')) secondary += amt;
      else if (n.includes('negocio') || n.includes('venta')) business += amt;
      else other += amt;
    });
    
    if (primary > 0) newData.incSalary = primary.toFixed(2);
    if (secondary > 0) newData.incSpouse = secondary.toFixed(2);
    if (business > 0) newData.incBusiness = business.toFixed(2);
    if (other > 0) newData.incOther = other.toFixed(2);
    
    onChange(newData);
  }

  function updateDebt(id, field, val) {
    const updated = debts.map(d => d.id === id ? { ...d, [field]: val } : d)
    setDebts(updated); f('debts', updated)
  }
  function addDebt() {
    const newId = Math.max(...debts.map(d => d.id), 0) + 1
    const updated = [...debts, { id: newId, type: '', creditor: '', balance: '', payment: '', rate: '' }]
    setDebts(updated); f('debts', updated)
  }
  function removeDebt(id) {
    const updated = debts.filter(d => d.id !== id)
    setDebts(updated); f('debts', updated)
  }

  return (
    <div>
      <div className="info-box">
        <p>📊 Si ya completaste la calculadora de presupuesto, tus ingresos se muestran abajo.<br /><em>If you already completed the budget calculator, your income is shown below.</em></p>
      </div>
      {totalFromBudget > 0 && (
        <div style={{ background: '#eaf8ee', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600, margin: 0 }}>✅ Ingresos del presupuesto / Budget income: {fmt(totalFromBudget)}</p>
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={autofillFromBudget}>
            ⬇️ Autocompletar / Autofill
          </button>
        </div>
      )}
      <p className="form-section-title">Ingresos Mensuales / Monthly Income</p>
      <div className="form-grid form-grid-2">
        {[['incSalary','Salario principal / Primary salary'],['incSpouse','Salario cónyuge / Spouse salary'],['incBusiness','Negocio propio / Own business'],['incRent','Alquiler de propiedades / Rental income'],['incRemittance','Remesas / Remittances'],['incGovAid','Ayuda del gobierno / Government aid'],['incFamily','Apoyo familiar / Family support'],['incOther','Otros ingresos / Other income']].map(([field, label]) => (
          <div key={field} className="form-group">
            <label className="form-label">{label}</label>
            <div className="input-with-prefix">
              <span className="input-prefix">{symbol}</span>
              <input type="number" className="form-input" value={data[field] || ''} min={0} step={0.01} onChange={e => f(field, e.target.value)} placeholder="0.00" />
            </div>
          </div>
        ))}
      </div>
      <hr className="divider" />
      <p className="form-section-title">Situación de Deudas / Debt Situation</p>
      <div className="info-box" style={{ background: '#fef2f2', borderLeft: '4px solid var(--color-error)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          💳 <strong>No temas a los números / Don't fear the numbers</strong><br/>
          Enfrentar las deudas puede ser intimidante, pero escribirlas es el primer paso para recuperar el control. No te sientas mal si los montos parecen altos hoy; tu plan te ayudará a organizar los pagos.<br />
          <em style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>Facing debt can be intimidating, but writing it down is the first step to regaining control. Don't feel bad if the amounts seem high today.</em>
        </p>
      </div>
      {debts.map((debt, idx) => (
        <div key={debt.id} className="goal-item">
          <div className="goal-item-header">
            <span className="goal-item-title">Deuda #{idx + 1} / Debt #{idx + 1}</span>
            {debts.length > 1 && <button className="btn btn-sm" style={{ background: '#fcedeb', color: 'var(--color-error)', border: 'none' }} onClick={() => removeDebt(debt.id)}>✕ Eliminar</button>}
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Tipo / Type</label>
              <select className="form-select" value={debt.type} onChange={e => updateDebt(debt.id, 'type', e.target.value)}>
                <option value="">Seleccionar / Select</option>
                <option value="credit_card">Tarjeta de crédito / Credit card</option>
                <option value="personal_loan">Préstamo personal / Personal loan</option>
                <option value="mortgage">Hipoteca / Mortgage</option>
                <option value="car_loan">Préstamo de auto / Car loan</option>
                <option value="student_loan">Préstamo estudiantil / Student loan</option>
                <option value="medical">Deuda médica / Medical debt</option>
                <option value="family">Deuda familiar / Family debt</option>
                <option value="other">Otro / Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Acreedor / Creditor</label>
              <input className="form-input" value={debt.creditor} onChange={e => updateDebt(debt.id, 'creditor', e.target.value)} placeholder="Nombre del banco/persona" />
            </div>
            <div className="form-group">
              <label className="form-label">Saldo total / Total balance</label>
              <div className="input-with-prefix"><span className="input-prefix">{symbol}</span>
                <input type="number" className="form-input" value={debt.balance} min={0} step={0.01} onChange={e => updateDebt(debt.id, 'balance', e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Pago mensual / Monthly payment</label>
              <div className="input-with-prefix"><span className="input-prefix">{symbol}</span>
                <input type="number" className="form-input" value={debt.payment} min={0} step={0.01} onChange={e => updateDebt(debt.id, 'payment', e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tasa de interés / Interest rate (%)</label>
              <input type="number" className="form-input" value={debt.rate} min={0} max={200} step={0.1} onChange={e => updateDebt(debt.id, 'rate', e.target.value)} placeholder="0.0%" />
            </div>
          </div>
        </div>
      ))}
      <button className="budget-add-btn" onClick={addDebt}>+ Agregar deuda / Add debt</button>
      <hr className="divider" />
      <p className="form-section-title">Ahorros y Activos / Savings & Assets</p>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Fondo de emergencia / Emergency fund</label>
          <div className="input-with-prefix"><span className="input-prefix">{symbol}</span>
            <input type="number" className="form-input" value={data.emergencyFund || ''} min={0} step={0.01} onChange={e => f('emergencyFund', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Ahorros totales / Total savings</label>
          <div className="input-with-prefix"><span className="input-prefix">{symbol}</span>
            <input type="number" className="form-input" value={data.totalSavings || ''} min={0} step={0.01} onChange={e => f('totalSavings', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Propiedades / Properties</label>
          <textarea className="form-textarea" value={data.properties || ''} onChange={e => f('properties', e.target.value)} placeholder="Describe propiedades que posees / Describe properties you own" rows={2} />
        </div>
        <div className="form-group">
          <label className="form-label">Otros activos / Other assets</label>
          <textarea className="form-textarea" value={data.otherAssets || ''} onChange={e => f('otherAssets', e.target.value)} placeholder="Vehículos, equipos, etc. / Vehicles, equipment, etc." rows={2} />
        </div>
      </div>
    </div>
  )
}

// ─── STEP 4 ──────────────────────────────────────────────────────────────────
function Step4({ data, onChange, budgetData }) {
  const { symbol, fmt } = useCurrency()
  const f = (field, val) => onChange({ ...data, [field]: val })
  const totalFromBudget = budgetData ? budgetData.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0), 0) : 0

  function autofillFromBudget() {
    if (!budgetData) return;
    const newData = { ...data };
    const MAP = {
      housing: 'expHousing', food: 'expFood', transport: 'expTransport', utilities: 'expUtilities',
      health: 'expHealth', clothing: 'expClothing', education: 'expEducation', debt: 'expDebt',
      savings: 'expSavings', tithes: 'expTithes', personal: 'expPersonal', other: 'expOther',
    };
    budgetData.forEach(cat => {
      const total = cat.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
      if (MAP[cat.id] && total > 0) {
        newData[MAP[cat.id]] = total.toFixed(2);
      }
    });
    onChange(newData);
  }

  const EXPENSE_REDUCTION_IDEAS = [
    "📺 Cancelar suscripciones de TV/Streaming / Cancel TV/Streaming subscriptions",
    "🍔 Reducir comidas fuera de casa o delivery / Reduce dining out or food delivery",
    "🍱 Llevar almuerzo preparado al trabajo / Bring packed lunch to work",
    "🛍️ Reducir compras impulsivas o innecesarias / Reduce impulse or unnecessary shopping",
    "🛒 Cambiar a marcas genéricas en el supermercado / Switch to generic grocery brands",
    "⚡ Reducir consumo de electricidad (apagar luces/AC) / Reduce electricity usage",
    "📱 Cambiar a un plan de celular/internet más barato / Switch to a cheaper phone/internet plan",
    "🚗 Usar más transporte público o compartir viajes / Carpool or use public transit more",
    "📅 Planificar el menú semanal antes de comprar / Plan weekly menu before shopping",
    "🍵 Preparar té de hierbas en casa en lugar de comprarlo / Make herbal tea at home instead of buying it"
  ];

  function appendSuggestion(text) {
    const current = data.reducibleExpenses || '';
    const updated = current ? `${current}\n• ${text}` : `• ${text}`;
    f('reducibleExpenses', updated);
  }

  return (
    <div>
      <div className="info-box">
        <p>📊 Si ya completaste la calculadora de presupuesto, tus gastos se muestran abajo.<br /><em>If you already completed the budget calculator, your expenses are shown below.</em></p>
      </div>
      {totalFromBudget > 0 && (
        <div style={{ background: '#eaf8ee', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600, margin: 0 }}>✅ Gastos del presupuesto / Budget expenses: {fmt(totalFromBudget)}</p>
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={autofillFromBudget}>
            ⬇️ Autocompletar / Autofill
          </button>
        </div>
      )}
      <p className="form-section-title">Gastos Mensuales / Monthly Expenses</p>
      <div className="form-grid form-grid-2">
        {[['expHousing','🏠 Vivienda / Housing'],['expFood','🍽️ Alimentación / Food'],['expTransport','🚗 Transporte / Transportation'],['expUtilities','💡 Servicios / Utilities'],['expHealth','🏥 Salud / Health'],['expClothing','👗 Ropa / Clothing'],['expEducation','📚 Educación / Education'],['expDebt','💳 Deudas / Debt payments'],['expSavings','💰 Ahorro / Savings'],['expTithes','🙏 Diezmos / Tithes'],['expPersonal','🎉 Personal / Personal'],['expOther','➕ Otros / Other']].map(([field, label]) => (
          <div key={field} className="form-group">
            <label className="form-label">{label}</label>
            <div className="input-with-prefix"><span className="input-prefix">{symbol}</span>
              <input type="number" className="form-input" value={data[field] || ''} min={0} step={0.01} onChange={e => f(field, e.target.value)} placeholder="0.00" />
            </div>
          </div>
        ))}
      </div>
      <hr className="divider" />
      <p className="form-section-title">Gastos a Reducir / Expenses to Reduce</p>
      
      <div className="info-box" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)', marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          💡 <strong>Ideas para ahorrar / Savings Ideas:</strong> Sabemos que reducir gastos puede ser abrumador. Haz clic en las sugerencias abajo para añadirlas a tu plan.
          <br /><em style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>We know reducing expenses can be overwhelming. Click on the suggestions below to add them to your plan.</em>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
          {EXPENSE_REDUCTION_IDEAS.map((idea, i) => (
            <button 
              key={i} 
              className="btn btn-ghost" 
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '100px', background: 'var(--color-white)', color: 'var(--color-text)' }}
              onClick={() => appendSuggestion(idea)}
            >
              + {idea.split(' / ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">¿Qué gastos podrías reducir o eliminar? / What expenses could you reduce or eliminate?</label>
        <textarea className="form-textarea" value={data.reducibleExpenses || ''} onChange={e => f('reducibleExpenses', e.target.value)} placeholder="Ej: Suscripciones de streaming, comer fuera... Haz clic en las sugerencias arriba." rows={5} />
      </div>
      <div className="form-group">
        <label className="form-label">Monto estimado a ahorrar / Estimated amount to save</label>
        <div className="input-with-prefix"><span className="input-prefix">{symbol}</span>
          <input type="number" className="form-input" value={data.potentialSavings || ''} min={0} step={0.01} onChange={e => f('potentialSavings', e.target.value)} placeholder="0.00" />
        </div>
      </div>
    </div>
  )
}

// ─── STEP 5 ──────────────────────────────────────────────────────────────────
const SKILL_OPTIONS = ['Carpintería / Carpentry','Costura / Sewing','Cocina / Cooking','Mecánica / Mechanics','Electricidad / Electrical','Plomería / Plumbing','Agricultura / Agriculture','Computación / Computing','Contabilidad / Accounting','Enseñanza / Teaching','Ventas / Sales','Idiomas / Languages','Arte / Art','Música / Music','Construcción / Construction','Salud / Healthcare','Administración / Administration','Transporte / Transportation']

function Step5({ data, onChange }) {
  const f = (field, val) => onChange({ ...data, [field]: val })
  function toggleArray(field, val) {
    const arr = data[field] || []
    f(field, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }
  const [showResources, setShowResources] = useState(false);
  
  const [jobs, setJobs] = useState(data.jobs || [{ id: 1, title: '', company: '', years: '' }]);
  const [certs, setCerts] = useState(data.certs || [{ id: 1, name: '', year: '' }]);

  function updateJob(id, field, val) {
    const updated = jobs.map(j => j.id === id ? { ...j, [field]: val } : j);
    setJobs(updated); f('jobs', updated);
  }
  function addJob() {
    const newId = Math.max(...jobs.map(j => j.id), 0) + 1;
    const updated = [...jobs, { id: newId, title: '', company: '', years: '' }];
    setJobs(updated); f('jobs', updated);
  }
  function removeJob(id) {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated); f('jobs', updated);
  }

  function updateCert(id, field, val) {
    const updated = certs.map(c => c.id === id ? { ...c, [field]: val } : c);
    setCerts(updated); f('certs', updated);
  }
  function addCert() {
    const newId = Math.max(...certs.map(c => c.id), 0) + 1;
    const updated = [...certs, { id: newId, name: '', year: '' }];
    setCerts(updated); f('certs', updated);
  }
  function removeCert(id) {
    const updated = certs.filter(c => c.id !== id);
    setCerts(updated); f('certs', updated);
  }

  const FREE_RESOURCES = [
    { icon: '🧭', name: 'O*NET Interest Profiler', desc: 'Evaluación de talentos gratis del Gob. de USA (Inglés/Español)', url: 'https://www.mynextmove.org/explore/ip' },
    { icon: '🧠', name: '16Personalities', desc: 'Test de personalidad gratuito y fortalezas', url: 'https://www.16personalities.com/es' },
    { icon: '🎓', name: 'Capacítate para el empleo', desc: 'Cientos de cursos de oficios 100% gratuitos por Fundación Carlos Slim', url: 'https://capacitateparaelempleo.org/' },
    { icon: '💻', name: 'GCF Global', desc: 'Cursos gratis de tecnología, matemáticas e inglés básico', url: 'https://edu.gcfglobal.org/es/' },
    { icon: '📐', name: 'Khan Academy', desc: 'Aprendizaje mundial gratuito sin fines de lucro (matemáticas, ciencias)', url: 'https://es.khanacademy.org/' },
    { icon: '⌨️', name: 'FreeCodeCamp', desc: 'Certificaciones gratuitas en programación y tecnología', url: 'https://www.freecodecamp.org/espanol/' },
    { icon: '🗣️', name: 'English For Everyone', desc: 'Hojas de trabajo y ejercicios de inglés 100% gratuitos', url: 'https://englishforeveryone.org/' },
    { icon: '🦉', name: 'Duolingo', desc: 'Aprende idiomas gratis (versión básica con anuncios)', url: 'https://es.duolingo.com/' },
    { icon: '🏛️', name: 'MIT OpenCourseWare', desc: 'Cursos universitarios de MIT 100% gratuitos en línea', url: 'https://ocw.mit.edu/' },
    { icon: '⌨️', name: 'TypingClub', desc: 'Aprende mecanografía gratis (una habilidad muy empleable)', url: 'https://www.typingclub.com/sportal/' },
  ];

  return (
    <div>
      <p className="form-section-title">Habilidades y Talentos / Skills & Talents</p>
      
      <div className="info-box" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
          💛 <strong>¿No estás seguro de tus talentos? / Unsure about your talents?</strong><br/>
          Es normal sentirse inseguro o abrumado. A veces las cosas que haces naturalmente todos los días (como organizar, escuchar a otros, cuidar plantas o resolver problemas) ¡son habilidades valiosas! Selecciona las opciones abajo con las que te sientas un poco familiarizado, incluso si no eres un experto.<br/>
          <em style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>It's normal to feel unsure. Everyday things you do naturally (organizing, listening, problem solving) are valuable skills! Select the ones you are familiar with, even if you are not an expert.</em>
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem', background: '#fdfdfd', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <button 
          className="btn btn-ghost" 
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-bg)', border: 'none', borderBottom: showResources ? '1px solid var(--color-border)' : 'none', textAlign: 'left' }}
          onClick={() => setShowResources(!showResources)}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-darker)' }}>🎁 Ver 10 Recursos 100% Gratuitos / View 10 Free Resources</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)', fontWeight: 'normal' }}>Sin tarjetas, sin suscripciones, sin pruebas falsas. / No cards, no subscriptions, no fake trials.</div>
          </div>
          <span>{showResources ? '▲' : '▼'}</span>
        </button>
        
        {showResources && (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {FREE_RESOURCES.map((res, i) => (
              <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '1.2rem' }}>{res.icon}</span> 
                <div>
                  <strong>{res.name}</strong><br/>
                  <span style={{ color: 'var(--color-text-subdued)', fontSize: '0.75rem' }}>{res.desc}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {SKILL_OPTIONS.map(skill => (
          <div key={skill} className="checkbox-item">
            <input type="checkbox" id={`skill_${skill}`} checked={(data.skills || []).includes(skill)} onChange={() => toggleArray('skills', skill)} />
            <label htmlFor={`skill_${skill}`}>{skill}</label>
          </div>
        ))}
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label className="form-label">Otras habilidades / Other skills</label>
        <textarea className="form-textarea" value={data.otherSkills || ''} onChange={e => f('otherSkills', e.target.value)} placeholder="Describe otras habilidades o talentos / Describe other skills or talents" rows={2} />
      </div>
      <hr className="divider" />
      <p className="form-section-title">Experiencia Laboral / Work Experience</p>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Empleos Anteriores / Previous Jobs</label>
        {jobs.map((job, idx) => (
          <div key={job.id} style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Empleo / Job #{idx + 1}</span>
              {jobs.length > 1 && <button className="btn btn-sm" style={{ background: 'none', color: 'var(--color-error)', border: 'none', padding: 0 }} onClick={() => removeJob(job.id)}>✕</button>}
            </div>
            <div className="form-grid form-grid-2">
              <input type="text" className="form-input" placeholder="Cargo / Job Title" value={job.title} onChange={e => updateJob(job.id, 'title', e.target.value)} />
              <input type="text" className="form-input" placeholder="Empresa / Company" value={job.company} onChange={e => updateJob(job.id, 'company', e.target.value)} />
              <input type="number" className="form-input" placeholder="Años / Years" value={job.years} min={0} onChange={e => updateJob(job.id, 'years', e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addJob}>+ Añadir empleo / Add job</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Certificaciones / Certifications</label>
        {certs.map((cert, idx) => (
          <div key={cert.id} style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Certificado / Certificate #{idx + 1}</span>
              {certs.length > 1 && <button className="btn btn-sm" style={{ background: 'none', color: 'var(--color-error)', border: 'none', padding: 0 }} onClick={() => removeCert(cert.id)}>✕</button>}
            </div>
            <div className="form-grid form-grid-2">
              <input type="text" className="form-input" placeholder="Nombre de cert. / Certificate Name" value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} />
              <input type="text" className="form-input" placeholder="Año / Year" value={cert.year} onChange={e => updateCert(cert.id, 'year', e.target.value)} />
            </div>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addCert}>+ Añadir certificado / Add certificate</button>
      </div>

      <div className="form-group">
        <label className="form-label">Idiomas / Languages</label>
        <input className="form-input" value={data.languages || ''} onChange={e => f('languages', e.target.value)} placeholder="Ej: Español, Inglés / E.g.: Spanish, English" />
      </div>
      <hr className="divider" />
      <p className="form-section-title">Red de Apoyo / Support Network</p>
      
      <div className="info-box" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)', marginBottom: '1.25rem', padding: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-darker)' }}>
          🤝 Pedir ayuda es de valientes / Asking for help takes courage
        </p>
        <p style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>
          A veces nos bloqueamos al pensar en qué pedir. Haz clic en las sugerencias abajo si aplican a tu situación.<br />
          <em style={{ fontSize: '0.75rem', opacity: 0.8 }}>Sometimes we get blocked thinking about what to ask. Click the suggestions below if they apply to you.</em>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {[
            "Cuidar a los niños 2 horas a la semana para poder estudiar / Babysit 2 hours a week so I can study",
            "Ayuda temporal con despensa de comida / Temporary help with groceries",
            "Alojamiento temporal mientras estabilizo mis ingresos / Temporary housing while I stabilize my income",
            'Transporte o "jalón" al trabajo / Transportation to work',
            "Un préstamo familiar temporal sin intereses / A temporary interest-free family loan",
            "Consejo o mentoría en negocios / Advice or business mentoring"
          ].map((sug, i) => (
            <button 
              key={i} 
              className="suggestion-chip" 
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--color-white)', 
                color: 'var(--color-text)', 
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                lineHeight: 1.3
              }} 
              onClick={() => f('familySupport', (data.familySupport || '') + (data.familySupport ? '\n• ' : '• ') + sug)}
            >
              <div style={{ fontWeight: 500 }}>{sug.split(' / ')[0]}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{sug.split(' / ')[1]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Apoyo familiar / Family support</label>
        <textarea className="form-textarea" value={data.familySupport || ''} onChange={e => f('familySupport', e.target.value)} placeholder="¿Qué apoyo específico puedes pedir a familiares? / What specific support can you ask family for?" rows={3} />
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem' }}>Recursos comunitarios / Community resources</label>
        <div className="info-box" style={{ background: '#fdfdfd', border: '1px solid var(--color-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text)' }}>Existen organizaciones dedicadas a ayudarte. Escoge tu ubicación para ver opciones de apoyo (salud, comida, vivienda) y márcalas abajo.</p>
          
          <details style={{ marginTop: '0.5rem', background: '#f0f9ff', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
            <summary style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-darker)', cursor: 'pointer' }}>🇭🇳 Recursos en Honduras</summary>
            <ul style={{ fontSize: '0.8rem', paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--color-text)' }}>
              <li><strong>INFOP:</strong> Capacitación técnica y oficios gratis.</li>
              <li><strong>Ciudad Mujer:</strong> Atención integral (salud, legal, económica) para la mujer.</li>
              <li><strong>BANASUPRO:</strong> Compra de alimentos básicos subsidiados.</li>
              <li><strong>Red Solidaria:</strong> Asistencia gubernamental para familias vulnerables.</li>
              <li><strong>Cáritas:</strong> Asistencia social, alimentaria y psicológica.</li>
              <li><strong>BANHPROVI:</strong> Créditos de bajo interés para vivienda o Mipymes.</li>
              <li><strong>Cruz Roja Hondureña:</strong> Asistencia médica y emergencias.</li>
              <li><strong>Teletón:</strong> Rehabilitación física gratuita.</li>
              <li><strong>Aldeas Infantiles SOS:</strong> Protección y apoyo a la niñez.</li>
              <li><strong>Bancos de Alimentos Honduras:</strong> Apoyo nutricional comunitario.</li>
            </ul>
          </details>

          <details style={{ marginTop: '0.5rem', background: '#f0f9ff', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
            <summary style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-darker)', cursor: 'pointer' }}>🇺🇸 Recursos en USA</summary>
            <ul style={{ fontSize: '0.8rem', paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--color-text)' }}>
              <li><strong>211.org:</strong> Llama al 211 para asistencia esencial local (comida, facturas).</li>
              <li><strong>SNAP (Food Stamps):</strong> Asistencia federal para compra de alimentos.</li>
              <li><strong>WIC:</strong> Nutrición y salud para mujeres, infantes y niños.</li>
              <li><strong>Medicaid / CHIP:</strong> Seguro médico gubernamental gratis o de bajo costo.</li>
              <li><strong>HUD / Section 8:</strong> Asistencia para el pago de alquiler y vivienda.</li>
              <li><strong>LIHEAP:</strong> Ayuda para pagar facturas de calefacción/energía.</li>
              <li><strong>Feeding America:</strong> Red nacional de bancos de alimentos gratuitos.</li>
              <li><strong>Goodwill Industries:</strong> Entrenamiento laboral gratis y ropa asequible.</li>
              <li><strong>Job Corps:</strong> Entrenamiento vocacional y residencial gratis (16-24 años).</li>
              <li><strong>Community Action Agencies:</strong> Agencias locales que ayudan a salir de la pobreza.</li>
            </ul>
          </details>
        </div>
        <textarea className="form-textarea" style={{ marginTop: '0.5rem' }} value={data.communityResourcesText || ''} onChange={e => f('communityResourcesText', e.target.value)} placeholder="¿A cuáles de estos u otros recursos planeas acudir? / Which of these resources do you plan to use?" rows={3} />
      </div>

      <div className="form-group">
        <label className="form-label">Acceso a tecnología / Technology access</label>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>El acceso a internet es vital hoy en día para buscar empleo o estudiar. Marca los que tienes disponibles:</p>
        <div className="checkbox-group">
          {[['hasPhone','📱 Teléfono inteligente con datos / Smartphone with data'],['hasInternet','🌐 Internet residencial / Home internet'],['hasComputer','💻 Computadora propia / Own computer'],['hasPublicComputer','🏛️ Acceso a computadora pública (Biblioteca/Cíber) / Public computer access'],['hasBankAccount','🏦 Cuenta bancaria / Bank account']].map(([field, label]) => (
            <div key={field} className="checkbox-item">
              <input type="checkbox" id={field} checked={!!data[field]} onChange={e => f(field, e.target.checked)} />
              <label htmlFor={field}>{label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── STEP 6 ──────────────────────────────────────────────────────────────────
function Step6({ data, onChange }) {
  const f = (field, val) => onChange({ ...data, [field]: val })

  function makeGoalHandlers(field) {
    const goals = data[field] || [{ id: 1, goal: '', steps: '', deadline: '' }]
    return {
      goals,
      onUpdate: (id, key, val) => f(field, goals.map(g => g.id === id ? { ...g, [key]: val } : g)),
      onAdd: () => { 
        if (goals.length >= 2) return; // Limit to 2 goals
        const newId = Math.max(...goals.map(g => g.id), 0) + 1; 
        f(field, [...goals, { id: newId, goal: '', steps: '', deadline: '' }]) 
      },
      onRemove: (id) => { if (goals.length > 1) f(field, goals.filter(g => g.id !== id)) },
      onApplySuggestion: (sug) => {
        const emptyGoal = goals.find(g => !g.goal);
        if (emptyGoal) {
          f(field, goals.map(g => g.id === emptyGoal.id ? { ...g, goal: sug.title, steps: sug.steps } : g));
        } else if (goals.length < 2) {
          const newId = Math.max(...goals.map(g => g.id), 0) + 1;
          f(field, [...goals, { id: newId, goal: sug.title, steps: sug.steps, deadline: '' }]);
        } else {
          const targetId = goals[1].id;
          f(field, goals.map(g => g.id === targetId ? { ...g, goal: sug.title, steps: sug.steps } : g));
        }
      }
    }
  }

  const short = makeGoalHandlers('shortTermGoals')
  const medium = makeGoalHandlers('mediumTermGoals')
  const long = makeGoalHandlers('longTermGoals')

  const shortSuggestions = [
    { title: "Crear un fondo de emergencia de $100 / Create $100 emergency fund", steps: "1. Ahorrar $25 por semana.\n2. Guardar el dinero en una cuenta separada.\n3. Evitar gastos innecesarios (snacks, sodas, etc.)." },
    { title: "Crear o actualizar mi currículum / Create or update my resume", steps: "1. Buscar una plantilla gratuita en internet.\n2. Escribir mi experiencia y habilidades.\n3. Pedirle a un amigo o líder que lo revise." },
    { title: "Reducir gastos en alimentos este mes / Reduce food expenses this month", steps: "1. Planificar el menú de toda la semana.\n2. Comprar solo lo que está en la lista.\n3. Llevar almuerzo al trabajo en vez de comprar." },
    { title: "Registrar todos mis gastos diarios / Track all daily expenses", steps: "1. Conseguir una libreta pequeña o descargar una app.\n2. Anotar CADA compra, por más pequeña que sea.\n3. Revisar el total al final de la semana." },
    { title: "Buscar opciones de cursos gratuitos / Search for free courses", steps: "1. Decidir qué habilidad quiero aprender.\n2. Revisar los recursos gratuitos del Paso 5.\n3. Registrarme y guardar la página en favoritos." },
    { title: "Cancelar suscripciones innecesarias / Cancel unnecessary subscriptions", steps: "1. Revisar mi estado de cuenta bancario.\n2. Identificar pagos automáticos que no uso.\n3. Llamar o entrar a la app para cancelarlos hoy." },
    { title: "Vender artículos que ya no uso / Sell unused items", steps: "1. Limpiar el clóset y la casa.\n2. Tomar buenas fotos de ropa o electrónicos.\n3. Publicarlos en Marketplace o hacer una venta de garaje." },
    { title: "Aprender a usar una herramienta nueva / Learn a new tool", steps: "1. Elegir una herramienta (Excel, Canva, etc.).\n2. Buscar un tutorial de 30 minutos en YouTube.\n3. Practicar durante una hora." },
    { title: "Ahorrar el 10% de mis ingresos / Save 10% of my income", steps: "1. Calcular cuánto es el 10%.\n2. Separarlo inmediatamente al recibir el pago.\n3. Aprender a vivir con el 90% restante." },
    { title: "Hacer contacto con 3 posibles empleadores / Contact 3 potential employers", steps: "1. Identificar 3 empresas donde me gustaría trabajar.\n2. Encontrar el correo o teléfono de recursos humanos.\n3. Enviar mi currículum o llamar para presentarme." }
  ];
  
  const medSuggestions = [
    { title: "Pagar una tarjeta de crédito completa / Pay off one credit card", steps: "1. Dejar de usar la tarjeta inmediatamente.\n2. Pagar siempre más del pago mínimo.\n3. Destinar cualquier ingreso extra a esta deuda." },
    { title: "Terminar un curso o certificación / Finish a course or certification", steps: "1. Dedicar 3 horas fijas a la semana al estudio.\n2. Tomar notas y aplicar lo aprendido.\n3. Obtener el certificado y agregarlo al currículum." },
    { title: "Conseguir un empleo a tiempo parcial / Get a part-time job", steps: "1. Avisar a mi red de contactos que busco trabajo.\n2. Buscar empleos de fin de semana o tardes.\n3. Asistir a 3 entrevistas." },
    { title: "Ahorrar 1 mes de gastos fijos / Save 1 month of fixed expenses", steps: "1. Sumar mis gastos esenciales (Vivienda, Comida, Luz).\n2. Dividir ese total entre 6 meses.\n3. Ahorrar esa fracción cada mes sin falta." },
    { title: "Mejorar mi puntaje de crédito / Improve credit score", steps: "1. Obtener un reporte de crédito gratis.\n2. Pagar todas las facturas a tiempo este semestre.\n3. No abrir cuentas de crédito nuevas." },
    { title: "Iniciar un pequeño negocio en casa / Start a small home business", steps: "1. Identificar un producto que sé hacer (comida, manualidades).\n2. Hacer un presupuesto de materiales (menos de $50).\n3. Vender a 5 conocidos para probar la idea." },
    { title: "Aprender inglés básico / Learn basic English", steps: "1. Practicar 20 minutos diarios en Duolingo.\n2. Ver películas con subtítulos en inglés.\n3. Aprender 10 palabras nuevas relacionadas a mi trabajo cada semana." },
    { title: "Negociar mis deudas atrasadas / Negotiate overdue debts", steps: "1. Llamar al banco o prestamista.\n2. Explicar mi situación con honestidad.\n3. Pedir un plan de pago o reducción de intereses." },
    { title: "Conseguir un ascenso o aumento / Get a promotion or raise", steps: "1. Hablar con mi jefe sobre lo que necesito mejorar.\n2. Asumir responsabilidades extra en el trabajo.\n3. Documentar mis logros y pedir el aumento." },
    { title: "Mudarme a un alquiler más barato / Move to a cheaper rental", steps: "1. Investigar precios en otras zonas seguras.\n2. Calcular el costo de la mudanza vs. el ahorro anual.\n3. Dar aviso al arrendador actual y mudarme." }
  ];
  
  const longSuggestions = [
    { title: "Comprar casa propia / Buy a house", steps: "1. Ahorrar para la prima/enganche (10-20%).\n2. Mantener un buen récord crediticio por 2 años.\n3. Investigar préstamos subsidiados por el gobierno." },
    { title: "Tener 6 meses de gastos en ahorros / Have 6 months of expenses saved", steps: "1. Depositar automáticamente una parte del salario.\n2. No tocar este fondo por ningún motivo que no sea emergencia médica o desempleo.\n3. Celebrar cada mes acumulado." },
    { title: "Estar completamente libre de deudas / Become completely debt-free", steps: "1. Usar el método 'Bola de nieve' (pagar la menor primero).\n2. Cortar las tarjetas de crédito.\n3. Vivir estrictamente bajo el presupuesto mensual." },
    { title: "Establecer un negocio rentable / Establish a profitable business", steps: "1. Legalizar el negocio y llevar contabilidad estricta.\n2. Re-invertir las ganancias, no gastarlas.\n3. Contratar al primer empleado o asistente." },
    { title: "Terminar una carrera universitaria / Finish a university degree", steps: "1. Aprobar todas las clases cada semestre.\n2. Buscar becas o financiamiento estudiantil.\n3. Graduarme y actualizar mi perfil profesional." },
    { title: "Comprar un vehículo al contado / Buy a vehicle in cash", steps: "1. Ahorrar una cuota mensual como si pagara un préstamo.\n2. Buscar un carro usado en excelentes condiciones mecánicas.\n3. Comprarlo sin asumir nueva deuda." },
    { title: "Pagar la universidad de mis hijos / Pay for children's college", steps: "1. Abrir una cuenta de ahorro educativo.\n2. Aportar un porcentaje fijo mensual.\n3. Enseñarles a ellos a ahorrar también." },
    { title: "Lograr la independencia financiera / Achieve financial independence", steps: "1. Invertir excedentes en bienes raíces o fondos seguros.\n2. Generar al menos 3 fuentes de ingresos distintas.\n3. Que mis ingresos pasivos paguen mis gastos fijos." },
    { title: "Aprender un idioma a nivel avanzado / Learn a language fluently", steps: "1. Inscribirme en una academia formal.\n2. Practicar conversación 3 veces por semana.\n3. Tomar el examen de certificación TOEFL u otro." },
    { title: "Jubilación digna / Dignified retirement", steps: "1. Aportar al fondo de pensiones voluntario.\n2. Pagar la casa en su totalidad.\n3. No depender financieramente de mis hijos." }
  ];

  return (
    <div>
      <div className="info-box" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          🎯 <strong>Cómo crear metas (SMART) / How to create goals</strong><br/>
          Una buena meta es específica, medible y tiene fecha. Si no sabes qué escribir, haz clic en las sugerencias de abajo para usarlas de inspiración.<br />
          <em style={{ fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>A good goal is specific, measurable, and has a deadline. Click the suggestions below for inspiration.</em>
        </p>
      </div>
      <p className="form-section-title">Plan de Metas / Goals Plan</p>
      <GoalSection title="Metas a Corto Plazo" titleEn="Short-term Goals" timeframe="0–3 meses / months" placeholder="Ej: Crear un fondo de emergencia de L5,000" suggestions={shortSuggestions} {...short} />
      <GoalSection title="Metas a Mediano Plazo" titleEn="Medium-term Goals" timeframe="3–12 meses / months" placeholder="Ej: Pagar la deuda de tarjeta de crédito" suggestions={medSuggestions} {...medium} />
      <GoalSection title="Metas a Largo Plazo" titleEn="Long-term Goals" timeframe="1–5 años / years" placeholder="Ej: Comprar casa propia / E.g.: Buy own home" suggestions={longSuggestions} {...long} />
      <hr className="divider" />
      <p className="form-section-title">Recursos Necesarios / Needed Resources</p>
      
      <div className="info-box" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)', marginBottom: '1.25rem', padding: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-darker)' }}>
          💡 A veces no sabemos qué necesitamos / Sometimes we don't know what we need
        </p>
        <p style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>
          Haz clic en las sugerencias abajo para añadirlas si aplican a tu caso.<br />
          <em style={{ fontSize: '0.75rem', opacity: 0.8 }}>Click the suggestions below to add them if they apply to you.</em>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {[
            "Capital semilla (Ej: $500) para herramientas o materiales / Seed capital for tools or materials",
            "Capacitación específica en ventas o administración / Specific sales or management training",
            "Ropa profesional o formal para entrevistas de trabajo / Professional clothing for job interviews",
            "Obtener una licencia de conducir comercial o especial / Get a commercial or special driver's license",
            "Una computadora portátil básica para estudiar o trabajar / Basic laptop for studying or working",
            "Ayuda para armar un currículum profesional / Help putting together a professional resume"
          ].map((sug, i) => (
            <button 
              key={i} 
              className="suggestion-chip" 
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--color-white)', 
                color: 'var(--color-text)', 
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                lineHeight: 1.3
              }} 
              onClick={() => f('neededResources', (data.neededResources || '') + (data.neededResources ? '\n• ' : '• ') + sug)}
            >
              <div style={{ fontWeight: 500 }}>{sug.split(' / ')[0]}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{sug.split(' / ')[1]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">¿Qué recursos o habilidades necesitas desarrollar? / What resources or skills do you need to develop?</label>
        <textarea className="form-textarea" value={data.neededResources || ''} onChange={e => f('neededResources', e.target.value)} placeholder="Ej: Capacitación en computación, capital inicial para negocio..." rows={4} />
      </div>
      <div className="form-group">
        <label className="form-label">¿Participarías en un grupo de autosuficiencia? / Would you participate in a self-sufficiency group?</label>
        <div className="radio-group">
          {[['yes','Sí / Yes'],['maybe','Tal vez / Maybe'],['no','No']].map(([val, lbl]) => (
            <div key={val} className="radio-item">
              <input type="radio" id={`group_${val}`} name="groupParticipation" value={val} checked={data.groupParticipation === val} onChange={() => f('groupParticipation', val)} />
              <label htmlFor={`group_${val}`}>{lbl}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── STEP 7 ──────────────────────────────────────────────────────────────────
function Step7({ data, onChange }) {
  const f = (field, val) => onChange({ ...data, [field]: val })
  return (
    <div>
      <div className="info-box">
        <p>🤝 El trabajo y el servicio son parte fundamental del plan de autosuficiencia.<br /><em>Work and service are a fundamental part of the self-sufficiency plan.</em></p>
      </div>
      <p className="form-section-title">Trabajo y Servicio / Work & Service</p>

      <div className="info-box" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)', marginBottom: '1.25rem', padding: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-darker)' }}>
          💡 Todos tenemos algo que ofrecer / We all have something to offer
        </p>
        <p style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--color-text-subdued)' }}>
          A menudo subestimamos el valor de nuestro tiempo. Si recibes apoyo, considera ofrecer alguna de estas opciones a cambio.<br />
          <em style={{ fontSize: '0.75rem', opacity: 0.8 }}>We often underestimate our value. Consider offering one of these in exchange for support.</em>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {[
            "Limpieza profunda y mantenimiento / Deep cleaning and maintenance",
            "Cuidado de niños para otras madres que trabajan / Babysitting for other working mothers",
            "Reparaciones menores (plomería, pintura) / Minor repairs (plumbing, painting)",
            "Ayudar a cocinar en eventos comunitarios / Help cook at community events",
            "Enseñar a otros a usar computadoras o a leer / Teach others how to use computers or read",
            "Cuidado de ancianos o acompañamiento / Eldercare or companionship"
          ].map((sug, i) => (
            <button 
              key={i} 
              className="suggestion-chip" 
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--color-white)', 
                color: 'var(--color-text)', 
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                lineHeight: 1.3
              }} 
              onClick={() => f('serviceIdeas', (data.serviceIdeas || '') + (data.serviceIdeas ? '\n• ' : '• ') + sug)}
            >
              <div style={{ fontWeight: 500 }}>{sug.split(' / ')[0]}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{sug.split(' / ')[1]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Ideas de trabajo o servicio que puedes ofrecer / Work or service ideas you can offer</label>
        <textarea className="form-textarea" value={data.serviceIdeas || ''} onChange={e => f('serviceIdeas', e.target.value)} placeholder="Ej: Limpieza, jardinería, cuidado de niños, reparaciones, cocina..." rows={4} />
      </div>
      <div className="form-group">
        <label className="form-label">Horas disponibles por semana / Available hours per week</label>
        <input type="number" className="form-input" value={data.availableHours || ''} min={0} max={168} onChange={e => f('availableHours', e.target.value)} placeholder="0" />
      </div>
      <div className="form-group">
        <label className="form-label">Asignación de trabajo/servicio acordada / Agreed work/service assignment</label>
        <textarea className="form-textarea" value={data.serviceAssignment || ''} onChange={e => f('serviceAssignment', e.target.value)} placeholder="Describe la asignación específica acordada con el líder / Describe the specific assignment agreed with the leader" rows={3} />
      </div>
      <div className="form-group">
        <label className="form-label">Período de servicio / Service period</label>
        <div className="form-grid form-grid-2">
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Inicio / Start</label>
            <input type="date" className="form-input" value={data.serviceStart || ''} onChange={e => f('serviceStart', e.target.value)} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fin / End</label>
            <input type="date" className="form-input" value={data.serviceEnd || ''} onChange={e => f('serviceEnd', e.target.value)} />
          </div>
        </div>
      </div>
      <hr className="divider" />
      <div className="info-box" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)', marginBottom: '1.5rem', padding: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-primary-darker)', fontWeight: 600 }}>
          ✍️ El poder del compromiso / The power of commitment
        </p>
        <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.85rem', color: 'var(--color-text-subdued)', lineHeight: 1.5 }}>
          Escribir y firmar un compromiso aumenta psicológicamente tus probabilidades de éxito. Si no sabes qué escribir, haz clic en una de las plantillas abajo para empezar.<br />
          <em style={{ fontSize: '0.8rem', opacity: 0.8 }}>Writing and signing a commitment psychologically increases your chances of success. Click a template below to start.</em>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {[
            { es: "Me comprometo a seguir mi presupuesto mensual, evitar nuevas deudas y buscar oportunidades de educación para mejorar mis ingresos.", en: "I commit to following my monthly budget, avoiding new debt, and seeking education to improve my income." },
            { es: "Me comprometo a dedicar al menos 2 horas a la semana a estudiar una nueva habilidad y a reducir mis gastos innecesarios.", en: "I commit to dedicating at least 2 hours a week to studying a new skill and reducing unnecessary expenses." },
            { es: "Me comprometo a ser honesto/a sobre mi situación financiera y a trabajar junto a mi familia para alcanzar la autosuficiencia.", en: "I commit to being honest about my financial situation and working with my family to achieve self-sufficiency." }
          ].map((template, i) => (
            <button 
              key={i} 
              className="suggestion-card" 
              style={{ 
                textAlign: 'left', 
                padding: '1rem', 
                background: 'var(--color-white)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }} 
              onClick={() => f('commitmentStatement', `${template.es} / ${template.en}`)}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>{template.es}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{template.en}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Declaración de compromiso personal / Personal commitment statement</label>
        <textarea className="form-textarea" value={data.commitmentStatement || ''} onChange={e => f('commitmentStatement', e.target.value)} placeholder="Escribe tu compromiso personal con este plan / Write your personal commitment to this plan" rows={4} />
      </div>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Firma del miembro / Member signature</label>
          <input className="form-input" value={data.memberSignature || ''} onChange={e => f('memberSignature', e.target.value)} placeholder="Nombre completo / Full name" />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha / Date</label>
          <input type="date" className="form-input" value={data.signatureDate || ''} onChange={e => f('signatureDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Firma del cónyuge / Spouse signature</label>
          <input className="form-input" value={data.spouseSignature || ''} onChange={e => f('spouseSignature', e.target.value)} placeholder="Nombre completo / Full name (si aplica / if applicable)" />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha / Date</label>
          <input type="date" className="form-input" value={data.spouseSignatureDate || ''} onChange={e => f('spouseSignatureDate', e.target.value)} />
        </div>
      </div>
      <div style={{ background: '#eaf8ee', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.25rem' }}>✅ ¡Casi listo! / Almost done!</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subdued)' }}>Al hacer clic en "Generar Plan", crearemos tu plan personalizado de autosuficiencia.<br /><em>By clicking "Generate Plan", we will create your personalized self-sufficiency plan.</em></p>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SelfSufficiencyForm({ formData, setFormData, onComplete, budgetData, incomeSources }) {
  const [step, setStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem('evaluationStep')
      if (savedStep) return parseInt(savedStep, 10)
    } catch {}
    return 1
  })

  useEffect(() => {
    localStorage.setItem('evaluationStep', step)
  }, [step])

  function updateStep(stepData) {
    setFormData(stepData)
  }

  const stepComponents = {
    1: <Step1 data={formData} onChange={updateStep} />,
    2: <Step2 data={formData} onChange={updateStep} />,
    3: <Step3 data={formData} onChange={updateStep} incomeSources={incomeSources} />,
    4: <Step4 data={formData} onChange={updateStep} budgetData={budgetData} />,
    5: <Step5 data={formData} onChange={updateStep} />,
    6: <Step6 data={formData} onChange={updateStep} />,
    7: <Step7 data={formData} onChange={updateStep} />,
  }

  return (
    <div>
      <div className="section-hero">
        <h1>Evaluación de <span className="hero-accent">Autosuficiencia</span></h1>
        <p>Self-Sufficiency Assessment — Completa los 7 pasos para generar tu plan personalizado / Complete 7 steps to generate your personalized plan</p>
      </div>
      <div className="ss-layout">
        <StepProgress current={step} />
        <div className="ss-form-card">
          <div className="ss-form-header">
            <h2>Paso {step} / Step {step}: {STEP_TITLES[step].es}</h2>
            <p>{STEP_TITLES[step].en}</p>
          </div>
          <div className="ss-form-body">{stepComponents[step]}</div>
          <div className="ss-form-footer">
            <div>
              {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Anterior / Previous</button>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Paso {step} de {STEPS.length} / Step {step} of {STEPS.length}</span>
              {step < STEPS.length
                ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Siguiente / Next →</button>
                : <button className="btn btn-accent btn-lg" onClick={onComplete}>🎯 Generar Plan / Generate Plan</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
