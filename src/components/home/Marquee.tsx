// First words mirror the design reference's first 8 products (PRODUCTS.slice(0,8)).
const MARQUEE_WORDS = ['SARA', 'Sun', 'Brightening', 'Camel', 'SARA', 'Anti-Aging', 'Centella', 'White']

export default function Marquee() {
  // Duplicate the words so the -50% scroll animation loops seamlessly.
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <div className="marquee">
      <div className="track">
        {words.map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  )
}
