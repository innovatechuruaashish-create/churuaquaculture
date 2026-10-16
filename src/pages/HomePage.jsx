import { useState, useEffect } from 'react'
import { highlights, objectives, permittedSpecies, timeline } from '../data/portalData'

const sliderImages = [
  '/image/pic1.jpeg',
  '/image/pic2.jpeg',
  '/image/pic3.jpeg',
  '/image/pic4.jpeg'
]

function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hero-slider-container">
      <div 
        className="hero-slider-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {sliderImages.map((src, index) => (
          <img decoding="async" key={index} src={src} alt={`Slide ${index + 1}`} className="hero-slide-image" />
        ))}
      </div>
      <div className="slider-dots">
        {sliderImages.map((_, index) => (
          <button 
            key={index} 
            type="button"
            className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

const homeText = {
  en: {
    kicker: 'Guidelines for Inland Saline Water Aquaculture in Rajasthan - 2026',
    title: 'Digital portal for Churu saline water shrimp farming.',
    intro:
      'A structured frontend experience for registration, licensing, site suitability, biosecurity, inspection, reporting, and traceability workflows under the Fisheries Department.',
    start: 'Start Registration',
    guidelines: 'View Guidelines',
    objectives: 'Objectives',
    objectiveTitle: 'Designed around regulation, sustainability, and farmer income.',
    flow: 'Registration Flow',
    flowTitle: 'From application to valid certificate.',
    species: 'Species Permitted',
    speciesTitle: 'Only approved shrimp species are supported in this portal.',
  },
  hi: {
    kicker: 'राजस्थान अंतर्देशीय लवणीय जल मत्स्य पालन दिशा-निर्देश - 2026',
    title: 'चूरू लवणीय जल झींगा पालन के लिए डिजिटल पोर्टल।',
    intro:
      'पंजीकरण, लाइसेंस, साइट उपयुक्तता, जैव-सुरक्षा, निरीक्षण, रिपोर्टिंग और ट्रेसबिलिटी के लिए मत्स्य विभाग आधारित फ्रंटेंड अनुभव।',
    start: 'पंजीकरण शुरू करें',
    guidelines: 'दिशा-निर्देश देखें',
    objectives: 'उद्देश्य',
    objectiveTitle: 'नियम, स्थिरता और किसान आय को ध्यान में रखकर बनाया गया।',
    flow: 'पंजीकरण प्रक्रिया',
    flowTitle: 'आवेदन से वैध प्रमाणपत्र तक।',
    species: 'अनुमत प्रजातियां',
    speciesTitle: 'इस पोर्टल में केवल स्वीकृत झींगा प्रजातियां समर्थित हैं।',
  },
}

function HomePage({ language = 'en', onNavigate }) {
  const text = homeText[language] || homeText.en

  return (
    <div className="page-stack">
      <section className="hero-section reveal">
        <div className="hero-copy">
          <p className="eyebrow">{text.kicker}</p>
          <h1>{text.title}</h1>
          <p>{text.intro}</p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => onNavigate('registration')}>{text.start}</button>
            <button type="button" className="secondary-btn" onClick={() => onNavigate('guidelines')}>{text.guidelines}</button>
          </div>
        </div>

        <HeroSlider />
      </section>

      <section className="metric-grid reveal delay-one">
        {highlights.map((item, index) => (
          <article className="metric-tile" key={index}>
            <span>{language === 'hi' ? item.labelHi : item.label}</span>
            <strong>{item.value}</strong>
            <p>{language === 'hi' ? item.detailHi : item.detail}</p>
          </article>
        ))}
      </section>

      <section className="split-section reveal delay-two">
        <div className="section-panel dark-panel">
          <p className="eyebrow">{text.objectives}</p>
          <h2>{text.objectiveTitle}</h2>
          <div className="objective-list">
            {objectives.map((objective, index) => (
              <article key={index}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{language === 'hi' ? objective.hi : objective.en}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel">
          <p className="eyebrow">{text.flow}</p>
          <h2>{text.flowTitle}</h2>
          <ol className="timeline-list">
            {timeline.map((step, index) => (
              <li key={index}>{language === 'hi' ? step.hi : step.en}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="species-section reveal">
        <div className="section-heading">
          <p className="eyebrow">{text.species}</p>
          <h2>{text.speciesTitle}</h2>
        </div>
        <div className="species-grid">
          {permittedSpecies.map((species) => (
            <article className="species-card" key={species.name}>
              <span className="species-icon">SPF</span>
              <h3>{species.name}</h3>
              <p>{language === 'hi' ? species.commonHi : species.common}</p>
              <strong>{language === 'hi' ? species.salinityHi : species.salinity}</strong>
              <small>{language === 'hi' ? species.noteHi : species.note}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
