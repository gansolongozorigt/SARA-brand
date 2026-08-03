// Structured content layer for the four legal pages (delivery / payment /
// returns / privacy). Kept OUT of the i18n dictionaries on purpose: these are
// long structured documents, not UI strings.
//
// The types below are the parity guarantee. `LegalContent` is
// Record<LegalDocKey, LegalDoc>, and every field of LegalDoc is required, so if
// any locale omits a document — or a document omits its title, dates, sections,
// legalBasis or languageNotice — `tsc -b` fails the build, exactly like the
// existing `Record<TranslationKey, string>` check on the i18n locales.

/**
 * A single rendered line. Either a plain paragraph (string) or a visually
 * distinct quote block. For passages quoted from Mongolian law, translated
 * locales carry the faithful translation in `text` and the Mongolian original
 * alongside it in `original` (omitted in the mn source and for non-law quotes
 * such as the bank-details callout).
 */
export type LegalItem = string | { type: 'quote'; text: string; original?: string }

export interface LegalSection {
  heading: string
  items: LegalItem[]
}

/** The "Хуулийн үндэслэл" (legal basis) block shown at the end of every page. */
export interface LegalBasis {
  lawName: string
  lawMeta: string
  points: LegalItem[]
}

export interface LegalDoc {
  title: string
  effectiveDate: string
  updatedDate: string
  sections: LegalSection[]
  legalBasis: LegalBasis
  /** Precedence-of-Mongolian notice, rendered at the foot of every page. */
  languageNotice: string
}

/** The four documents. Missing one in any locale fails the build. */
export type LegalDocKey = 'delivery' | 'payment' | 'returns' | 'privacy'

export type LegalContent = Record<LegalDocKey, LegalDoc>
