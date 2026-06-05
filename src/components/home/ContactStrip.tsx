const CONTACT = {
  heading: 'Ready to order or need advice?',
  phone: '+976 8998 3612',
}

export default function ContactStrip() {
  return (
    <section id="contact" className="contactstrip">
      <div className="in reveal">
        <h3>{CONTACT.heading}</h3>
        <div className="phone">
          <a href="tel:+97689983612">{CONTACT.phone}</a>
        </div>
      </div>
    </section>
  )
}
