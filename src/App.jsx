import { useState } from 'react'
import { CurrencyProvider } from './components/CurrencyContext'
import Header from './components/Header'
import BudgetCalculator, { CATEGORIES } from './components/BudgetCalculator'
import SelfSufficiencyForm from './components/SelfSufficiencyForm'
import SelfSufficiencyPlan from './components/SelfSufficiencyPlan'
import AIAssistant from './components/AIAssistant'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('budget')
  const [budgetData, setBudgetData] = useState(CATEGORIES)
  const [formData, setFormData] = useState({})
  const [planGenerated, setPlanGenerated] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  function handleGeneratePlan() {
    setPlanGenerated(true)
    setActiveTab('plan')
  }

  function handleEditPlan() {
    setPlanGenerated(false)
    setActiveTab('survey')
  }

  return (
    <CurrencyProvider>
      <div className="app-container">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'budget' && (
          <BudgetCalculator budgetData={budgetData} setBudgetData={setBudgetData} />
        )}

        {activeTab === 'survey' && !planGenerated && (
          <SelfSufficiencyForm
            formData={formData}
            setFormData={setFormData}
            onComplete={handleGeneratePlan}
            budgetData={budgetData}
          />
        )}

        {activeTab === 'survey' && planGenerated && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ marginBottom: '0.5rem' }}>¡Plan generado! / Plan generated!</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Tu plan de autosuficiencia ha sido creado.<br />
                <em>Your self-sufficiency plan has been created.</em>
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setActiveTab('plan')}>
                  📄 Ver Plan / View Plan
                </button>
                <button className="btn btn-ghost" onClick={() => { setPlanGenerated(false) }}>
                  ✏️ Editar / Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && !planGenerated && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Aún no hay plan / No plan yet</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Completa la evaluación de autosuficiencia para generar tu plan personalizado.<br />
                <em>Complete the self-sufficiency assessment to generate your personalized plan.</em>
              </p>
              <button className="btn btn-accent btn-lg" onClick={() => setActiveTab('survey')}>
                🎯 Comenzar Evaluación / Start Assessment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'plan' && planGenerated && (
          <SelfSufficiencyPlan formData={formData} onEdit={handleEditPlan} />
        )}

        <AIAssistant
          userContext={Object.keys(formData).length > 0 ? formData : null}
          budgetData={budgetData}
          setFormData={setFormData}
          isOpen={chatOpen}
          onToggle={() => setChatOpen(o => !o)}
        />
      </div>
    </CurrencyProvider>
  )
}
