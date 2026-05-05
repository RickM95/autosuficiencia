import { createContext, useContext, useState } from 'react'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('HNL') // Default currency for data entry
  const [lang, setLang] = useState('ES')        // 'ES' or 'EN'
  const [displayMode, setDisplayMode] = useState('HNL') // 'HNL', 'USD', or 'BOTH'
  const [buyRate, setBuyRate] = useState(24.50)
  const [sellRate, setSellRate] = useState(25.20)
  const [rateMode, setRateMode] = useState('sell')

  const activeRate = rateMode === 'buy' ? buyRate : sellRate

  function formatValue(num, cur) {
    if (cur === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num)
    }
    return `L ${new Intl.NumberFormat('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`
  }

  function fmt(amount, cur = currency) {
    const num = parseFloat(amount) || 0
    return formatValue(num, cur)
  }

  function fmtDisplay(amount) {
    const num = parseFloat(amount) || 0
    // Conversion logic: if input is HNL but we want USD, or vice versa
    const hnlValue = currency === 'HNL' ? num : num * activeRate
    const usdValue = currency === 'USD' ? num : num / activeRate

    if (displayMode === 'HNL') return formatValue(hnlValue, 'HNL')
    if (displayMode === 'USD') return formatValue(usdValue, 'USD')
    if (displayMode === 'BOTH') {
      return `${formatValue(hnlValue, 'HNL')} / ${formatValue(usdValue, 'USD')}`
    }
    return formatValue(hnlValue, 'HNL')
  }

  function fmtBoth(amount) {
    const num = parseFloat(amount) || 0
    const hnlValue = currency === 'HNL' ? num : num * activeRate
    const usdValue = currency === 'USD' ? num : num / activeRate
    
    return {
      primary: displayMode === 'USD' ? formatValue(usdValue, 'USD') : formatValue(hnlValue, 'HNL'),
      secondary: displayMode === 'USD' ? formatValue(hnlValue, 'HNL') : formatValue(usdValue, 'USD')
    }
  }

  const symbol = currency === 'USD' ? '$' : 'L'

  return (
    <CurrencyContext.Provider value={{
      currency, setCurrency,
      lang, setLang,
      displayMode, setDisplayMode,
      buyRate, setBuyRate,
      sellRate, setSellRate,
      rateMode, setRateMode,
      activeRate,
      fmt, fmtDisplay, fmtBoth,
      symbol
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
