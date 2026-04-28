import { createContext, useContext, useState } from 'react'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('HNL') // 'USD' or 'HNL'
  const [buyRate, setBuyRate] = useState(24.50)   // Bank buys USD at this HNL rate
  const [sellRate, setSellRate] = useState(25.20) // Bank sells USD at this HNL rate
  const [rateMode, setRateMode] = useState('sell') // 'buy' or 'sell' for display

  const activeRate = rateMode === 'buy' ? buyRate : sellRate

  // Convert a value from USD to HNL or vice versa
  function convert(amount, fromCurrency) {
    const num = parseFloat(amount) || 0
    if (fromCurrency === 'USD' && currency === 'HNL') return num * activeRate
    if (fromCurrency === 'HNL' && currency === 'USD') return num / activeRate
    return num
  }

  // Format a number as currency string
  function fmt(amount, cur = currency) {
    const num = parseFloat(amount) || 0
    if (cur === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num)
    }
    return `L ${new Intl.NumberFormat('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`
  }

  // Given a value entered in the current currency, return both USD and HNL formatted
  function fmtBoth(amount) {
    const num = parseFloat(amount) || 0
    if (currency === 'USD') {
      return { primary: fmt(num, 'USD'), secondary: `L ${new Intl.NumberFormat('es-HN', { minimumFractionDigits: 2 }).format(num * activeRate)} HNL` }
    } else {
      return { primary: fmt(num, 'HNL'), secondary: `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(num / activeRate)} USD` }
    }
  }

  const symbol = currency === 'USD' ? '$' : 'L'
  const currencyLabel = currency === 'USD' ? 'USD' : 'HNL'

  return (
    <CurrencyContext.Provider value={{
      currency, setCurrency,
      buyRate, setBuyRate,
      sellRate, setSellRate,
      rateMode, setRateMode,
      activeRate,
      convert, fmt, fmtBoth,
      symbol, currencyLabel
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
