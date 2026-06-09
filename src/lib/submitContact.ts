// Contact-form submission — same Web3Forms approach as submitOrder(), but with a
// distinct subject so messages are separable from orders in the shop inbox.

const WEB3FORMS_ACCESS_KEY = '591aa615-3e7d-47a1-b4f7-846e8b485e3f'
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export interface ContactMessage {
  name: string
  phone?: string
  message: string
}

export interface SubmitResult {
  ok: boolean
  error?: string
}

/** Send a contact message. Never throws — failures resolve to { ok:false }. */
export async function submitContact(msg: ContactMessage): Promise<SubmitResult> {
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'SARA — Холбоо барих мессеж',
        from_name: 'SARA website',
        name: msg.name,
        phone: msg.phone || '—',
        message: msg.message,
      }),
    })

    const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null

    if (res.ok && data?.success) return { ok: true }
    return { ok: false, error: data?.message || `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}
