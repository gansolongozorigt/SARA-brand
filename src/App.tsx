import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminResellers from './pages/AdminResellers'
import { useLivePrices } from './store/livePrices'
import { useAuth } from './store/auth'

function App() {
  // Fetch live prices/stock once on load. Non-blocking: the static catalogue is
  // already rendering; merged values update in place when this resolves.
  useEffect(() => {
    useLivePrices.getState().load()
    // Reflect any existing reseller session (identity only; storefront unchanged).
    useAuth.getState().fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        {/* Internal admin tool — standalone, unlinked, server-gated. */}
        <Route path="/admin" element={<AdminResellers />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
