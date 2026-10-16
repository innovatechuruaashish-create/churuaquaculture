function ContactPage({ language = 'en', onNavigate }) {
  const hi = language === 'hi'

  const contacts = [
       {
      title: 'JD Fisheries',
      titleHi: 'JD फिशरीज',
      name: 'Dharmesh Sodani',
      phone: '+91 92526 66812',
      phoneAlt: '+91 141 274 3347',
      role: hi ? 'जिलाधिकारी मत्स्य, जयपुर' : 'JD Fisheries, Jaipur',
    },
    {
      title: 'DDF',
      titleHi: 'DDF',
      name: 'Manoj Meena',
      phone: '+91 96498 79288',
      role: hi ? 'उप निदेशक मत्स्य' : 'Deputy Director Fisheries',
    },
    {
      title: 'A.D.F.',
      titleHi: 'A.D.F.',
      name: 'Mohammad Irshad Khan',
      phone: '+91 95944 58166',
      role: hi ? 'उप जिला मत्स्य अधिकारी' : 'Assistant District Fisheries Officer',
    },
    {
      title: 'AFDO',
      titleHi: 'AFDO',
      name: 'Lovedeep Sharma',
      phone: '+91 97563 87957',
      role: hi ? 'सहायक मत्स्य विकास अधिकारी' : 'Assistant Fisheries Development Officer',
    },
    {
      title: 'UDC',
      titleHi: 'UDC',
      name: 'Bheem Singh',
      phone: '+91 97853 45312',
      role: hi ? 'यूनाइटेड डिप्टी कलैक्टर' : 'UDC Officer',
    },
 
  ]

  return (
    <div className="page-stack">
      <section className="page-hero compact reveal">
        <p className="eyebrow">{hi ? 'संपर्क जानकारी' : 'Contact Information'}</p>
        <h1>{hi ? 'चूरू जिला मत्स्य विभाग' : 'Churu District Fisheries Department'}</h1>
        <p>{hi ? 'निरीक्षण, पंजीकरण और तकनीकी सहायता के लिए सीधे अधिकारियों से संपर्क करें।' : 'Reach out directly to district fisheries officers for registration, inspection, and support.'}</p>
      </section>

      <section className="contact-panel reveal delay-one">
        <div className="contact-overview">
          <h2>{hi ? 'प्रमुख संपर्क अधिकारी' : 'Primary Contact Officers'}</h2>
          <p>{hi ? 'इस पृष्ठ पर आपके पास चूरू के मत्स्य विभाग के सीधे संपर्क उपलब्ध हैं। कॉल करने के लिए फोन नंबर पर टैप करें।' : 'The page lists direct contacts for the Churu Fisheries Department. Tap the phone number to call.'}</p>
          <button type="button" className="primary-btn" onClick={() => onNavigate('registration')}>
            {hi ? 'पंजीकरण करें' : 'Register Now'}
          </button>
        </div>

        <div className="contact-grid">
          {contacts.map((contact) => (
            <article key={contact.phone} className="contact-card">
              <span className="contact-badge">{hi ? contact.titleHi : contact.title}</span>
              <h3>{contact.name}</h3>
              <p>{contact.role}</p>
              <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="contact-link">
                {contact.phone}
              </a>
              {contact.phoneAlt && (
                <a href={`tel:${contact.phoneAlt.replace(/\s+/g, '')}`} className="contact-link" style={{display: 'block', marginTop: 6}}>
                  {contact.phoneAlt}
                </a>
              )}
              <p className="contact-note">{hi ? 'कार्य समय: सोमवार से शनिवार, 9:00 से 18:00' : 'Working hours: Mon – Sat, 9:00 AM to 6:00 PM'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-panel reveal delay-two">
        <h2>{hi ? 'संपर्क सहायता' : 'Support Details'}</h2>
        <p>{hi ? 'यदि आपको फार्म पंजीकरण या दस्तावेज़ अपलोड करने में परेशानी हो रही है, तो कृपया ऊपर दिए गए अधिकारियों से सीधे बात करें। वे आपको प्रक्रिया के प्रत्येक चरण में मार्गदर्शन करेंगे।' : 'If you need help with farm registration or document upload, contact any of the officers above. They can guide you through every step.'}</p>
        <div className="contact-summary">
          <div>
            <strong>{hi ? 'स्थान' : 'Location'}</strong>
            <span>{hi ? 'चूरू जिला कार्यालय, राजस्थान' : 'Churu District Office, Rajasthan'}</span>
          </div>
          <div>
            <strong>{hi ? 'ईमेल' : 'Email'}</strong>
            <span> fdochuru@gmail.com</span>
          </div>
          <div>
            <strong>{hi ? 'आपातकालीन हेल्पलाइन' : 'Emergency Helpline'}</strong>
            <span>+91 0141 1234567</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
