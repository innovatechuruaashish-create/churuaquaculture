function SiteFooter({ onNavigate, language = 'en' }) {
  const links = [
    { id: 'home', label: { en: 'Home', hi: 'होम' } },
    { id: 'registration', label: { en: 'Registration', hi: 'पंजीकरण' } },
    { id: 'guidelines', label: { en: 'Guidelines', hi: 'दिशा-निर्देश' } },
    { id: 'compliance', label: { en: 'Compliance', hi: 'अनुपालन' } },
    { id: 'developers', label: { en: 'Developers', hi: 'डेवलपर्स' } },
  ];

  return (
    <footer className="mega-footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section brand-section">
          <img src="/image/image3.png" alt="Department Logo" className="footer-logo" />
          <div className="brand-content">
            <strong>{language === 'hi' ? 'मत्स्य विभाग, राजस्थान' : 'Department of Fisheries, Rajasthan'}</strong>
            <p>{language === 'hi' ? 'चूरू लवणीय जल मत्स्य पालन पोर्टल।' : 'Churu Saline Water Aquaculture Portal.'}</p>
          </div>
        </div>

        {/* Links Section */}
        <div className="footer-section">
          <h2 className="footer-title">{language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}</h2>
          <nav className="footer-nav">
            {links.map((item) => (
              <button key={item.id} className="footer-link" onClick={() => onNavigate(item.id)}>
                {item.label[language] || item.label.en}
              </button>
            ))}
          </nav>
        </div>

        {/* Support Section */}
        <div className="footer-section">
          <h2 className="footer-title">{language === 'hi' ? 'समर्थन' : 'Support'}</h2>
          <p className="footer-text">{language === 'hi' ? 'सोम-शुक्र, 9:30 AM - 6:00 PM' : 'Mon-Fri, 9:30 AM - 6:00 PM'}</p>
          <button type="button" className="footer-cta" onClick={() => onNavigate('contact')}>
            {language === 'hi' ? 'संपर्क करें' : 'Contact Us'}
          </button>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h2 className="footer-title">{language === 'hi' ? 'संपर्क' : 'Contact'}</h2>
          <div className="contact-details">
            <a href="tel:+919594458166">📞 09594458166</a>
            <a href="mailto:fdochuru@gmail.com">📧 fdochuru@gmail.com</a>
          </div>
          <button type="button" className="footer-cta" onClick={() => onNavigate('contact')}>
            {language === 'hi' ? 'संपर्क पेज देखें' : 'View Contact Page'}
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{language === 'hi' ? 'दिशा-निर्देश - 2026' : 'Aquaculture Guidelines - 2026'}</span>
        <span>© {language === 'hi' ? 'राजस्थान सरकार' : 'Government of Rajasthan'}</span>
      </div>
    </footer>
  );
}

export default SiteFooter;
