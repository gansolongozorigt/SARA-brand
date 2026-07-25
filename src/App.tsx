import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import { useLivePrices } from './store/livePrices'

function App() {
  // Fetch live prices/stock once on load. Non-blocking: the static catalogue is
  // already rendering; merged values update in place when this resolves.
  useEffect(() => {
    useLivePrices.getState().load()
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
