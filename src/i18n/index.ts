import { mn, type TranslationKey } from './locales/mn'
import { en } from './locales/en'
import { cn } from './locales/cn'
import { ru } from './locales/ru'

export type Lang = 'mn' | 'en' | 'cn' | 'ru'
export type { TranslationKey }

/** A value translated into every supported language. */
export type Localized = Record<Lang, string>

export const dictionaries: Record<Lang, Record<TranslationKey, string>> = { mn, en, cn, ru }

/**
 * Languages for the switcher.
 * `short` = compact code for the circular trigger (中 fits the circle for Chinese);
 * `native` = name shown in the dropdown.
 */
export const LANGUAGES: { code: Lang; short: string; native: string }[] = [
  { code: 'mn', short: 'МН', native: 'Монгол' },
  { code: 'en', short: 'EN', native: 'English' },
  { code: 'cn', short: '中', native: '中文' },
  { code: 'ru', short: 'RU', native: 'Русский' },
]

export { mn, en, cn, ru }
