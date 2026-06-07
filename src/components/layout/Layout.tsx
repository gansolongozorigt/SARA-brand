import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Background from './Background'
import CartDrawer from '../cart/CartDrawer'
import ProductModal from '../product/ProductModal'

export default function Layout() {
  return (
    <>
      <Background />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <CartDrawer />
      <ProductModal />
    </>
  )
}
