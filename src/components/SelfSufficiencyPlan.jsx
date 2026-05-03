import { useCurrency } from './CurrencyContext'

function PlanSectionTitle({ num, children }) {
  return (
    <div className="plan-section-title">
      <span className="step-num">{num}</span>
      {children}
    </div>
  )
}

function InfoItem({ label, value }) {
  if (!value) return null
  return (
    <div className="plan-info-item">
      <div className="plan-info-item-label">{label}</div>
      <div className="plan-info-item-value">{value || '—'}</div>
    </div>
  )
}

const NEED_LABELS = {
  foodSecurity: '🍽️ Alimentación / Food',
  housingSecurity: '🏠 Vivienda / Housing',
  healthStatus: '🏥 Salud física / Physical health',
  mentalHealth: '🧠 Salud mental / Mental health',
  safetyLevel: '🛡️ Seguridad / Safety',
  clothingNeeds: '👗 Ropa / Clothing',
  transportAccess: '🚗 Transporte / Transport',
}

const NEED_SCALE = { 1: 'Crítico / Critical', 2: 'Bajo / Low', 3: 'Regular / Fair', 4: 'Bueno / Good', 5: 'Excelente / Excellent' }

const EMP_LABELS = {
  employed_full: 'Empleado tiempo completo / Full-time',
  employed_part: 'Empleado tiempo parcial / Part-time',
  self_employed: 'Independiente / Self-employed',
  unemployed: 'Desempleado / Unemployed',
  looking: 'Buscando empleo / Job seeking',
  retired: 'Jubilado / Retired',
  student: 'Estudiante / Student',
  homemaker: 'Ama de casa / Homemaker',
}

const EDU_LABELS = {
  none: 'Sin estudios / None', primary: 'Primaria / Primary', secondary: 'Secundaria / Secondary',
  high_school: 'Bachillerato / High school', technical: 'Técnico / Technical',
  university: 'Universidad / University', postgrad: 'Posgrado / Postgraduate',
}

const HOUSING_LABELS = {
  own: 'Casa propia / Own home', rent: 'Alquiler / Renting', family: 'Casa familiar / Family home',
  unstable: 'Situación inestable / Unstable', homeless: 'Sin vivienda / Homeless',
}

const DEBT_TYPE_LABELS = {
  credit_card: 'Tarjeta de crédito', personal_loan: 'Préstamo personal', mortgage: 'Hipoteca',
  car_loan: 'Préstamo de auto', student_loan: 'Préstamo estudiantil', medical: 'Deuda médica',
  family: 'Deuda familiar', other: 'Otro',
}

export default function SelfSufficiencyPlan({ formData, onEdit }) {
  const { fmt, fmtBoth } = useCurrency()

  const d = formData

  // Compute totals
  const incomeFields = ['incSalary','incSpouse','incBusiness','incRent','incRemittance','incGovAid','incFamily','incOther']
  const expenseFields = ['expHousing','expFood','expTransport','expUtilities','expHealth','expClothing','expEducation','expDebt','expSavings','expTithes','expPersonal','expOther']
  const totalIncome = incomeFields.reduce((s, f) => s + (parseFloat(d[f]) || 0), 0)
  const totalExpenses = expenseFields.reduce((s, f) => s + (parseFloat(d[f]) || 0), 0)
  const balance = totalIncome - totalExpenses
  const totalDebt = (d.debts || []).reduce((s, debt) => s + (parseFloat(debt.balance) || 0), 0)

  const { primary: balPrimary } = fmtBoth(Math.abs(balance))

  // Generate immediate action items based on needs scores
  function getImmediateActions() {
    const actions = []
    if ((d.foodSecurity || 5) <= 2) actions.push('Buscar apoyo alimentario inmediato (banco de alimentos, iglesia, municipalidad) / Seek immediate food assistance (food bank, church, municipality)')
    if ((d.housingSecurity || 5) <= 2) actions.push('Contactar recursos de vivienda de emergencia / Contact emergency housing resources')
    if ((d.healthStatus || 5) <= 2) actions.push('Buscar atención médica en centro de salud más cercano / Seek medical care at nearest health center')
    if ((d.mentalHealth || 5) <= 2) actions.push('Buscar apoyo emocional o consejería / Seek emotional support or counseling')
    if (balance < 0) actions.push('Revisar y reducir gastos inmediatamente — hay un déficit mensual / Review and reduce expenses immediately — there is a monthly deficit')
    if (totalDebt > 0) actions.push('Listar todas las deudas y priorizar pagos / List all debts and prioritize payments')
    if (!(d.emergencyFund) || parseFloat(d.emergencyFund) === 0) actions.push('Comenzar a construir un fondo de emergencia, aunque sea pequeño / Start building an emergency fund, even if small')
    if (!d.hasBankAccount) actions.push('Abrir una cuenta bancaria o de ahorro / Open a bank or savings account')
    if (actions.length === 0) actions.push('Mantener el presupuesto mensual actualizado / Keep the monthly budget updated')
    actions.push('Completar este plan con tu líder o consejero / Complete this plan with your leader or counselor')
    actions.push('Programar revisión del plan en 30 días / Schedule plan review in 30 days')
    return actions
  }

  function getDebtStrategy() {
    const debts = (d.debts || []).filter(debt => parseFloat(debt.balance) > 0)
    if (debts.length === 0) return null
    // Sort by balance (snowball method)
    return [...debts].sort((a, b) => (parseFloat(a.balance) || 0) - (parseFloat(b.balance) || 0))
  }

  const debtStrategy = getDebtStrategy()
  const immediateActions = getImmediateActions()

  return (
    <div>
      <div className="section-hero no-print">
        <h1>Tu <span className="hero-accent">Plan de Autosuficiencia</span></h1>
        <p>Your Self-Sufficiency Plan — Generado el {new Date().toLocaleDateString('es-HN')} / Generated on {new Date().toLocaleDateString('en-US')}</p>
      </div>

      <div className="plan-layout">
        {/* Action buttons */}
        <div className="plan-actions no-print">
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Imprimir / Print</button>
          <button className="btn btn-ghost" onClick={onEdit}>✏️ Editar / Edit</button>
        </div>

        <div className="plan-document" style={{ '@media print': { pageBreakAfter: 'always' } }}>
          {/* Document Header */}
          <div className="plan-print-header">
            <h1>Plan de Autosuficiencia / Self-Sufficiency Plan</h1>
            <p>© {new Date().getFullYear()} — Generado el / Generated on: {new Date().toLocaleDateString('es-HN')}</p>
          </div>

          {/* SECTION: Member Info */}
          <div className="plan-section">
            <PlanSectionTitle num="👤">Información del Miembro / Member Information</PlanSectionTitle>
            <div className="plan-info-grid">
              <InfoItem label="Nombre / Name" value={d.name} />
              <InfoItem label="Fecha / Date" value={d.date} />
              <InfoItem label="Edad / Age" value={d.age ? `${d.age} años/years` : null} />
              <InfoItem label="Estado civil / Marital status" value={d.maritalStatus} />
              <InfoItem label="Cónyuge / Spouse" value={d.spouseName} />
              <InfoItem label="Dependientes / Dependents" value={d.dependents ? `${d.dependents} (${d.dependentAges || ''})` : null} />
              <InfoItem label="Ubicación / Location" value={d.location} />
              <InfoItem label="Empleo / Employment" value={EMP_LABELS[d.employmentStatus]} />
              <InfoItem label="Ocupación / Occupation" value={d.occupation} />
              <InfoItem label="Educación / Education" value={EDU_LABELS[d.education]} />
            </div>
          </div>

          {/* SECTION 1: Needs */}
          <div className="plan-section">
            <PlanSectionTitle num="1">¿Qué necesidades tengo? / What are my needs?</PlanSectionTitle>
            <table className="plan-table">
              <thead>
                <tr>
                  <th>Área / Area</th>
                  <th>Nivel / Level</th>
                  <th>Estado / Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(NEED_LABELS).map(([key, label]) => {
                  const val = d[key]
                  if (!val) return null
                  return (
                    <tr key={key}>
                      <td>{label}</td>
                      <td style={{ fontWeight: 700, color: val <= 2 ? 'var(--color-error)' : val >= 4 ? 'var(--color-success)' : 'var(--color-warning)' }}>{val}/5</td>
                      <td>{NEED_SCALE[val]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {d.housingSituation && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-subdued)' }}>
                <strong>Vivienda / Housing:</strong> {HOUSING_LABELS[d.housingSituation]}
              </p>
            )}
            {d.medicalNeeds && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-subdued)' }}><strong>Necesidades médicas / Medical needs:</strong> {d.medicalNeeds}</p>}
            {d.emotionalNeeds && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-subdued)' }}><strong>Necesidades emocionales / Emotional needs:</strong> {d.emotionalNeeds}</p>}
            {d.otherNeeds && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-subdued)' }}><strong>Otras necesidades / Other needs:</strong> {d.otherNeeds}</p>}
          </div>

          {/* SECTION 2: Income & Expenses */}
          <div className="plan-section" style={{ pageBreakBefore: 'avoid' }}>
            <PlanSectionTitle num="2">¿Qué ingresos y gastos tengo? / What are my income and expenses?</PlanSectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Income */}
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresos / Income</p>
                <table className="plan-table">
                  <tbody>
                    {[['incSalary','Salario / Salary'],['incSpouse','Cónyuge / Spouse'],['incBusiness','Negocio / Business'],['incRent','Alquiler / Rental'],['incRemittance','Remesas / Remittances'],['incGovAid','Gobierno / Gov. aid'],['incFamily','Familia / Family'],['incOther','Otros / Other']].map(([field, label]) => {
                      const val = parseFloat(d[field]) || 0
                      if (!val) return null
                      const { primary, secondary } = fmtBoth(val)
                      return (
                        <tr key={field}>
                          <td>{label}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{primary}<br /><span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{secondary}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <strong>{fmtBoth(totalIncome).primary}</strong><br />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{fmtBoth(totalIncome).secondary}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {/* Expenses */}
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-error)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gastos / Expenses</p>
                <table className="plan-table">
                  <tbody>
                    {[['expHousing','🏠 Vivienda'],['expFood','🍽️ Alimentación'],['expTransport','🚗 Transporte'],['expUtilities','💡 Servicios'],['expHealth','🏥 Salud'],['expClothing','👗 Ropa'],['expEducation','📚 Educación'],['expDebt','💳 Deudas'],['expSavings','💰 Ahorro'],['expTithes','🙏 Diezmos'],['expPersonal','🎉 Personal'],['expOther','➕ Otros']].map(([field, label]) => {
                      const val = parseFloat(d[field]) || 0
                      if (!val) return null
                      const { primary, secondary } = fmtBoth(val)
                      return (
                        <tr key={field}>
                          <td>{label}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{primary}<br /><span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{secondary}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <strong>{fmtBoth(totalExpenses).primary}</strong><br />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{fmtBoth(totalExpenses).secondary}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Balance */}
            <div className={`summary-balance ${balance >= 0 ? 'positive' : 'negative'}`} style={{ marginTop: '1rem' }}>
              <div className="summary-balance-label">{balance >= 0 ? '✅ Sobrante / Surplus' : '⚠️ Déficit / Deficit'}</div>
              <div className="summary-balance-amount">{balance >= 0 ? '' : '-'}{balPrimary}</div>
            </div>

            {d.reducibleExpenses && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-subdued)', marginBottom: '0.375rem' }}>Gastos a reducir / Expenses to reduce:</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subdued)', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>{d.reducibleExpenses}</p>
              </div>
            )}
          </div>

          {/* SECTION 3: Resources */}
          <div className="plan-section">
            <PlanSectionTitle num="3">¿Con qué otros recursos cuento? / What other resources do I have?</PlanSectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Habilidades / Skills</p>
                {(d.skills || []).length > 0 ? (
                  <ul className="action-list">
                    {(d.skills || []).map(s => <li key={s}>{s}</li>)}
                  </ul>
                ) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No especificado / Not specified</p>}
                {d.otherSkills && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subdued)', marginTop: '0.5rem' }}>{d.otherSkills}</p>}
                
                {d.languages && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Idiomas/Languages:</span> <span style={{ fontSize: '0.8rem' }}>{d.languages}</span>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Experiencia y Certificaciones</p>
                {d.jobs && d.jobs.filter(j => j.title).length > 0 ? (
                  <ul className="action-list" style={{ marginBottom: '0.5rem' }}>
                    {d.jobs.filter(j => j.title).map(j => (
                      <li key={j.id} style={{ fontSize: '0.8rem' }}>
                        <strong>{j.title}</strong> en {j.company} <em>({j.years} años)</em>
                      </li>
                    ))}
                  </ul>
                ) : null}
                
                {d.certs && d.certs.filter(c => c.name).length > 0 ? (
                  <ul className="action-list">
                    {d.certs.filter(c => c.name).map(c => (
                      <li key={c.id} style={{ fontSize: '0.8rem' }}>
                        🎓 {c.name} <em>({c.year})</em>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Recursos comunitarios / Community resources</p>
                {(d.communityResources || []).length > 0 ? (
                  <ul className="action-list">
                    {(d.communityResources || []).map(r => <li key={r}>{r}</li>)}
                  </ul>
                ) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No especificado / Not specified</p>}
              </div>
            </div>
            {d.familySupport && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-subdued)', marginBottom: '0.375rem' }}>Apoyo familiar / Family support:</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subdued)', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>{d.familySupport}</p>
              </div>
            )}
            {/* Savings & Assets */}
            {(parseFloat(d.emergencyFund) > 0 || parseFloat(d.totalSavings) > 0) && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-subdued)', marginBottom: '0.5rem' }}>Ahorros y activos / Savings & assets:</p>
                <div className="plan-info-grid">
                  {parseFloat(d.emergencyFund) > 0 && <InfoItem label="Fondo emergencia / Emergency fund" value={fmt(d.emergencyFund)} />}
                  {parseFloat(d.totalSavings) > 0 && <InfoItem label="Ahorros totales / Total savings" value={fmt(d.totalSavings)} />}
                  {d.properties && <InfoItem label="Propiedades / Properties" value={d.properties} />}
                  {d.otherAssets && <InfoItem label="Otros activos / Other assets" value={d.otherAssets} />}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Personal Plan */}
          <div className="plan-section" style={{ pageBreakBefore: 'auto' }}>
            <PlanSectionTitle num="4">¿Cuál es mi plan personal para ser más autosuficiente? / What is my personal plan to become more self-sufficient?</PlanSectionTitle>

            {/* Immediate Actions */}
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary-darker)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ Acciones Inmediatas (30 días) / Immediate Actions (30 days)
            </p>
            <ul className="action-list" style={{ marginBottom: '1.25rem' }}>
              {immediateActions.map((action, i) => <li key={i}>{action}</li>)}
            </ul>

            {/* Goals Table */}
            {['shortTermGoals','mediumTermGoals','longTermGoals'].map((field, idx) => {
              const goals = (d[field] || []).filter(g => g.goal)
              if (goals.length === 0) return null
              const labels = [
                { es: 'Metas a Corto Plazo (0–3 meses)', en: 'Short-term Goals (0–3 months)' },
                { es: 'Metas a Mediano Plazo (3–12 meses)', en: 'Medium-term Goals (3–12 months)' },
                { es: 'Metas a Largo Plazo (1–5 años)', en: 'Long-term Goals (1–5 years)' },
              ]
              return (
                <div key={field} style={{ marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary-darker)', marginBottom: '0.5rem' }}>
                    {labels[idx].es} / {labels[idx].en}
                  </p>
                  <table className="plan-table">
                    <thead>
                      <tr>
                        <th>Recursos/Habilidades necesarios / Needed resources/skills</th>
                        <th>Pasos a seguir / Steps to take</th>
                        <th>Para cuándo / By when</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.map((goal, i) => (
                        <tr key={i}>
                          <td>{goal.goal}</td>
                          <td>{goal.steps || '—'}</td>
                          <td>{goal.deadline || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}

            {d.neededResources && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-subdued)', marginBottom: '0.375rem' }}>Recursos necesarios / Needed resources:</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subdued)', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>{d.neededResources}</p>
              </div>
            )}

            {/* Debt Strategy */}
            {debtStrategy && debtStrategy.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-error)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💳 Estrategia de Eliminación de Deudas (Método Bola de Nieve) / Debt Elimination Strategy (Snowball Method)
                </p>
                <table className="plan-table">
                  <thead>
                    <tr>
                      <th>Prioridad / Priority</th>
                      <th>Tipo / Type</th>
                      <th>Acreedor / Creditor</th>
                      <th>Saldo / Balance</th>
                      <th>Pago mensual / Monthly payment</th>
                      <th>Tasa / Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debtStrategy.map((debt, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>#{i + 1}</td>
                        <td>{DEBT_TYPE_LABELS[debt.type] || debt.type}</td>
                        <td>{debt.creditor || '—'}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(debt.balance)}</td>
                        <td>{fmt(debt.payment)}</td>
                        <td>{debt.rate ? `${debt.rate}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><strong>Total deuda / Total debt</strong></td>
                      <td colSpan={3}><strong>{fmt(totalDebt)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  * Paga primero la deuda más pequeña para ganar impulso / Pay the smallest debt first to gain momentum
                </p>
              </div>
            )}
          </div>

          {/* SECTION 5: Work & Service */}
          <div className="plan-section">
            <PlanSectionTitle num="5">¿Qué trabajo o servicio realizaré? / What work or service will I perform?</PlanSectionTitle>
            {d.serviceIdeas && (
              <div className="form-group">
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-subdued)', marginBottom: '0.375rem' }}>Ideas de servicio / Service ideas:</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subdued)', background: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>{d.serviceIdeas}</p>
              </div>
            )}
            {d.serviceAssignment && (
              <div className="form-group">
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-subdued)', marginBottom: '0.375rem' }}>Asignación acordada / Agreed assignment:</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subdued)', background: '#ebf4fa', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary)' }}>{d.serviceAssignment}</p>
              </div>
            )}
            <div className="plan-info-grid" style={{ marginTop: '0.75rem' }}>
              {d.availableHours && <InfoItem label="Horas/semana / Hours/week" value={`${d.availableHours} hrs`} />}
              {d.serviceStart && <InfoItem label="Inicio / Start" value={d.serviceStart} />}
              {d.serviceEnd && <InfoItem label="Fin / End" value={d.serviceEnd} />}
            </div>
          </div>

          {/* SECTION 6: Commitment & Signatures */}
          <div className="plan-section">
            <PlanSectionTitle num="6">Compromiso / Commitment</PlanSectionTitle>
            {d.commitmentStatement && (
              <div style={{ background: '#ebf4fa', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-primary-darker)', fontStyle: 'italic', lineHeight: 1.6 }}>"{d.commitmentStatement}"</p>
              </div>
            )}

            <div className="signature-area">
              <div>
                <div style={{ minHeight: '40px', borderBottom: '1px solid var(--color-text)', marginBottom: '0.375rem' }}>
                  {d.memberSignature && <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{d.memberSignature}</span>}
                </div>
                <div className="signature-line">Firma del miembro / Member signature — {d.signatureDate || '___________'}</div>
              </div>
              <div>
                <div style={{ minHeight: '40px', borderBottom: '1px solid var(--color-text)', marginBottom: '0.375rem' }}>
                  {d.spouseSignature && <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{d.spouseSignature}</span>}
                </div>
                <div className="signature-line">Firma del cónyuge / Spouse signature — {d.spouseSignatureDate || '___________'}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div className="signature-area">
                <div>
                  <div style={{ minHeight: '40px', borderBottom: '1px solid var(--color-text)', marginBottom: '0.375rem' }}></div>
                  <div className="signature-line">Firma del líder / Leader signature — ___________</div>
                </div>
                <div>
                  <div style={{ minHeight: '40px', borderBottom: '1px solid var(--color-text)', marginBottom: '0.375rem' }}></div>
                  <div className="signature-line">Cargo / Title — ___________</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="plan-section" style={{ background: 'var(--color-bg)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              La recolección de datos y el compartirlos está sujeto a la norma de privacidad.<br />
              <em>Data collection and sharing is subject to the privacy policy.</em><br />
              Plan de Autosuficiencia / Self-Reliance Plan — {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
