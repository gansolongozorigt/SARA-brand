import Hero from '../components/home/Hero'
import Marquee from '../components/home/Marquee'
import ProductGrid from '../components/product/ProductGrid'
import About from '../components/home/About'
import InfoCards from '../components/home/InfoCards'
import Reviews from '../components/home/Reviews'
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
      <Reviews />
      <ContactStrip />
    </>
  )
}
