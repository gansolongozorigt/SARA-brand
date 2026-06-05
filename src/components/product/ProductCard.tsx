import { useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { formatPrice, type Product } from '../../data/products'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const timer = useRef<number | null>(null)

  // Visual-only "Added" morph — no real cart wiring yet.
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAdded(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div className="card">
      <div className="ph">
        <span className="tag">{product.tag}</span>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
      </div>
      <div className="body">
        <h3>{product.name}</h3>
        <div className="short">{product.short}</div>
        <div className="priceline">
          <span className="price">{formatPrice(product.price)}</span>
          {product.old != null && <span className="old">{formatPrice(product.old)}</span>}
        </div>
        <button type="button" className={cn('atc quick', added && 'added')} onClick={handleAdd}>
          <span className="cartfly">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.7}>
              <path d="M6 6h15l-1.5 9h-12z" />
            </svg>
          </span>
          <span className="lbl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            Add to cart
          </span>
          <span className="done">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}>
              <path d="M5 12l5 5L20 6" />
            </svg>
            Added
          </span>
        </button>
      </div>
    </div>
  )
}
