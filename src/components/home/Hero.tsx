import Coverflow from './Coverflow'

// English i18n placeholders from the design reference (real 3-language i18n comes later).
const HERO = {
  badge: 'Crafted by a Mongolian woman',
  title: 'SARA',
  sub: 'The art of beauty',
  lead: 'Naturally derived formulas, refined design. The full SARA collection to love your skin.',
  ctaShop: 'Shop now',
  ctaContact: 'Contact us',
}

export default function Hero() {
  return (
    <section className="hero">
      <div>
        <span className="hero-badge">{HERO.badge}</span>
        <h1>
          <span className="gold-text">{HERO.title}</span>
          <span className="sub">{HERO.sub}</span>
        </h1>
        <p className="lead">{HERO.lead}</p>
        <div className="hero-cta">
          <a href="#products" className="btn btn-gold">{HERO.ctaShop}</a>
          <a href="#contact" className="btn btn-out">{HERO.ctaContact}</a>
        </div>
      </div>

      <Coverflow />
    </section>
  )
}
