import { useState } from 'react'
import '../styles/DevelopersPage.css'

const developers = [
  {
    id: 'inspiration',
    name: 'Abhishek Surana',
    role: '(IAS) Collector Churu',
    roleHi: '(IAS) चूरू के कलेक्टर',
    image: '/image/pic22.png',
    description: 'Our Inspiration',
    descriptionHi: 'हमारी प्रेरणा',
    bio: 'Visionary leader driving digital transformation in Churu district',
    bioHi: 'चूरू जिले में डिजिटल परिवर्तन को आगे बढ़ाने वाले दूरदर्शी नेता',
  },
  {
    id: 'aashish',
    name: 'Aashish Pareek',
    role: 'Frontend Developer',
    roleHi: 'फ्रंटएंड डेवलपर',
    image: '/image/pic21.png',
    description: 'Creative Developer',
    descriptionHi: 'रचनात्मक डेवलपर',
    bio: 'Crafting beautiful and responsive user interfaces with React',
    bioHi: 'React के साथ सुंदर और प्रतिक्रिया शील यूजर इंटरफेस बनाना',
    social: {
      instagram: 'https://www.instagram.com/aashish_.pareek?igsh=MWczbjUxZDMwNzRxaA==',
      linkedin: 'https://www.linkedin.com/in/aashish-pareek-044349370?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    },
  },
  {
    id: 'zaahid',
    name: 'Zaahid Khan',
    role: 'Full Stack Developer',
    roleHi: 'फुल स्टैक डेवलپر',
    image: '/image/pic23.png',
    description: 'Technical Architect',
    descriptionHi: 'तकनीकी आर्किटेक्ट',
    bio: 'Building robust backend solutions and database architectures',
    bioHi: 'मजबूत बैकएंड समाधान और डेटाबेस आर्किटेक्चर बनाना',
    social: {
      instagram: 'https://www.instagram.com/zaahid_khan_15?igsh=MWZhMWlpY3M5bXl4OA==',
      linkedin: 'https://www.linkedin.com/in/zaahid-khan-681b01387?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    },
  },
]

function DevelopersPage({ language = 'en', onNavigate }) {
  const [hoveredCard, setHoveredCard] = useState(null)
  const hi = language === 'hi'
  const inspiration = developers[0]
  const team = developers.slice(1)

  return (
    <div className="page-stack developers-page">
      {/* Hero Section */}
    

      {/* Developers Grid Section */}
      <section className="developers-panel reveal delay-one">
        <div className="developers-group-title">
          <h2>{hi ? 'हमारी प्रेरणा' : 'Our Inspiration'}</h2>
          <p>{hi ? 'यहां से हमने यह यात्रा शुरू की।' : 'This is the guiding force behind the portal.'}</p>
        </div>
        <div className="developers-grid inspiration-grid">
          <div
            className={`developer-card featured ${hoveredCard === inspiration.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard(inspiration.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-image-wrapper">
              <img loading="lazy" decoding="async" src={inspiration.image} alt={inspiration.name} className="developer-image" />
            </div>

            <div className="card-content">
              <h3 className="developer-name">{inspiration.name}</h3>
              <p className="developer-role">{hi ? inspiration.roleHi : inspiration.role}</p>
              <p className="developer-desc">{hi ? inspiration.bioHi : inspiration.bio}</p>
            </div>

            <div className="card-accent"></div>
          </div>
        </div>

        <div className="developers-group-title developers-group-title--secondary">
          <h2>{hi ? 'डेवलपर्स' : 'Developers'}</h2>
          <p>{hi ? 'हमारी टीम जो इस प्रोजेक्ट को बनाती है।' : 'Meet the team building this project.'}</p>
        </div>
        <div className="developers-grid team-grid">
          {team.map((dev) => (
            <div
              key={dev.id}
              className={`developer-card ${hoveredCard === dev.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(dev.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-image-wrapper">
                <img loading="lazy" decoding="async" src={dev.image} alt={dev.name} className="developer-image" />
              </div>

              <div className="card-content">
                <h3 className="developer-name">{dev.name}</h3>
                <p className="developer-role">{hi ? dev.roleHi : dev.role}</p>
                <p className="developer-desc">{hi ? dev.descriptionHi : dev.description}</p>
                {dev.social && (
                  <div className="social-links">
                    <a href={dev.social.instagram} target="_blank" rel="noreferrer noopener" className="social-chip">
                      Instagram
                    </a>
                    <a href={dev.social.linkedin} target="_blank" rel="noreferrer noopener" className="social-chip">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>

              <div className="card-accent"></div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="section-panel reveal delay-two">
        <h2>{hi ? 'हमारा मिशन' : 'Our Mission'}</h2>
        <p className="section-panel-text">
          {hi
            ? 'हम मत्स्य विभाग, राजस्थान को डिजिटल रूप से सक्षम बनाने के लिए प्रतिबद्ध हैं। यह पोर्टल किसानों को सहज पंजीकरण, अनुपालन प्रबंधन, और तकनीकी मार्गदर्शन प्रदान करता है।'
            : 'We are committed to digitally empowering the Department of Fisheries, Rajasthan. This portal provides farmers with seamless registration, compliance management, and technical guidance.'}
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <h4>{hi ? 'लक्ष्य केंद्रित' : 'Goal Oriented'}</h4>
            <p>{hi ? 'किसानों के लिए व्यावहारिक समाधान' : 'Practical solutions for farmers'}</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <h4>{hi ? 'सुरक्षित' : 'Secure'}</h4>
            <p>{hi ? 'आपके डेटा की सुरक्षा हमारी प्राथमिकता' : 'Your data security is our priority'}</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <h4>{hi ? 'तेजी से' : 'Fast'}</h4>
            <p>{hi ? 'मिनटों में पंजीकरण पूरा करें' : 'Complete registration in minutes'}</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤝</span>
            <h4>{hi ? 'समर्थन' : 'Support'}</h4>
            <p>{hi ? 'सभी चरणों में विशेषज्ञ सहायता' : 'Expert support at every step'}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-panel reveal delay-three">
        <h2>{hi ? 'अगला कदम' : 'Next Steps'}</h2>
        <p>
          {hi
            ? 'यदि आप एक किसान हैं और खारे पानी में झींगा पालन शुरू करना चाहते हैं, तो आज ही पंजीकरण करें।'
            : 'If you are a farmer interested in starting saline water shrimp farming, register today.'}
        </p>
        <div className="cta-buttons">
          <button type="button" className="primary-btn" onClick={() => onNavigate('registration')}>
            {hi ? 'अभी पंजीकरण करें' : 'Register Now'}
          </button>
          <button type="button" className="secondary-btn" onClick={() => onNavigate('guidelines')}>
            {hi ? 'दिशा-निर्देश देखें' : 'View Guidelines'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default DevelopersPage
