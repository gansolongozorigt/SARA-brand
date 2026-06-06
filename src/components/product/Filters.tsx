import { cn } from '../../lib/utils'
import { FILTERS, type FilterKey } from '../../data/products'
import { useT } from '../../i18n/LanguageContext'

interface FiltersProps {
  active: FilterKey
  onChange: (key: FilterKey) => void
}

export default function Filters({ active, onChange }: FiltersProps) {
  const t = useT()
  return (
    <div className="filters">
      {FILTERS.map((f) => (
        <button key={f.key} type="button" onClick={() => onChange(f.key)} className={cn(active === f.key && 'on')}>
          {t(f.labelKey)}
        </button>
      ))}
    </div>
  )
}
