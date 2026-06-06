import { mn, type TranslationKey } from './locales/mn'
import { en } from './locales/en'
import { cn } from './locales/cn'
import { ru } from './locales/ru'

export type Lang = 'mn' | 'en' | 'cn' | 'ru'
export type { TranslationKey }

export const dictionaries: Record<Lang, Record<TranslationKey, string>> = { mn, en, cn, ru }

/** Display labels for the language switcher (МН stays Cyrillic). */
export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'mn', label: 'МН' },
  { code: 'en', label: 'EN' },
  { code: 'cn', label: '中文' },
  { code: 'ru', label: 'RU' },
]

export { mn, en, cn, ru }
