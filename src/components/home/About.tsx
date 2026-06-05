import aboutImg from '../../assets/about.jpg'

// English i18n placeholders from the design reference.
const ABOUT = {
  kick: 'About us',
  title: 'From the heart of a Mongolian woman',
  p1: 'SARA is a beauty brand created by a Mongolian woman. We blend naturally derived, trusted formulas with refined design.',
  p2: 'From skincare to fragrance — our goal is to turn your daily ritual into an art.',
  stats: [
    { n: '11+', l: 'Products' },
    { n: '100%', l: 'Natural' },
    { n: '3', l: 'Languages' },
  ],
}

export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-img reveal">
        <img src={aboutImg} alt="SARA beauty products" />
      </div>
      <div className="about-txt reveal">
        <span className="sec-kick">{ABOUT.kick}</span>
        <h2>{ABOUT.title}</h2>
        <p>{ABOUT.p1}</p>
        <p>{ABOUT.p2}</p>
        <div className="about-stats">
          {ABOUT.stats.map((s) => (
            <div key={s.l}>
              <div className="n">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
