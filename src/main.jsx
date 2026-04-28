import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ═══════════════════════════════════════════════════════════════
// Runtime Security Checks
// ═══════════════════════════════════════════════════════════════

// Prevent the app from being loaded in an iframe (defense-in-depth)
if (window.top !== window.self) {
  document.body.innerHTML = '<h1>This application cannot be embedded in frames.</h1>'
  throw new Error('Frame embedding blocked')
}

// Log CSP violations for debugging (client-side only)
if (typeof ReportingObserver !== 'undefined') {
  const observer = new ReportingObserver((reports) => {
    for (const report of reports) {
      if (report.type === 'csp-violation') {
        console.warn('[CSP Violation]', report.body)
      }
    }
  }, { types: ['csp-violation'] })
  observer.observe()
}

// ═══════════════════════════════════════════════════════════════
// App Initialization
// ═══════════════════════════════════════════════════════════════

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

