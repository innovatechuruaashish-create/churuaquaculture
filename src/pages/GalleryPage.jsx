import { useState, useEffect } from 'react'

function Slider({ images = [], interval = 3000, ariaLabel }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timer)
  }, [images.length, interval])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="hero-slider-container" aria-label={ariaLabel}>
      <div
        className="hero-slider-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img decoding="async" key={index} src={src} alt={`${ariaLabel} ${index + 1}`} className="hero-slide-image" />
        ))}
      </div>
      <div className="slider-dots">
        {images.map((_, index) => (
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


const achievementsImages = [
      '/image/pic5.jpeg', 
    '/image/pic6.jpeg', 
    '/image/pic7.jpeg',
     '/image/pic8.jpeg', ]

    
const newsImages = [
  
    '/image/pic9.jpeg', 
    '/image/pic10.jpeg', 
    '/image/pic11.jpeg',
     '/image/pic12.jpeg',
     '/image/pic13.jpeg', 
    
    ]

function GalleryPage({ language = 'en', onNavigate }) {
  return (
    <div className="page-stack gallery-page">
      <section className="page-hero compact reveal">
        <div className="section-heading">
          <p className="eyebrow">{language === 'hi' ? 'गैलरी' : 'Gallery'}</p>
          <h1>{language === 'hi' ? 'गैलरी' : 'Gallery'}</h1>
        </div>

        <div className="split-section gallery-split">
          <div className="section-panel">
            <p className="eyebrow">{language === 'hi' ? 'उपलब्धियाँ' : 'Achievements'}</p>
            <h2>{language === 'hi' ? 'उपलब्धियाँ' : 'Achievements'}</h2>
            <Slider images={achievementsImages} interval={3500} ariaLabel="Achievements slider" />
          </div>

          <div className="section-panel">
            <p className="eyebrow">{language === 'hi' ? 'समाचार कटिंग्स' : 'News Cuttings'}</p>
            <h2>{language === 'hi' ? 'समाचार कटिंग्स' : 'News Cuttings'}</h2>
            <Slider images={newsImages} interval={3000} ariaLabel="News cuttings slider" />
          </div>
        </div>
      </section>
    </div>
  )
}

export default GalleryPage
