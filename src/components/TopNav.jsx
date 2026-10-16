import { useState } from 'react'
import { navItems } from '../data/portalData'

function TopNav({ activePage, isAdmin, language, onLanguageChange, onLogout, onNavigate, onThemeChange, theme }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavigate = (page) => {
    onNavigate(page)
    setMenuOpen(false)
  }
  return (
    <>
      <div className="official-banners">
        <div className="banner-left">

           <img className="unique" src="\image\image1.jpeg" alt="National Fisheries Development Board" title="NFDB, Ministry of FAHD" />
          
         
        </div>
        <div className="banner-center">
          <img src="/image/satyamevjayte.png" alt="Department of Fisheries Rajasthan" title="मत्स्य विभाग, राजस्थान" />
        </div>
        <div className="banner-right">
           <img src="\image\image3.png" alt="Government of Rajasthan Seal" title="Government of Rajasthan" />
          <img src="\image\image.png" alt="Ministry of Fisheries, Animal Husbandry and Dairying" title="Ministry of FAHD, India" />
         
        </div>
      </div>
      <header className="top-nav">
        <button type="button" className="brand-lockup" onClick={() => handleNavigate('home')} aria-label="Go to home">
          
          <span>
         
            <small>{language === 'hi' ? 'चूरू लवणीय जल मत्स्य पालन' : 'Churu Saline Aquaculture'}</small>
          </span>
        </button>

        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {menuOpen && (
          <nav className="nav-links mobile-menu" aria-label="Primary navigation">
            {navItems
              .filter((item) => (item.id !== 'dashboard' || isAdmin) && item.id !== 'reports')
              .map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={activePage === item.id ? 'active' : ''}
                  onClick={() => handleNavigate(item.id)}
                >
                  {item.label[language] || item.label.en}
                </button>
              ))}
            <div className="mobile-menu-controls">
              <select
                className="header-select"
                aria-label="Select language"
                value={language}
                onChange={(event) => onLanguageChange(event.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
              <select
                className="header-select"
                aria-label="Select theme"
                value={theme}
                onChange={(event) => onThemeChange(event.target.value)}
              >
                <option value="light">Light</option>
               
                <option value="green">Green</option>
                <option value="sand">Sand</option>
              </select>
              {isAdmin ? (
                <button type="button" className="ghost-btn" onClick={onLogout}>{language === 'hi' ? 'लॉग आउट' : 'Logout'}</button>
              ) : (
                <button type="button" className="ghost-btn" onClick={() => handleNavigate('dashboard')}>{language === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</button>
              )}
              <button type="button" className="primary-btn" onClick={() => handleNavigate('registration')}>{language === 'hi' ? 'आवेदन करें' : 'Apply Now'}</button>
            </div>
          </nav>
        )}

        <nav className="nav-links desktop-menu" aria-label="Primary navigation">
          {navItems
            .filter((item) => (item.id !== 'dashboard' || isAdmin) && item.id !== 'reports')
            .map((item) => (
              <button
                type="button"
                key={item.id}
                className={activePage === item.id ? 'active' : ''}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label[language] || item.label.en}
              </button>
            ))}
        </nav>

        <div className="nav-cta desktop-cta">
          <select
            className="header-select"
            aria-label="Select language"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          <select
            className="header-select"
            aria-label="Select theme"
            value={theme}
            onChange={(event) => onThemeChange(event.target.value)}
          >
            <option value="light">Light</option>
        
            <option value="green">Green</option>
            <option value="sand">Sand</option>
          </select>
          {isAdmin ? (
            <button type="button" className="ghost-btn" onClick={onLogout}>{language === 'hi' ? 'लॉग आउट' : 'Logout'}</button>
          ) : (
            <button type="button" className="ghost-btn" onClick={() => handleNavigate('dashboard')}>{language === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</button>
          )}
          <button type="button" className="primary-btn" onClick={() => handleNavigate('registration')}>{language === 'hi' ? 'आवेदन करें' : 'Apply Now'}</button>
        </div>
      </header>
    </>
  )
}

export default TopNav
