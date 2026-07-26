import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'
import { useT } from '../i18n/LanguageContext'

// Contract tiers shown in the dropdown (the discount is derived server-side).
const TIERS = [30, 40, 50, 60, 70, 80] as const

interface Row {
  email: string
  tier: number
  expiry: string
  note?: string
  status: 'active' | 'expired'
}

type Access = 'loading' | 'admin' | 'denied' | 'error'

const inputCls =
  'w-full rounded-[10px] border border-line bg-paper px-[12px] py-[9px] text-[14px] text-ink outline-none focus:border-gold3'

// Client-side status for optimistic updates only (Edge Config writes take up to
// 10s to propagate to the read endpoint, so we don't re-fetch right after a save).
// The server remains authoritative on the next page load. Mirrors the UB logic.
function clientStatus(expiry: string): 'active' | 'expired' {
  const todayUB = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ulaanbaatar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return expiry >= todayUB ? 'active' : 'expired'
}

export default function AdminResellers() {
  const t = useT()
  const [access, setAccess] = useState<Access>('loading')
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<number>(30)
  const [expiry, setExpiry] = useState('')
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/admin-resellers', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (res.status === 403) return setAccess('denied')
      if (!res.ok) return setAccess('error')
      const data = await res.json()
      setRows(Array.isArray(data.resellers) ? data.resellers : [])
      setAccess('admin')
    } catch {
      setAccess('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setEmail('')
    setTier(30)
    setExpiry('')
    setNote('')
    setEditing(false)
    setErr(null)
  }

  function startEdit(r: Row) {
    setEmail(r.email)
    setTier(r.tier)
    setExpiry(r.expiry)
    setNote(r.note ?? '')
    setEditing(true)
    setErr(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/admin-resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, tier, expiry, note: note.trim() || undefined }),
      })
      if (!res.ok) {
        setErr(t('adminError'))
      } else {
        // Optimistic upsert from the write response (avoids read-propagation lag).
        const rec = (await res.json()).reseller as { email: string; tier: number; expiry: string; note?: string }
        const row: Row = { email: rec.email, tier: rec.tier, expiry: rec.expiry, note: rec.note, status: clientStatus(rec.expiry) }
        setRows((prev) => [...prev.filter((r) => r.email !== row.email), row].sort((a, b) => a.email.localeCompare(b.email)))
        resetForm()
      }
    } catch {
      setErr(t('adminError'))
    } finally {
      setBusy(false)
    }
  }

  async function remove(target: string) {
    if (!window.confirm(t('adminConfirmDelete'))) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin-resellers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: target }),
      })
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.email !== target)) // optimistic
        if (editing && email === target) resetForm()
      } else {
        setErr(t('adminError'))
      }
    } catch {
      setErr(t('adminError'))
    } finally {
      setBusy(false)
    }
  }

  // Access-gated rendering. Non-admins see only a bare message — no data, no form.
  if (access === 'loading') {
    return <Shell><p className="text-[14px] text-muted">{t('adminLoading')}</p></Shell>
  }
  if (access === 'denied') {
    return <Shell><p className="text-[15px] text-ink">{t('adminNoAccess')}</p></Shell>
  }
  if (access === 'error') {
    return <Shell><p className="text-[14px] text-muted">{t('adminError')}</p></Shell>
  }

  return (
    <Shell>
      <h1 className="mb-[20px] font-serif text-[26px] font-semibold text-ink">{t('adminTitle')}</h1>

      {/* Add / edit form */}
      <form onSubmit={save} className="mb-[28px] rounded-[16px] border border-line bg-ivory/70 p-[20px]">
        <h2 className="mb-[14px] font-serif text-[17px] font-semibold text-ink">
          {editing ? t('adminEditTitle') : t('adminNewTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-[12px] max-[560px]:grid-cols-1">
          <label className="block">
            <span className="mb-[5px] block text-[12px] uppercase tracking-[0.06em] text-muted">{t('adminColEmail')}</span>
            <input
              type="email"
              required
              className={cn(inputCls, editing && 'opacity-60')}
              value={email}
              readOnly={editing}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>
          <label className="block">
            <span className="mb-[5px] block text-[12px] uppercase tracking-[0.06em] text-muted">{t('adminColTier')}</span>
            <select className={inputCls} value={tier} onChange={(e) => setTier(Number(e.target.value))}>
              {TIERS.map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-[5px] block text-[12px] uppercase tracking-[0.06em] text-muted">{t('adminColExpiry')}</span>
            <input type="date" required className={inputCls} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-[5px] block text-[12px] uppercase tracking-[0.06em] text-muted">{t('adminColNote')}</span>
            <input
              type="text"
              className={inputCls}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('adminNoteOptional')}
              maxLength={200}
            />
          </label>
        </div>
        {err && <p className="mt-[12px] text-[13px] text-[#c0563d]">{err}</p>}
        <div className="mt-[16px] flex items-center gap-[10px]">
          <button
            type="submit"
            disabled={busy}
            className="gold-bg rounded-full px-[22px] py-[10px] text-[13px] font-semibold uppercase tracking-[0.06em] text-[#241c08] disabled:opacity-50"
          >
            {editing ? t('adminSave') : t('adminAdd')}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full px-[18px] py-[10px] text-[13px] text-muted transition-colors hover:text-ink"
            >
              {t('adminCancel')}
            </button>
          )}
        </div>
      </form>

      {/* Registry table */}
      {rows.length === 0 ? (
        <p className="text-[14px] text-muted">{t('adminEmpty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
                <th className="py-[10px] pr-[12px] font-medium">{t('adminColEmail')}</th>
                <th className="py-[10px] pr-[12px] font-medium">{t('adminColTier')}</th>
                <th className="py-[10px] pr-[12px] font-medium">{t('adminColExpiry')}</th>
                <th className="py-[10px] pr-[12px] font-medium">{t('adminColStatus')}</th>
                <th className="py-[10px] pr-[12px] font-medium">{t('adminColNote')}</th>
                <th className="py-[10px] font-medium">{t('adminColActions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-b border-line/70 text-ink">
                  <td className="py-[11px] pr-[12px]">{r.email}</td>
                  <td className="py-[11px] pr-[12px]">{r.tier}%</td>
                  <td className="py-[11px] pr-[12px]">{r.expiry}</td>
                  <td className="py-[11px] pr-[12px]">
                    <span className={r.status === 'active' ? 'text-gold3' : 'text-muted'}>
                      {r.status === 'active' ? t('adminStatusActive') : t('adminStatusExpired')}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate py-[11px] pr-[12px] text-muted">{r.note ?? ''}</td>
                  <td className="whitespace-nowrap py-[11px]">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="text-[13px] text-gold3 underline-offset-2 hover:underline"
                    >
                      {t('adminEdit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r.email)}
                      disabled={busy}
                      className="ml-[14px] text-[13px] text-muted underline-offset-2 hover:text-[#c0563d] hover:underline disabled:opacity-50"
                    >
                      {t('adminDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}

/** Minimal page frame reusing the site background + ink tokens. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory px-[24px] py-[40px] text-charcoal">
      <div className="mx-auto max-w-[860px]">{children}</div>
    </div>
  )
}
