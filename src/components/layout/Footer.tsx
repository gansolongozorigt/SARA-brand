const EXPLORE = ['Products', 'About', 'Contact']

export default function Footer() {
  return (
    <footer className="bg-ink px-[26px] pb-[28px] pt-[54px] text-[#cfc6b4] max-[680px]:px-[22px] max-[680px]:pb-[24px] max-[680px]:pt-[40px]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[1.4fr_1fr_1fr] gap-[34px] max-[980px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:gap-[24px]">
        {/* Brand + blurb — the SARA logo is gold on every background */}
        <div>
          <div className="gold-text mb-[14px] pl-[0.42em] font-serif text-[34px] font-semibold tracking-[0.42em] max-[680px]:text-[28px]">
            SARA
          </div>
          <p className="max-w-[320px] text-[14px] text-[#9c9483] max-[680px]:text-[13px]">
            A naturally derived beauty brand created by a Mongolian woman. Love your skin.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h5 className="mb-[14px] font-sans text-[12px] uppercase tracking-[0.18em] text-gold2">Explore</h5>
          <ul className="flex flex-col gap-[9px]">
            {EXPLORE.map((label) => (
              <li
                key={label}
                className="cursor-pointer text-[14px] text-[#b8af9c] transition-colors duration-[250ms] hover:text-white"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h5 className="mb-[14px] font-sans text-[12px] uppercase tracking-[0.18em] text-gold2">Contact</h5>
          <ul className="flex flex-col gap-[9px]">
            <li className="text-[14px] text-[#b8af9c] transition-colors duration-[250ms] hover:text-white">
              <a href="tel:+97689983612">+976 8998 3612</a>
            </li>
            <li className="text-[14px] text-[#b8af9c]">Mon–Sat · 10:00–19:00</li>
            <li className="cursor-pointer text-[14px] text-[#b8af9c] transition-colors duration-[250ms] hover:text-white">
              Instagram · Facebook
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-[34px] flex max-w-[1240px] flex-wrap justify-between gap-[10px] border-t border-white/10 pt-[20px] text-[12.5px] text-[#8a8270]">
        <span>
          © 2026 SARA. <span>All rights reserved.</span>
        </span>
        <span>Made with ❤ in Mongolia</span>
      </div>
    </footer>
  )
}
