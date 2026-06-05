import { REVIEWS } from '../../data/reviews'

const REV = { kick: 'Reviews', title: 'What our customers say' }

export default function Reviews() {
  return (
    <section className="reviews">
      <div className="sec-head reveal">
        <span className="sec-kick">{REV.kick}</span>
        <h2>{REV.title}</h2>
      </div>
      <div className="rev-grid">
        {REVIEWS.map((review) => (
          <div key={review.name} className="rev reveal">
            <div className="stars">{'★'.repeat(review.rating)}</div>
            <p>{`"${review.text}"`}</p>
            <div className="who">
              <div className="av">{review.initial}</div>
              <div>
                <div className="nm">{review.name}</div>
                <div className="rl">{review.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
