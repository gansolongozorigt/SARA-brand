import { useState } from 'react'
import { PRODUCTS, type FilterKey } from '../../data/products'
import Filters from './Filters'
import ProductCard from './ProductCard'

// English i18n placeholders from the design reference.
const SEC = {
  kick: 'Collection',
  title: 'Our products',
  sub: 'Tap a product to view full details, ingredients and price.',
}

export default function ProductGrid() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const visible = PRODUCTS.filter((p) => filter === 'all' || p.category === filter)

  return (
    <section id="products">
      <div className="sec-head">
        <span className="sec-kick">{SEC.kick}</span>
        <h2>{SEC.title}</h2>
        <p>{SEC.sub}</p>
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
