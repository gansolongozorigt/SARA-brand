import Hero from '../components/home/Hero'
import Marquee from '../components/home/Marquee'
import ProductGrid from '../components/product/ProductGrid'
import About from '../components/home/About'
import InfoCards from '../components/home/InfoCards'
import ContactStrip from '../components/home/ContactStrip'
import { useReveal } from '../lib/useReveal'

export default function Home() {
  useReveal()
  return (
    <>
      <Hero />
      <Marquee />
      <ProductGrid />
      <About />
      <InfoCards />
      {/* Testimonials removed: the original three were invented prototype copy.
          A real reviews block driven by approved WooCommerce product reviews
          will go here later. */}
      <ContactStrip />
    </>
  )
}
