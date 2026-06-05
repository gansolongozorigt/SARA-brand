import { cn } from '../../lib/utils'
import { FILTERS, type FilterKey } from '../../data/products'

interface FiltersProps {
  active: FilterKey
  onChange: (key: FilterKey) => void
}

export default function Filters({ active, onChange }: FiltersProps) {
  return (
    <div className="filters">
      {FILTERS.map((f) => (
        <button key={f.key} type="button" onClick={() => onChange(f.key)} className={cn(active === f.key && 'on')}>
          {f.label}
        </button>
      ))}
    </div>
  )
}
