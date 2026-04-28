import { useState } from 'react'
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

function GoalSection({ title, titleEn, timeframe, goals, onUpdate, onAdd, onRemove, placeholder }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ background: 'var(--color-accent)', color: 'var(--color-primary-darker)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{timeframe}</span>
        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{title} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.85em' }}>/ {titleEn}</span></span>
      </div>
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
      <div className="info-box">
        <p>📋 Esta información nos ayudará a crear un plan personalizado para ti y tu familia.<br />
          <em>This information will help us create a personalized plan for you and your family.</em></p>
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
      <div className="info-box">
        <p>🔍 Evalúa tus necesidades actuales en una escala del 1 al 5.<br />
          <em>Assess your current needs on a scale of 1 to 5.</em></p>
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
function Step3({ data, onChange }) {
  const { symbol } = useCurrency()
  const f = (field, val) => onChange({ ...data, [field]: val })
  const [debts, setDebts] = useState(data.debts || [{ id: 1, type: '', creditor: '', balance: '', payment: '', rate: '' }])

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
      <div className="info-box">
        <p>💳 Lista todas tus deudas actuales para crear un plan de eliminación de deudas.<br /><em>List all your current debts to create a debt elimination plan.</em></p>
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

  return (
    <div>
      <div className="info-box">
        <p>📊 Si ya completaste la calculadora de presupuesto, tus gastos se muestran abajo.<br /><em>If you already completed the budget calculator, your expenses are shown below.</em></p>
      </div>
      {totalFromBudget > 0 && (
        <div style={{ background: '#eaf8ee', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>✅ Gastos del presupuesto / Budget expenses: {fmt(totalFromBudget)}</p>
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
      <div className="form-group">
        <label className="form-label">¿Qué gastos podrías reducir o eliminar? / What expenses could you reduce or eliminate?</label>
        <textarea className="form-textarea" value={data.reducibleExpenses || ''} onChange={e => f('reducibleExpenses', e.target.value)} placeholder="Ej: Suscripciones de streaming, comer fuera..." rows={4} />
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
const COMMUNITY_RESOURCES = ['Iglesia / Church','Municipalidad / Municipality','ONG / NGO','Banco / Bank','Cooperativa / Cooperative','Centro de salud / Health center','Escuela / School','Mercado / Market','Programa gubernamental / Government program','Red de vecinos / Neighbor network']

function Step5({ data, onChange }) {
  const f = (field, val) => onChange({ ...data, [field]: val })
  function toggleArray(field, val) {
    const arr = data[field] || []
    f(field, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }
  return (
    <div>
      <p className="form-section-title">Habilidades Personales / Personal Skills</p>
      <div className="info-box">
        <p>💪 Identifica tus habilidades y talentos. ¡Estos son activos valiosos para tu plan!<br /><em>Identify your skills and talents. These are valuable assets for your plan!</em></p>
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
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Empleos anteriores / Previous jobs</label>
          <textarea className="form-textarea" value={data.previousJobs || ''} onChange={e => f('previousJobs', e.target.value)} placeholder="Lista tus empleos anteriores / List your previous jobs" rows={3} />
        </div>
        <div className="form-group">
          <label className="form-label">Años de experiencia / Years of experience</label>
          <input type="number" className="form-input" value={data.yearsExperience || ''} min={0} onChange={e => f('yearsExperience', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Certificaciones / Certifications</label>
          <textarea className="form-textarea" value={data.certifications || ''} onChange={e => f('certifications', e.target.value)} placeholder="Diplomas, certificados, licencias / Diplomas, certificates, licenses" rows={2} />
        </div>
        <div className="form-group">
          <label className="form-label">Idiomas / Languages</label>
          <input className="form-input" value={data.languages || ''} onChange={e => f('languages', e.target.value)} placeholder="Ej: Español, Inglés / E.g.: Spanish, English" />
        </div>
      </div>
      <hr className="divider" />
      <p className="form-section-title">Red de Apoyo / Support Network</p>
      <div className="form-group">
        <label className="form-label">Apoyo familiar / Family support</label>
        <textarea className="form-textarea" value={data.familySupport || ''} onChange={e => f('familySupport', e.target.value)} placeholder="¿Qué apoyo puedes recibir de familiares? / What support can you receive from family?" rows={3} />
      </div>
      <div className="form-group">
        <label className="form-label">Recursos comunitarios disponibles / Available community resources</label>
        <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {COMMUNITY_RESOURCES.map(res => (
            <div key={res} className="checkbox-item">
              <input type="checkbox" id={`res_${res}`} checked={(data.communityResources || []).includes(res)} onChange={() => toggleArray('communityResources', res)} />
              <label htmlFor={`res_${res}`}>{res}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Acceso a tecnología / Technology access</label>
        <div className="checkbox-group">
          {[['hasPhone','📱 Teléfono celular / Cell phone'],['hasInternet','🌐 Internet en casa / Home internet'],['hasComputer','💻 Computadora / Computer'],['hasBankAccount','🏦 Cuenta bancaria / Bank account']].map(([field, label]) => (
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
      onAdd: () => { const newId = Math.max(...goals.map(g => g.id), 0) + 1; f(field, [...goals, { id: newId, goal: '', steps: '', deadline: '' }]) },
      onRemove: (id) => { if (goals.length > 1) f(field, goals.filter(g => g.id !== id)) },
    }
  }

  const short = makeGoalHandlers('shortTermGoals')
  const medium = makeGoalHandlers('mediumTermGoals')
  const long = makeGoalHandlers('longTermGoals')

  return (
    <div>
      <div className="info-box">
        <p>🎯 Define metas claras y alcanzables para cada período de tiempo. Sé específico/a.<br /><em>Define clear, achievable goals for each time period. Be specific.</em></p>
      </div>
      <p className="form-section-title">Plan de Metas / Goals Plan</p>
      <GoalSection title="Metas a Corto Plazo" titleEn="Short-term Goals" timeframe="0–3 meses / months" placeholder="Ej: Crear un fondo de emergencia de L5,000" {...short} />
      <GoalSection title="Metas a Mediano Plazo" titleEn="Medium-term Goals" timeframe="3–12 meses / months" placeholder="Ej: Pagar la deuda de tarjeta de crédito" {...medium} />
      <GoalSection title="Metas a Largo Plazo" titleEn="Long-term Goals" timeframe="1–5 años / years" placeholder="Ej: Comprar casa propia / E.g.: Buy own home" {...long} />
      <hr className="divider" />
      <p className="form-section-title">Recursos Necesarios / Needed Resources</p>
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
      <p className="form-section-title">Compromiso / Commitment</p>
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
export default function SelfSufficiencyForm({ formData, setFormData, onComplete, budgetData }) {
  const [step, setStep] = useState(1)

  function updateStep(stepData) {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  const stepComponents = {
    1: <Step1 data={formData} onChange={updateStep} />,
    2: <Step2 data={formData} onChange={updateStep} />,
    3: <Step3 data={formData} onChange={updateStep} />,
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
