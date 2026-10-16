import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import './App.css'
import './responsive.css'
import './dashboard.css'
import './registration.css'
import './polish.css'
import AdminLogin from './components/AdminLogin'
import SiteFooter from './components/SiteFooter'
import TopNav from './components/TopNav'
import ExportProgress from './components/ExportProgress'
const CompliancePage = lazy(() => import('./pages/CompliancePage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const DevelopersPage = lazy(() => import('./pages/DevelopersPage'))
const GuidelinesPage = lazy(() => import('./pages/GuidelinesPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const API_URL = "https://backend-of-fisheries.onrender.com/api";
const pages = {
  home: HomePage,
  registration: RegistrationPage,
  gallery: GalleryPage,
  guidelines: GuidelinesPage,
  compliance: CompliancePage,
  contact: ContactPage,
  dashboard: DashboardPage,
  developers: DevelopersPage,
}

function getInitialPage() {
  const page = window.location.hash.replace('#', '')
  return pages[page] ? page : 'home'
}

function App() {
  const [activePage, setActivePage] = useState(getInitialPage)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en')
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true')
  const [applications, setApplications] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
const [toast, setToast] = useState(null);
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      setApplicationsLoading(true)
      const response = await fetch(`${API_URL}/admin/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setApplicationsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchApplications()
    }
  }, [isAdmin])
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const syncPage = () => setActivePage(getInitialPage())
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('isAdmin', String(isAdmin))
  }, [isAdmin])

  
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const Page = useMemo(() => pages[activePage] || HomePage, [activePage])

  function handleNavigate(page) {
    window.location.hash = page
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleApplicationSubmit(application) {
  try {

    const formData = new FormData();

    formData.append(
      "farmerName",
      application.applicant
    );

    formData.append(
      "fatherName",
      application.father
    );

    formData.append(
      "email",
      application.email
    );

    formData.append(
      "mobile",
      application.mobile
    );

    formData.append(
      "aadhaarNumber",
      "123456789012"
    );

    formData.append(
      "address",
      application.address
    );

    formData.append(
      "village",
      application.village
    );

    formData.append(
      "tehsil",
      application.tehsil
    );

    formData.append(
      "district",
      "Churu"
    );

    formData.append(
      "farmArea",
      application.area
    );

    formData.append(
      "pondCount",
      application.ponds
    );

    formData.append(
      "waterSource",
      application.waterSource
    );

    formData.append(
      "cultureType",
      application.species
    );

    const response = await fetch(
      `${API_URL}/application/create`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Submission Failed"
      );
    }

setToast({
  type: "success",
  message: `Application Submitted Successfully. Tracking Number: ${data.application.applicationNumber}`
});

setTimeout(() => {
  setToast(null);
}, 3000);

  } catch (error) {
setToast({
  type: "error",
  message: error.message
});

setTimeout(() => {
  setToast(null);
}, 3000);
  }
}
  async function handleStatusChange(id, action, remarks = "Updated by Admin") {
    try {
      const token = localStorage.getItem("token")
      if (!token) return false

      let endpoint = ""
      if (action === "Approved") endpoint = "approve"
      if (action === "Disapproved") endpoint = "reject"
      if (action === "Reverted") endpoint = "revert"
      if (!endpoint) return false

      const response = await fetch(
        `${API_URL}/admin/applications/${id}/${endpoint}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            remarks,
          }),
        }
      )

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Action failed")
      }

      await fetchApplications()
      setTimeout(() => {
        setToast(null)
      }, 3000)

      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async function handleForwardApplication(id, formData) {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`${API_URL}/application/${id}/forward`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to forward application")
      }

      await fetchApplications()

      return { success: true, data: data.application, message: data.message }
    } catch (error) {
      console.error("Forward application error:", error)
      return { success: false, message: error.message }
    }
  }

async function handleDeleteApplications(ids) {
  try {

    const token =
      localStorage.getItem("token");

    for (const id of ids) {

      const response =
        await fetch(
          `${API_URL}/application/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message
        );
      }
    }

    await fetchApplications();

    return true;

  } catch (error) {

    console.log(error);
    return false;

  }
}
  function handleLogout() {

  localStorage.removeItem("token");
  localStorage.removeItem("admin");
  localStorage.removeItem("isAdmin");

  setApplications([]);

  setIsAdmin(false);

  handleNavigate("home");
}
  const pageProps = {
    applications,
    applicationsLoading,
    isAdmin,
    language,
    onApplicationSubmit: handleApplicationSubmit,
    onNavigate: handleNavigate,
    onStatusChange: handleStatusChange,
    onDeleteApplications: handleDeleteApplications,
    onForwardApplication: handleForwardApplication,
    fetchApplications,
    notifications,
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          * {
            font-family: 'Poppins', sans-serif !important;
          }
          h1, h2, h3, h4, h5, h6 {
            line-height: 1.6 !important;
            margin-top: 12px !important;
            margin-bottom: 12px !important;
            margin-left: 5px !important;
            margin-right: 5px !important;
          }
          p, span, a, li, strong, small, label {
            margin: 5px !important;
          }
          body, html, #root {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden;
          }

          .section-panel.dark-panel, .section-panel.dark-panel * {
            color: #ffffff !important;
          }

          .site-shell, .page-stack, .top-nav, .mega-footer, .header-banner, .footer-inner {
            margin-left: 0 !important;
            margin-right: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .site-shell, .top-nav {
            padding: 0 !important;
          }
          .page-stack, .mega-footer, .footer-inner, .header-banner {
            padding: 10px !important;
          }
          .top-nav {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            flex-wrap: nowrap !important;
            position: relative !important;
          }
          .mobile-menu {
            position: absolute !important;
            top: 100% !important;
            right: 10px !important;
            background: #ffffff !important;
            border: 1px solid #ddd !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important;
            padding: 15px !important;
            z-index: 9999 !important;
            min-width: 220px !important;
            max-width: calc(100vw - 20px) !important;
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .mobile-menu button, .mobile-menu select {
            width: 100% !important;
            box-sizing: border-box !important;
            white-space: normal !important;
          }
          [data-theme="dark"] .mobile-menu {
            background: #1a1a1a !important;
            border-color: #333 !important;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
          }
          [data-theme="dark"] .top-nav, [data-theme="dark"] .top-nav button, [data-theme="dark"] .top-nav select, [data-theme="dark"] .top-nav span, [data-theme="dark"] .top-nav small, [data-theme="dark"] .top-nav strong {
            color: #ffffff !important;
          }
          [data-theme="dark"] .top-nav select option {
            background: #1a1a1a !important;
            color: #ffffff !important;
          }
          [data-theme="dark"] .top-nav button:not(.ghost-btn):not(.primary-btn):not(.brand-lockup):hover,
          [data-theme="dark"] .top-nav button:not(.ghost-btn):not(.primary-btn):not(.brand-lockup):hover *,
          [data-theme="dark"] .top-nav button.active,
          [data-theme="dark"] .top-nav button.active * {
            color: #000000 !important;
          }
          .officer-card, .metric-tile, .report-card, .section-panel, .rule-card, .species-card, .detail-card, .login-card, .premium-form, .sticky-card {
            width: calc(100% - 12px) !important;
            margin: 6px !important;
            padding: 5px !important;
            flex: 1 1 auto;
            box-sizing: border-box !important;
          }
          .header-banner {
            height: clamp(140px, 10vw, 280px) !important;
          }
          .header-banner img {
            width: auto !important;
            height: 180px !important;
            max-width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center !important;
          }
          .brand-logo {
            width: clamp(50px, 10vw, 100px) !important;
            height: clamp(50px, 10vw, 100px) !important;
            object-fit: contain !important;
            zoom: 1 !important;
          }
          .footer-brand img {
            width: clamp(60px, 15vw, 120px) !important;
            height: auto !important;
            object-fit: contain !important;
          }
          @media (max-width: 1024px) {
            .desktop-menu, .desktop-cta { display: none !important; }
            .hamburger-btn { display: block !important; font-size: 24px; font-weight: bold; padding: 0 10px; }
          }
          @media (min-width: 1025px) {
            .hamburger-btn, .mobile-menu { display: none !important; }
            .desktop-menu, .desktop-cta { display: flex !important; }
          }
        `}
      </style>
      <main className="site-shell" data-theme={theme}>
      <TopNav
        activePage={activePage}
        isAdmin={isAdmin}
        language={language}
        onLanguageChange={setLanguage}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onThemeChange={setTheme}
        theme={theme}
      />
      {activePage === 'dashboard' && !isAdmin ? (
        <div className="page-stack">
<AdminLogin
  onLogin={() => {
    setIsAdmin(true);
    handleNavigate("dashboard");
  }}
/>
        </div>
      ) : (
        <Suspense fallback={<div className="page-loader" role="status"><span className="page-loader-spinner" /><span>Loading...</span></div>}>
          <Page key={activePage} {...pageProps} />
        </Suspense>
      )}
      <SiteFooter onNavigate={handleNavigate} language={language} />
      <ExportProgress />
      </main>
    </>
  )
}

export default App
