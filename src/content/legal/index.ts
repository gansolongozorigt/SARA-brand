import type { Lang } from '../../i18n'
import type { LegalContent } from './types'
import { mn } from './mn'
import { en } from './en'
import { cn } from './cn'
import { ru } from './ru'
import { ko } from './ko'

export type { LegalContent, LegalDoc, LegalDocKey, LegalItem, LegalSection, LegalBasis } from './types'

// Typed as Record<Lang, LegalContent>: every locale MUST provide all four
// documents in full, or `tsc -b` fails — the same build-time guarantee the i18n
// dictionaries get from Record<TranslationKey, string>.
export const legalContent: Record<Lang, LegalContent> = { mn, en, cn, ru, ko }
