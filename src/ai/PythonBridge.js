const PYTHON_SCRIPTS = {
  amortization: `
import json
def amortization(principal, rate, term):
    monthly_rate = rate / 12 / 100
    payment = principal * monthly_rate * (1 + monthly_rate)**term / ((1 + monthly_rate)**term - 1)
    schedule = []
    balance = principal
    for i in range(term):
        interest = balance * monthly_rate
        principal_pmt = payment - interest
        balance -= principal_pmt
        schedule.append({"period": i+1, "payment": round(payment,2), "interest": round(interest,2), "principal": round(principal_pmt,2), "balance": round(max(balance,0),2)})
    return {"payment": round(payment,2), "total_interest": round(sum(s["interest"] for s in schedule),2), "schedule": schedule}
print(json.dumps(amortization(_principal, _rate, _term)))
  `,
  projectSavings: `
import json
def project_savings(monthly, rate, years):
    monthly_rate = rate / 12 / 100
    total = 0
    projections = []
    for y in range(1, years+1):
        for m in range(12):
            total = (total + monthly) * (1 + monthly_rate)
        projections.append({"year": y, "total": round(total,2)})
    return {"final": round(total,2), "projections": projections}
print(json.dumps(project_savings(_monthly, _rate, _years)))
  `,
  debtPayoff: `
import json
def debt_payoff(balances, payments, rates, extra=0):
    remaining = list(balances)
    total_months = 0
    total_interest = 0
    pmts = list(payments)
    while sum(r for r in remaining if r > 0) > 0:
        for i in range(len(remaining)):
            if remaining[i] <= 0: continue
            interest = remaining[i] * rates[i] / 12 / 100
            total_interest += interest
            remaining[i] += interest
            pmt = pmts[i] + (extra if i == 0 else 0)
            remaining[i] = max(0, remaining[i] - pmt)
        total_months += 1
        if total_months > 600: break
    return {"months": total_months, "total_interest": round(total_interest,2), "years": round(total_months/12,1)}
print(json.dumps(debt_payoff(_balances, _payments, _rates, _extra)))
  `,
  budgetAnalysis: `
import json
def analyze_budget(income, expenses_by_cat):
    recommendations = []
    total_expenses = sum(expenses_by_cat.values())
    if total_expenses > income:
        recommendations.append("Deficit detected - reduce expenses or increase income")
    for cat, amount in expenses_by_cat.items():
        pct = (amount / income * 100) if income > 0 else 0
        if cat == "housing" and pct > 35:
            recommendations.append(f"Housing at {pct:.0f}% (target: 25-35%)")
        elif cat == "food" and pct > 15:
            recommendations.append(f"Food at {pct:.0f}% (target: 10-15%)")
    return recommendations
print(json.dumps(analyze_budget(_income, _expenses_by_cat)))
  `,
  extractPdfText: `
import sys, json
try:
    from pdfminer.high_level import extract_text
    from io import BytesIO
    text = extract_text(BytesIO(_pdf_bytes))
    print(json.dumps({"text": text[:50000], "pages": text.count(chr(10)+chr(12))+1}))
except Exception as e:
    print(json.dumps({"error": str(e), "text": ""}))
  `,
}

export default class PythonBridge {
  constructor() {
    this.ready = false
    this.loading = false
    this.error = null
    this.progress = 0
    this._queue = []
    this._resolveReady = null
    this.readyPromise = new Promise(resolve => { this._resolveReady = resolve })
  }

  async init() {
    if (this.ready || this.loading) return this.readyPromise
    this.loading = true
    this.progress = 0
    this._reportProgress(10, 'Cargando runtime de Python / Loading Python runtime...')

    try {
      const pyodideModule = await import('pyodide')
      this.progress = 30
      this._reportProgress(30, 'Inicializando / Initializing...')

      this.pyodide = await pyodideModule.loadPyodide()
      this.progress = 70
      this._reportProgress(70, 'Cargando paquetes / Loading packages...')

      try {
        await this.pyodide.loadPackage(['micropip'])
        const micropip = this.pyodide.pyimport('micropip')
        await micropip.install('pdfminer.six')
      } catch (e) {
        console.warn('PDF packages not available:', e)
      }

      this.progress = 100
      this.ready = true
      this.loading = false
      this._reportProgress(100, 'Ready')
      this._drainQueue()
      this._resolveReady()
    } catch (e) {
      this.error = e.message
      this.ready = false
      this.loading = false
      this._reportProgress(0, `Error: ${e.message}`)
      this._resolveReady()
      console.warn('PythonBridge init failed:', e)
    }
    return this.readyPromise
  }

  _reportProgress(pct, message) {
    if (this.onProgress) this.onProgress(pct, message)
  }

  async runPython(code) {
    if (!this.ready) {
      return new Promise((resolve) => {
        this._queue.push({ code, resolve })
      })
    }
    try {
      const result = this.pyodide.runPython(code)
      return { success: true, result: String(result) }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  }

  _runWithGlobals(script, globals) {
    if (this.ready) {
      for (const [key, val] of Object.entries(globals)) {
        this.pyodide.globals.set(`_${key}`, val)
      }
    }
    return this.runPython(script)
  }

  _drainQueue() {
    for (const item of this._queue) {
      this.runPython(item.code).then(item.resolve)
    }
    this._queue = []
  }

  async calculateAmortization(principal, rate, term) {
    const code = PYTHON_SCRIPTS.amortization
    const result = await this._runWithGlobals(code, { principal, rate, term })
    if (result.success) return JSON.parse(result.result)
    return this._fallbackAmortization(principal, rate, term)
  }

  async projectSavings(monthly, rate, years) {
    const code = PYTHON_SCRIPTS.projectSavings
    const result = await this._runWithGlobals(code, { monthly, rate, years })
    if (result.success) return JSON.parse(result.result)
    return this._fallbackSavings(monthly, rate, years)
  }

  async calculateDebtPayoff(balances, payments, rates, extra = 0) {
    const code = PYTHON_SCRIPTS.debtPayoff
    const result = await this._runWithGlobals(code, { balances, payments, rates, extra })
    if (result.success) return JSON.parse(result.result)
    return null
  }

  async analyzeBudget(income, expensesByCat) {
    const code = PYTHON_SCRIPTS.budgetAnalysis
    const result = await this._runWithGlobals(code, { income, expenses_by_cat: expensesByCat })
    if (result.success) return JSON.parse(result.result)
    return []
  }

  async extractPdfText(pdfArrayBuffer) {
    if (!this.ready) return { text: '', error: 'Python not ready' }
    try {
      const uint8 = new Uint8Array(pdfArrayBuffer)
      const code = PYTHON_SCRIPTS.extractPdfText
      const result = await this._runWithGlobals(code, { pdf_bytes: uint8 })
      if (result.success) return JSON.parse(result.result)
      return { text: '', error: result.error }
    } catch (e) {
      return { text: '', error: e.message }
    }
  }

  _fallbackAmortization(principal, rate, term) {
    const monthlyRate = rate / 12 / 100
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1)
    const schedule = []
    let balance = principal
    let totalInterest = 0
    for (let i = 1; i <= term; i++) {
      const interest = balance * monthlyRate
      const principalPmt = payment - interest
      balance = Math.max(0, balance - principalPmt)
      totalInterest += interest
      schedule.push({ period: i, payment: +payment.toFixed(2), interest: +interest.toFixed(2), principal: +principalPmt.toFixed(2), balance: +balance.toFixed(2) })
    }
    return { payment: +payment.toFixed(2), total_interest: +totalInterest.toFixed(2), schedule }
  }

  _fallbackSavings(monthly, rate, years) {
    const monthlyRate = rate / 12 / 100
    let total = 0
    const projections = []
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) total = (total + monthly) * (1 + monthlyRate)
      projections.push({ year: y, total: +total.toFixed(2) })
    }
    return { final: +total.toFixed(2), projections }
  }
}
