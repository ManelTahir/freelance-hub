import { createContext, useContext, useState, useCallback } from 'react'
import en from './en'
import fr from './fr'

const translations = { en, fr }
const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('fh-lang') || 'en')

  const t = useCallback((key) => {
    const keys = key.split('.')
    let val = translations[lang]
    for (const k of keys) val = val?.[k]
    return val ?? key
  }, [lang])

  const setLanguage = useCallback((l) => {
    localStorage.setItem('fh-lang', l)
    setLang(l)
  }, [])

  return (
    <I18nContext.Provider value={{ t, lang, setLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
