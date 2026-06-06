import { REVIEWS } from '../../data/reviews'
import { useT } from '../../i18n/LanguageContext'

export default function Reviews() {
  const t = useT()
  return (
    <section className="reviews">
      <div className="sec-head reveal">
        <span className="sec-kick">{t('revKick')}</span>
        <h2>{t('revTitle')}</h2>
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
