// Ambient atmosphere — two soft radial "orbs" whose colors shift with the active hero card.
export default function Background() {
  return (
    <div className="bg-atmos" aria-hidden="true">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
    </div>
  )
}
