import { useState } from 'react'
import { PRODUCTS, type FilterKey } from '../../data/products'
import { useT } from '../../i18n/LanguageContext'
import Filters from './Filters'
import ProductCard from './ProductCard'

export default function ProductGrid() {
  const t = useT()
  const [filter, setFilter] = useState<FilterKey>('all')
  const visible = PRODUCTS.filter((p) => filter === 'all' || p.category === filter)

  return (
    <section id="products">
      <div className="sec-head">
        <span className="sec-kick">{t('prodKick')}</span>
        <h2>{t('prodTitle')}</h2>
        <p>{t('prodSub')}</p>
      </div>

      <Filters active={filter} onChange={setFilter} />

      <div className="grid">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
