import { REVIEWS } from '../../data/reviews'
import { useLang, useT } from '../../i18n/LanguageContext'

export default function Reviews() {
  const t = useT()
  const { lang } = useLang()
  return (
    <section className="reviews">
      {/* Kicker only — the large revTitle h2 was removed in batch 3 (key kept, unused) */}
      <div className="sec-head reveal">
        <span className="sec-kick">{t('revKick')}</span>
      </div>
      <div className="rev-grid">
        {REVIEWS.map((review) => (
          <div key={review.initial} className="rev reveal">
            <div className="stars">{'★'.repeat(review.rating)}</div>
            <p>{`"${review.text[lang]}"`}</p>
            <div className="who">
              <div className="av">{review.initial}</div>
              <div>
                <div className="nm">{review.name[lang]}</div>
                <div className="rl">{review.role[lang]}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
