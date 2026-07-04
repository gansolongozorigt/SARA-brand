import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { dictionaries, type Lang, type TranslationKey } from './index'

const STORAGE_KEY = 'sara-lang'
const VALID_LANGS: Lang[] = ['mn', 'en', 'cn', 'ru', 'ko']

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLang(): Lang {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved && (VALID_LANGS as string[]).includes(saved) ? (saved as Lang) : 'mn'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang)

  // Persist the choice and reflect it on <html lang> (zh for Chinese).
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === 'cn' ? 'zh' : lang
  }, [lang])

  const t = (key: TranslationKey): string => dictionaries[lang][key]

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useT / useLang must be used within a LanguageProvider')
  return ctx
}

/** Returns the translate function: t('navProducts') → localized string. */
// eslint-disable-next-line react-refresh/only-export-components
export function useT(): (key: TranslationKey) => string {
  return useLanguage().t
}

/** Returns the current language and a setter. */
// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): { lang: Lang; setLang: (lang: Lang) => void } {
  const { lang, setLang } = useLanguage()
  return { lang, setLang }
}
