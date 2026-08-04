// SINGLE SOURCE OF TRUTH for the shop's bank-transfer accounts.
//
// Every screen that tells a customer where to pay MUST read from
// BANK_ACCOUNTS so the numbers can never drift between the checkout
// payment selector and the order-confirmation page (which is exactly how
// they got out of sync before: the selector advertised "Khan/Golomt" while
// the confirmation only ever showed a Khan account).
//
// To add another bank (e.g. Golomt) later, append its REAL account here and
// it appears everywhere automatically. Do not name a bank in UI copy until
// its account exists in this list.
export interface BankAccount {
  /** Bank display name, e.g. "Хаан банк (Khan Bank)". */
  bank: string
  /** Account number / IBAN. Shown monospaced and select-all for easy copy. */
  account: string
  /** Account holder name exactly as it appears on the account. */
  recipient: string
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    bank: 'Хаан банк (Khan Bank)',
    account: '020005005720871790',
    recipient: 'Г.Урантуяа',
  },
  // NOTE: Golomt is mentioned in some marketing copy but NO Golomt account
  // has ever been configured in this codebase. Add it here (with a real
  // number + recipient) once the owner provides it.
]

/** Comma-separated bank names for short labels (e.g. the payment selector). */
export const BANK_NAMES = BANK_ACCOUNTS.map((a) => a.bank).join(', ')
