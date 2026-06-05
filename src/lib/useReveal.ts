import { useEffect } from 'react'

/**
 * Fades in `.reveal` elements as they scroll into view, then unobserves them.
 * Mirrors the design reference's observeReveal(). Call once where the revealed
 * sections are mounted (e.g. the Home page).
 */
export function useReveal(): void {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
