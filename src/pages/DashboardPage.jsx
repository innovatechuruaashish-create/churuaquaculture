import { useState, useMemo, Fragment } from 'react'
import {
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  LayoutDashboard,
  FileSpreadsheet,
  Bell,
  Search,
  Filter,
  X,
  Eye,
  FileText,
  Upload,
  Calendar,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  MapPin,
  Maximize2,
  FileCheck,
  Menu,
  ChevronDown,
  Undo2
} from 'lucide-react'
import { exportCsv, exportPdf } from '../utils/exportApplications'
import DocumentViewerContent from '../components/DocumentViewerContent'

const API_URL = "https://backend-of-fisheries.onrender.com"

function StatusBadge({ status }) {
  const normStatus = (status || 'PENDING').toUpperCase()
  let className = 'status-badge'
  let label = normStatus

  switch (normStatus) {
    case 'PENDING':
      className += ' status-pending'
      label = 'PENDING'
      break
    case 'FORWARDED':
      className += ' status-forwarded'
      label = 'FORWARDED'
      break
    case 'REVERTED':
      className += ' status-reverted'
      label = 'REVERTED'
      break
    case 'APPROVED':
      className += ' status-approved'
      label = 'APPROVED'
      break
    case 'REJECTED':
      className += ' status-rejected'
      label = 'REJECTED'
      break
    default:
      className += ` ${normStatus.toLowerCase()}`
      label = normStatus
  }

  return <span className={className}>{label}</span>
}

function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return String(dateString)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return String(dateString)
  }
}

function formatDateTime(dateString) {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return String(dateString)
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(dateString)
  }
}

async function downloadPdf(applications, selectedIds = null) {
  const list = selectedIds && selectedIds.length > 0 ? applications.filter((app) => selectedIds.includes(app._id)) : applications
  if (!list.length) return false
  return exportPdf(list)
}

function downloadCsv(applications, selectedIds = null) {
  const list = selectedIds && selectedIds.length > 0 ? applications.filter((app) => selectedIds.includes(app._id)) : applications
  return exportCsv(list)
}

const docFields = [
  { key: "aadhaarCard", label: "Aadhaar Card", labelHi: "आधार कार्ड" },
  { key: "landOwnershipDocument", label: "Land Ownership Document", labelHi: "भूमि स्वामित्व दस्तावेज़" },
  { key: "patwariReport", label: "Patwari Report", labelHi: "पटवारी रिपोर्ट" },
  { key: "waterQualityTestReport", label: "Water Quality Report", labelHi: "जल गुणवत्ता रिपोर्ट" },
  { key: "pondPhotograph", label: "Pond Photograph", labelHi: "तालाब की तस्वीर" },
  { key: "farmerPhotograph", label: "Farmer Photograph", labelHi: "किसान की तस्वीर" },
  { key: "otherDocuments", label: "Other Documents", labelHi: "अन्य दस्तावेज़" }
]

function DashboardPage({
  applications = [],
  applicationsLoading = false,
  notifications = [],
  onStatusChange,
  onDeleteApplications,
  onForwardApplication,
  fetchApplications,
  language = 'en'
}) {
  const hi = language === 'hi'

  // Current active navigation tab: 'overview' | 'pending' | 'forwarded' | 'reverted' | 'approved' | 'all' | 'notifications'
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Modals & Viewers
  const [documentViewer, setDocumentViewer] = useState(null)
  const [detailApplication, setDetailApplication] = useState(null)
  const [forwardModalApp, setForwardModalApp] = useState(null)

  // Multi-select & Export
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [exportMode, setExportMode] = useState(false)

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')

  // Feedback Toast inside Dashboard
  const [localFeedback, setLocalFeedback] = useState(null)

  // Forward form state
  const [forwardForm, setForwardForm] = useState({
    letterNumber: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
    file: null
  })
  const [forwardLoading, setForwardLoading] = useState(false)
  const [forwardError, setForwardError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Export dialog (CSV / PDF with selection)
  const [exportDialog, setExportDialog] = useState(null) // { list, title, preselect }
  const [exportSelection, setExportSelection] = useState(new Set())
  const [exportFormat, setExportFormat] = useState('pdf')
  const [exportSearch, setExportSearch] = useState('')
  const [exportBusy, setExportBusy] = useState(false)
  const [detailExportOpen, setDetailExportOpen] = useState(false)

  // Revert / cancel modal
  const [revertModalApp, setRevertModalApp] = useState(null)
  const [revertRemarks, setRevertRemarks] = useState('')
  const [revertError, setRevertError] = useState('')
  const [revertLoading, setRevertLoading] = useState(false)

  function showFeedback(type, message) {
    setLocalFeedback({ type, message })
    setTimeout(() => {
      setLocalFeedback(null)
    }, 4500)
  }

  function resolveDocUrl(value) {
    if (!value) return null
    const trimmed = String(value).trim()
    if (!trimmed) return null
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    if (trimmed.startsWith('/')) return `${API_URL}${trimmed}`
    return `${API_URL}/uploads/${trimmed}`
  }

  function getDocValue(application, key) {
    if (!application) return null
    return (
      application.documents?.[key] ||
      application[key] ||
      application.farmer?.[key] ||
      application.farm?.[key] ||
      null
    )
  }

  // Live counts calculated directly from applications data
  const counts = useMemo(() => {
    let pending = 0
    let forwarded = 0
    let reverted = 0
    let approved = 0
    let rejected = 0

    applications.forEach((app) => {
      const s = (app.status || 'PENDING').toUpperCase()
      if (s === 'PENDING') pending++
      else if (s === 'FORWARDED') forwarded++
      else if (s === 'REVERTED') reverted++
      else if (s === 'APPROVED') approved++
      else if (s === 'REJECTED') rejected++
    })

    return {
      pending,
      forwarded,
      reverted,
      approved,
      rejected,
      total: applications.length
    }
  }, [applications])

  // Extract unique districts for filter
  const districts = useMemo(() => {
    const set = new Set()
    applications.forEach((app) => {
      if (app.farmer?.district) set.add(app.farmer.district)
    })
    return Array.from(set).sort()
  }, [applications])

  // Filter application helper
  const filterApplicationList = (list) => {
    return list.filter((app) => {
      // Search term matching: applicationNumber, farmerName, mobile, village
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const appNo = (app.applicationNumber || '').toLowerCase()
        const name = (app.farmer?.farmerName || app.applicant || '').toLowerCase()
        const mobile = (app.farmer?.mobile || '').toLowerCase()
        const village = (app.farmer?.village || '').toLowerCase()
        const matchesSearch =
          appNo.includes(query) ||
          name.includes(query) ||
          mobile.includes(query) ||
          village.includes(query)
        if (!matchesSearch) return false
      }

      // District filter
      if (selectedDistrict !== 'ALL') {
        const appDistrict = (app.farmer?.district || 'Churu').toUpperCase()
        if (appDistrict !== selectedDistrict.toUpperCase()) return false
      }

      // Date filter
      if (dateFilter !== 'ALL' && app.createdAt) {
        const appDate = new Date(app.createdAt)
        const now = new Date()
        if (dateFilter === 'TODAY') {
          const isToday =
            appDate.getDate() === now.getDate() &&
            appDate.getMonth() === now.getMonth() &&
            appDate.getFullYear() === now.getFullYear()
          if (!isToday) return false
        } else if (dateFilter === '7DAYS') {
          const diffDays = (now - appDate) / (1000 * 60 * 60 * 24)
          if (diffDays > 7) return false
        } else if (dateFilter === '30DAYS') {
          const diffDays = (now - appDate) / (1000 * 60 * 60 * 24)
          if (diffDays > 30) return false
        }
      }

      return true
    })
  }

  // Segmented lists based on exact backend status strings
  const pendingApplications = useMemo(
    () => applications.filter((app) => (app.status || 'PENDING').toUpperCase() === 'PENDING'),
    [applications]
  )

  const forwardedApplications = useMemo(
    () => applications.filter((app) => (app.status || '').toUpperCase() === 'FORWARDED'),
    [applications]
  )

  const revertedApplications = useMemo(
    () => applications.filter((app) => (app.status || '').toUpperCase() === 'REVERTED'),
    [applications]
  )

  const approvedApplications = useMemo(
    () => applications.filter((app) => (app.status || '').toUpperCase() === 'APPROVED'),
    [applications]
  )

  // Filtered lists for the active views
  const filteredPending = useMemo(() => filterApplicationList(pendingApplications), [pendingApplications, searchTerm, selectedDistrict, dateFilter])
  const filteredForwarded = useMemo(() => filterApplicationList(forwardedApplications), [forwardedApplications, searchTerm, selectedDistrict, dateFilter])
  const filteredReverted = useMemo(() => filterApplicationList(revertedApplications), [revertedApplications, searchTerm, selectedDistrict, dateFilter])
  const filteredApproved = useMemo(() => filterApplicationList(approvedApplications), [approvedApplications, searchTerm, selectedDistrict, dateFilter])
  const filteredAll = useMemo(() => filterApplicationList(applications), [applications, searchTerm, selectedDistrict, dateFilter])

  // Multi select toggle
  function toggleSelect(id) {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  function toggleSelectAll(currentList) {
    if (selectedIds.size === currentList.length && currentList.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentList.map((app) => app._id)))
    }
  }

  // Open Forward Recommendation Modal
  function openForwardModal(app) {
    setForwardModalApp(app)
    setForwardError('')
    setForwardForm({
      letterNumber: `DFO/CHURU/AQUA/${new Date().getFullYear()}/${app.applicationNumber ? app.applicationNumber.slice(-4) : 'REC'}`,
      date: new Date().toISOString().split('T')[0],
      remarks: app.status === 'REVERTED'
        ? `Clarification provided following Super Admin review. Verified farm and documentation for ${app.farmer?.farmerName || 'applicant'}. Recommended for approval.`
        : `Site inspection and document scrutiny completed. Recommended for Churu saline aquaculture registration.`,
      file: null
    })
  }

  // Handle Forward Form Submit
  async function handleForwardSubmit(e) {
    e.preventDefault()
    if (!forwardModalApp) return

    if (!forwardForm.file) {
      setForwardError(hi ? 'कृपया अनुशंसा पत्र (PDF) अपलोड करें।' : 'Please upload Recommendation Letter (PDF).')
      return
    }

    try {
      setForwardLoading(true)
      setForwardError('')

      const formData = new FormData()
      formData.append('recommendationLetter', forwardForm.file)
      formData.append('letterNumber', forwardForm.letterNumber)
      formData.append('date', forwardForm.date)
      formData.append('remarks', forwardForm.remarks)

      let res
      if (typeof onForwardApplication === 'function') {
        res = await onForwardApplication(forwardModalApp._id, formData)
      } else {
        const token = localStorage.getItem('token')
        const rawRes = await fetch(`${API_URL}/api/application/${forwardModalApp._id}/forward`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: formData
        })
        const data = await rawRes.json()
        if (!rawRes.ok || !data.success) {
          throw new Error(data.message || 'Failed to forward application')
        }
        if (typeof fetchApplications === 'function') {
          await fetchApplications()
        }
        res = { success: true, data: data.application }
      }

      if (res && res.success) {
        showFeedback(
          'success',
          hi
            ? `आवेदन ${forwardModalApp.applicationNumber} सफलतापूर्वक उच्चाधिकारी (Super Admin) को अग्रेषित किया गया।`
            : `Application ${forwardModalApp.applicationNumber} forwarded to Super Admin successfully.`
        )

        // Close modals and update detail application if currently viewing
        const updatedApp = res.data || {
          ...forwardModalApp,
          status: 'FORWARDED',
          remarks: forwardForm.remarks
        }

        if (detailApplication && detailApplication._id === forwardModalApp._id) {
          setDetailApplication(updatedApp)
        }

        setForwardModalApp(null)
      } else {
        throw new Error(res?.message || 'Forward action failed')
      }
    } catch (err) {
      console.error(err)
      setForwardError(err.message || (hi ? 'अग्रेषित करने में त्रुटि हुई।' : 'Error forwarding application.'))
    } finally {
      setForwardLoading(false)
    }
  }

  // ---------------------------------------------------
  // Export helpers
  // ---------------------------------------------------
  function openExportDialog(list, title, preselect = []) {
    setExportDialog({ list, title })
    setExportSelection(new Set(preselect))
    setExportSearch('')
    setExportFormat('pdf')
  }

  function closeExportDialog() {
    if (exportBusy) return
    setExportDialog(null)
  }

  function toggleExportItem(id) {
    setExportSelection((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function runExport(format, list) {
    if (!list.length) return
    try {
      setExportBusy(true)
      if (format === 'csv') {
        exportCsv(list)
      } else {
        await exportPdf(list)
      }
      showFeedback(
        'success',
        hi
          ? `${list.length} आवेदन ${format.toUpperCase()} में निर्यात किए गए।`
          : `${list.length} application${list.length > 1 ? 's' : ''} exported as ${format.toUpperCase()}.`
      )
    } catch (err) {
      console.error(err)
      showFeedback('error', hi ? 'निर्यात विफल रहा। कृपया पुनः प्रयास करें।' : 'Export failed. Please try again.')
    } finally {
      setExportBusy(false)
    }
  }

  async function handleExportConfirm() {
    if (!exportDialog) return
    const chosen = exportDialog.list.filter((app) => exportSelection.has(app._id))
    if (!chosen.length) return
    await runExport(exportFormat, chosen)
    setExportDialog(null)
  }

  // ---------------------------------------------------
  // Revert / cancel (admin)
  // ---------------------------------------------------
  function openRevertModal(app) {
    setRevertModalApp(app)
    setRevertRemarks('')
    setRevertError('')
  }

  async function handleRevertSubmit(e) {
    e.preventDefault()
    if (!revertModalApp) return
    if (!revertRemarks.trim()) {
      setRevertError(hi ? 'कृपया लौटाने का कारण लिखें।' : 'Please enter a reason for reverting this application.')
      return
    }
    try {
      setRevertLoading(true)
      setRevertError('')
      const ok = typeof onStatusChange === 'function'
        ? await onStatusChange(revertModalApp._id, 'Reverted', revertRemarks.trim())
        : false
      if (!ok) throw new Error(hi ? 'आवेदन लौटाने में त्रुटि हुई।' : 'Could not revert the application. Please try again.')
      showFeedback(
        'success',
        hi
          ? `आवेदन ${revertModalApp.applicationNumber} सुधार हेतु लौटाया गया।`
          : `Application ${revertModalApp.applicationNumber} has been reverted.`
      )
      if (detailApplication && detailApplication._id === revertModalApp._id) {
        setDetailApplication(null)
      }
      setRevertModalApp(null)
    } catch (err) {
      setRevertError(err.message)
    } finally {
      setRevertLoading(false)
    }
  }

  // Manual refresh handler
  async function handleRefresh() {
    if (typeof fetchApplications === 'function') {
      setIsRefreshing(true)
      await fetchApplications()
      setIsRefreshing(false)
      showFeedback('info', hi ? 'डेटा ताज़ा किया गया।' : 'Application records refreshed.')
    }
  }

  // Render Document Action button helper
  function renderDocButton(application, key, label) {
    const value = getDocValue(application, key)
    const url = resolveDocUrl(value)

    if (!url) {
      return <span className="doc-missing">{hi ? 'अनुपलब्ध' : 'Not Uploaded'}</span>
    }

    return (
      <button
        type="button"
        className="doc-view-pill"
        onClick={(e) => {
          e.stopPropagation()
          setDocumentViewer({
            url,
            label,
            applicationNumber: application.applicationNumber
          })
        }}
      >
        <FileText size={14} />
        <span>{label}</span>
      </button>
    )
  }

  // Navigation Items with Icons & live dynamic badges
  const navItemsList = [
    {
      id: 'overview',
      label: hi ? 'डैशबोर्ड अवलोकन' : 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'pending',
      label: hi ? 'लंबित आवेदन' : 'Pending',
      icon: Clock,
      badge: counts.pending,
      badgeClass: 'badge-pending'
    },
    {
      id: 'forwarded',
      label: hi ? 'उच्चाधिकारी को अग्रेषित' : 'Forwarded',
      icon: Send,
      badge: counts.forwarded,
      badgeClass: 'badge-forwarded'
    },
    {
      id: 'reverted',
      label: hi ? 'पुनर्विचार हेतु प्राप्त' : 'Reverted',
      icon: RotateCcw,
      badge: counts.reverted,
      badgeClass: 'badge-reverted'
    },
    {
      id: 'approved',
      label: hi ? 'स्वीकृत आवेदन' : 'Approved',
      icon: CheckCircle2,
      badge: counts.approved,
      badgeClass: 'badge-approved'
    },
    {
      id: 'all',
      label: hi ? 'सभी रिकॉर्ड एवं निर्यात' : 'All Records & Export',
      icon: FileSpreadsheet,
      badge: counts.total,
      badgeClass: 'badge-neutral'
    },
    {
      id: 'notifications',
      label: hi ? 'सूचनाएं' : 'Notifications',
      icon: Bell,
      badge: notifications.length > 0 ? notifications.length : null,
      badgeClass: 'badge-neutral'
    }
  ]

  const renderExportButton = (list, title) => (
    <button
      type="button"
      className="ghost-btn export-section-btn"
      onClick={() => openExportDialog(list, title)}
      disabled={list.length === 0}
      title={hi ? 'CSV / PDF निर्यात' : 'Export as CSV or PDF'}
    >
      <Download size={15} />
      <span>{hi ? 'निर्यात' : 'Export'}</span>
      <ChevronDown size={13} />
    </button>
  )

  // Render Search and Filters Component
  const renderFilterBar = (currentCount, totalCount) => (
    <div className="admin-filter-bar">
      <div className="search-input-wrap">
        <Search size={17} className="search-icon" />
        <input
          type="text"
          placeholder={hi ? "आवेदन संख्या, किसान का नाम, मोबाइल..." : "Search by App Number, Farmer Name, Mobile, Village..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchTerm('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="filter-controls-group">
        <div className="filter-select-wrap">
          <Filter size={15} className="select-icon" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="admin-filter-select"
            aria-label="Filter by District"
          >
            <option value="ALL">{hi ? "सभी जिले (All Districts)" : "All Districts"}</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="filter-select-wrap">
          <Calendar size={15} className="select-icon" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="admin-filter-select"
            aria-label="Filter by Date"
          >
            <option value="ALL">{hi ? "सभी समय (All Time)" : "All Time"}</option>
            <option value="TODAY">{hi ? "आज के आवेदन (Today)" : "Today"}</option>
            <option value="7DAYS">{hi ? "पिछले 7 दिन (Last 7 Days)" : "Last 7 Days"}</option>
            <option value="30DAYS">{hi ? "पिछले 30 दिन (Last 30 Days)" : "Last 30 Days"}</option>
          </select>
        </div>

        {(searchTerm || selectedDistrict !== 'ALL' || dateFilter !== 'ALL') && (
          <button
            type="button"
            className="reset-filter-btn"
            onClick={() => {
              setSearchTerm('')
              setSelectedDistrict('ALL')
              setDateFilter('ALL')
            }}
          >
            <X size={13} />
            <span>{hi ? 'रीसेट' : 'Reset'}</span>
          </button>
        )}
      </div>

      <div className="results-counter">
        <span>
          {hi ? `दिखाए गए: ${currentCount} / ${totalCount}` : `Showing ${currentCount} of ${totalCount}`}
        </span>
      </div>
    </div>
  )

  return (
    <div className="admin-dashboard-container">
      {/* Toast Feedback Notification */}
      {localFeedback && (
        <div className={`admin-toast-banner ${localFeedback.type}`}>
          <div className="toast-content">
            {localFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{localFeedback.message}</span>
          </div>
          <button type="button" onClick={() => setLocalFeedback(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero / Header Banner */}
      <section className="page-hero compact reveal admin-header-hero">
        <div className="hero-content-row">
          <div>
            <p className="eyebrow">{hi ? 'जिला मत्स्य अधिकारी डेस्क — चूरू' : 'District Fishery Officer Desk — Churu'}</p>
            <h1>{hi ? 'मत्स्य पालन आवेदन एवं अनुमोदन प्रबंधन' : 'Fisheries Application & Approval Workflow'}</h1>
            <p>{hi ? 'चूरू लवणीय जल मत्स्य पालन क्लस्टर पंजीकरण, सत्यापन एवं अग्रेषण कार्यक्षेत्र।' : 'Official workspace for inland saline aquaculture registration scrutiny, recommendation & dispatch.'}</p>
          </div>
          <div className="hero-action-buttons">
            <button
              type="button"
              className={`ghost-btn refresh-btn ${isRefreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              title="Refresh Data"
            >
              <RefreshCw size={15} />
              <span>{hi ? 'ताज़ा करें' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              className="primary-btn export-quick-btn"
              onClick={() => openExportDialog(applications, hi ? 'निर्यात हेतु आवेदक चुनें' : 'Select applicants to export')}
              disabled={applications.length === 0}
            >
              <Download size={15} />
              <span>{hi ? 'निर्यात (CSV / PDF)' : 'Export (CSV / PDF)'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Two-Column Admin Layout */}
      <div className="admin-layout-wrapper">
        {/* Mobile Navigation Toggle */}
        <div className="admin-mobile-nav-toggle">
          <button
            type="button"
            className="mobile-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={18} />
            <span>
              {navItemsList.find((n) => n.id === activeTab)?.label || 'Navigation'}
            </span>
            {counts[activeTab] !== undefined && counts[activeTab] > 0 && (
              <span className="nav-badge-pill">{counts[activeTab]}</span>
            )}
          </button>
        </div>

        {/* Admin Navigation Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-badge-title">
              <ShieldCheck size={20} className="shield-icon" />
              <div>
                <strong>{hi ? 'अधिकारी डेस्क' : 'Admin Portal'}</strong>
                <small>{hi ? 'चूरू मत्स्य विभाग' : 'DFO Churu Office'}</small>
              </div>
            </div>
          </div>

          <div className="sidebar-section-label">{hi ? 'मुख्य पृष्ठ' : 'MAIN MENU'}</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview')
                setSidebarOpen(false)
              }}
            >
              <LayoutDashboard size={18} />
              <span>{hi ? 'डैशबोर्ड अवलोकन' : 'Dashboard Overview'}</span>
            </button>
          </nav>

          <div className="sidebar-section-label">{hi ? 'आवेदन अनुभाग' : 'APPLICATIONS'}</div>
          <nav className="sidebar-nav">
            {/* 1. Pending */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('pending')
                setSidebarOpen(false)
              }}
            >
              <Clock size={18} className="icon-pending" />
              <span className="nav-label">{hi ? 'लंबित आवेदन' : 'Pending'}</span>
              <span className="sidebar-count badge-pending">{counts.pending}</span>
            </button>

            {/* 2. Forwarded */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'forwarded' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('forwarded')
                setSidebarOpen(false)
              }}
            >
              <Send size={18} className="icon-forwarded" />
              <span className="nav-label">{hi ? 'उच्चाधिकारी को अग्रेषित' : 'Forwarded'}</span>
              <span className="sidebar-count badge-forwarded">{counts.forwarded}</span>
            </button>

            {/* 3. Reverted */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'reverted' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('reverted')
                setSidebarOpen(false)
              }}
            >
              <RotateCcw size={18} className="icon-reverted" />
              <span className="nav-label">{hi ? 'पुनर्विचार हेतु प्राप्त' : 'Reverted'}</span>
              <span className="sidebar-count badge-reverted">{counts.reverted}</span>
            </button>

            {/* 4. Approved */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('approved')
                setSidebarOpen(false)
              }}
            >
              <CheckCircle2 size={18} className="icon-approved" />
              <span className="nav-label">{hi ? 'स्वीकृत आवेदन' : 'Approved'}</span>
              <span className="sidebar-count badge-approved">{counts.approved}</span>
            </button>
          </nav>

          <div className="sidebar-section-label">{hi ? 'प्रबंधन एवं लॉग' : 'MANAGEMENT'}</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('all')
                setSidebarOpen(false)
              }}
            >
              <FileSpreadsheet size={18} />
              <span className="nav-label">{hi ? 'सभी रिकॉर्ड एवं निर्यात' : 'All Records & Export'}</span>
              <span className="sidebar-count badge-neutral">{counts.total}</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('notifications')
                setSidebarOpen(false)
              }}
            >
              <Bell size={18} />
              <span className="nav-label">{hi ? 'सूचनाएं (Logs)' : 'Notifications'}</span>
              {notifications.length > 0 && (
                <span className="sidebar-count badge-neutral">{notifications.length}</span>
              )}
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="status-indicator-dot online" />
            <span>{hi ? 'सर्वर कनेक्टेड' : 'System Connected'}</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`admin-main-panel ${applicationsLoading && applications.length === 0 ? 'is-loading' : ''}`}>
          {applicationsLoading && applications.length === 0 && (
            <div className="panel-loader" role="status">
              <RefreshCw size={22} className="spinning" />
              <span>{hi ? 'आवेदन लोड हो रहे हैं...' : 'Loading applications...'}</span>
            </div>
          )}
          {/* ===================================================
              TAB 1: DASHBOARD OVERVIEW
              =================================================== */}
          {activeTab === 'overview' && (
            <div className="dashboard-tab-content">
              {/* 4 Status Metric Cards */}
              <section className="officer-grid reveal">
                {/* 1. Pending StatCard */}
                <article
                  className="officer-card stat-interactive stat-card-pending"
                  onClick={() => setActiveTab('pending')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-card-top">
                    <span>{hi ? 'समीक्षा हेतु लंबित' : 'Pending Review'}</span>
                    <Clock size={20} className="icon-pending" />
                  </div>
                  <strong>{counts.pending}</strong>
                  <p>{hi ? 'नए जमा किए गए आवेदन जांच व अग्रेषण की प्रतीक्षा में हैं।' : 'Submitted applications awaiting scrutiny & recommendation.'}</p>
                  <div className="stat-card-footer">
                    <span>{hi ? 'लंबित सूची देखें' : 'View Pending Queue'}</span>
                    <ChevronRight size={16} />
                  </div>
                </article>

                {/* 2. Forwarded StatCard */}
                <article
                  className="officer-card stat-interactive stat-card-forwarded"
                  onClick={() => setActiveTab('forwarded')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-card-top">
                    <span>{hi ? 'उच्चाधिकारी को अग्रेषित' : 'Forwarded'}</span>
                    <Send size={20} className="icon-forwarded" />
                  </div>
                  <strong>{counts.forwarded}</strong>
                  <p>{hi ? 'अनुशंसा पत्र सहित सुपर एडमिन को भेजे गए आवेदन।' : 'Applications forwarded with recommendation letter to Super Admin.'}</p>
                  <div className="stat-card-footer">
                    <span>{hi ? 'अग्रेषित सूची देखें' : 'View Forwarded List'}</span>
                    <ChevronRight size={16} />
                  </div>
                </article>

                {/* 3. Reverted StatCard */}
                <article
                  className="officer-card stat-interactive stat-card-reverted"
                  onClick={() => setActiveTab('reverted')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-card-top">
                    <span>{hi ? 'सुधार हेतु लौटाए गए' : 'Reverted'}</span>
                    <RotateCcw size={20} className="icon-reverted" />
                  </div>
                  <strong>{counts.reverted}</strong>
                  <p>{hi ? 'सुपर एडमिन द्वारा स्पष्टीकरण/सुधार हेतु वापस भेजे गए।' : 'Applications returned by Super Admin for correction.'}</p>
                  <div className="stat-card-footer">
                    <span>{hi ? 'पुनर्विचार सूची देखें' : 'View Reverted List'}</span>
                    <ChevronRight size={16} />
                  </div>
                </article>

                {/* 4. Approved StatCard */}
                <article
                  className="officer-card stat-interactive stat-card-approved"
                  onClick={() => setActiveTab('approved')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-card-top">
                    <span>{hi ? 'स्वीकृत पंजीकरण' : 'Approved'}</span>
                    <CheckCircle2 size={20} className="icon-approved" />
                  </div>
                  <strong>{counts.approved}</strong>
                  <p>{hi ? 'सुपर एडमिन द्वारा आधिकारिक रूप से स्वीकृत आवेदन।' : 'Sanctioned registrations approved by Super Admin.'}</p>
                  <div className="stat-card-footer">
                    <span>{hi ? 'स्वीकृत सूची देखें' : 'View Approved List'}</span>
                    <ChevronRight size={16} />
                  </div>
                </article>
              </section>

              {/* Quick Action Navigation Grid */}
              <section className="records-panel reveal">
                <div className="records-heading">
                  <div>
                    <p className="eyebrow">{hi ? 'त्वरित अनुभाग नेविगेशन' : 'Section Navigation'}</p>
                    <h2>{hi ? 'आवेदन स्थिति प्रबंधन' : 'Application Status Management'}</h2>
                  </div>
                </div>
                <div className="status-flow-banner">
                  <div className="flow-step" onClick={() => setActiveTab('pending')}>
                    <div className="flow-icon-circle pending-bg">
                      <Clock size={18} />
                    </div>
                    <div className="flow-text">
                      <strong>1. PENDING</strong>
                      <small>{counts.pending} {hi ? 'समीक्षा हेतु' : 'Awaiting Review'}</small>
                    </div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step" onClick={() => setActiveTab('forwarded')}>
                    <div className="flow-icon-circle forwarded-bg">
                      <Send size={18} />
                    </div>
                    <div className="flow-text">
                      <strong>2. FORWARDED</strong>
                      <small>{counts.forwarded} {hi ? 'उच्चाधिकारी स्तर पर' : 'With Super Admin'}</small>
                    </div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step" onClick={() => setActiveTab('reverted')}>
                    <div className="flow-icon-circle reverted-bg">
                      <RotateCcw size={18} />
                    </div>
                    <div className="flow-text">
                      <strong>3. REVERTED</strong>
                      <small>{counts.reverted} {hi ? 'पुनर्विचार हेतु' : 'Needs Action'}</small>
                    </div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step" onClick={() => setActiveTab('approved')}>
                    <div className="flow-icon-circle approved-bg">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="flow-text">
                      <strong>4. APPROVED</strong>
                      <small>{counts.approved} {hi ? 'अंतिम स्वीकृत' : 'Final Approved'}</small>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Applications Live Queue */}
              <section className="records-panel reveal">
                <div className="records-heading">
                  <div>
                    <p className="eyebrow">{hi ? 'हालिया गतिविधियां' : 'Live Queue'}</p>
                    <h2>{hi ? 'नवीनतम चूरू आवेदन' : 'Recent Applications'}</h2>
                  </div>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setActiveTab('pending')}
                  >
                    <span>{hi ? 'सभी लंबित देखें' : 'View Pending Queue'}</span>
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>{hi ? 'आवेदन संख्या' : 'Application Number'}</th>
                        <th>{hi ? 'किसान का नाम' : 'Farmer Name'}</th>
                        <th>{hi ? 'जिला / गांव' : 'District / Village'}</th>
                        <th>{hi ? 'क्षेत्र (ha)' : 'Farm Area'}</th>
                        <th>{hi ? 'दिनांक' : 'Date'}</th>
                        <th>{hi ? 'स्थिति' : 'Status'}</th>
                        <th style={{ textAlign: 'right' }}>{hi ? 'कार्रवाई' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 8).map((app) => (
                        <tr key={app._id || app.applicationNumber}>
                          <td>
                            <strong className="app-id-text">{app.applicationNumber}</strong>
                          </td>
                          <td>
                            <div className="farmer-name-cell">
                              <span>{app.farmer?.farmerName || app.applicant || '-'}</span>
                              <small>{app.farmer?.mobile || ''}</small>
                            </div>
                          </td>
                          <td>{app.farmer?.village ? `${app.farmer.village}, ` : ''}{app.farmer?.district || 'Churu'}</td>
                          <td>{app.farm?.farmArea ? `${app.farm.farmArea} ha` : '-'}</td>
                          <td>{formatDate(app.createdAt)}</td>
                          <td><StatusBadge status={app.status} /></td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-inline">
                              <button
                                type="button"
                                className="ghost-btn btn-xs"
                                onClick={() => setDetailApplication(app)}
                              >
                                <Eye size={13} />
                                <span>{hi ? 'विवरण' : 'View'}</span>
                              </button>
                              {(app.status === 'PENDING' || !app.status) && (
                                <button
                                  type="button"
                                  className="primary-btn btn-xs"
                                  onClick={() => openForwardModal(app)}
                                >
                                  <Send size={13} />
                                  <span>{hi ? 'अग्रेषित करें' : 'Forward'}</span>
                                </button>
                              )}
                              {(app.status === 'PENDING' || app.status === 'FORWARDED' || !app.status) && (
                                <button
                                  type="button"
                                  className="secondary-btn btn-xs btn-revert-action"
                                  onClick={() => openRevertModal(app)}
                                >
                                  <Undo2 size={13} />
                                  <span>{hi ? 'वापस करें' : 'Revert'}</span>
                                </button>
                              )}
                              {app.status === 'REVERTED' && (
                                <button
                                  type="button"
                                  className="secondary-btn btn-xs btn-revert-action"
                                  onClick={() => openForwardModal(app)}
                                >
                                  <RotateCcw size={13} />
                                  <span>{hi ? 'पुनः अग्रेषित' : 'Forward Again'}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan="7" className="empty-table-cell">
                            {hi ? 'कोई आवेदन रिकॉर्ड उपलब्ध नहीं है।' : 'No applications available in database.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ===================================================
              SECTION 1: PENDING APPLICATIONS
              =================================================== */}
          {activeTab === 'pending' && (
            <section className="records-panel reveal">
              <div className="records-heading">
                <div>
                  <div className="section-title-badge pending-badge-header">
                    <Clock size={16} />
                    <span>{hi ? 'लंबित आवेदन अनुभाग' : 'Pending Applications'}</span>
                  </div>
                  <h2>{hi ? `समीक्षा हेतु लंबित आवेदन (${filteredPending.length})` : `Pending Applications (${filteredPending.length})`}</h2>
                  <p className="section-desc">
                    {hi
                      ? 'नए प्रस्तुत आवेदन जिनकी जिला मत्स्य अधिकारी द्वारा जांच एवं अनुशंसा पत्र अग्रेषण अपेक्षित है।'
                      : 'Newly submitted applications awaiting officer verification and recommendation letter forward to Super Admin.'}
                  </p>
                </div>
                {renderExportButton(filteredPending, 'Pending Applications')}
              </div>

              {renderFilterBar(filteredPending.length, pendingApplications.length)}

              <div className="table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>{hi ? 'आवेदन संख्या' : 'Application Number'}</th>
                      <th>{hi ? 'किसान का नाम' : 'Farmer Name'}</th>
                      <th>{hi ? 'जिला' : 'District'}</th>
                      <th>{hi ? 'खेत क्षेत्र' : 'Farm Area'}</th>
                      <th>{hi ? 'जमा दिनांक' : 'Submitted Date'}</th>
                      <th>{hi ? 'स्थिति' : 'Status'}</th>
                      <th style={{ textAlign: 'right' }}>{hi ? 'कार्रवाई' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPending.map((app) => (
                      <tr key={app._id || app.applicationNumber}>
                        <td>
                          <strong className="app-id-text">{app.applicationNumber}</strong>
                        </td>
                        <td>
                          <div className="farmer-name-cell">
                            <span className="farmer-main-name">{app.farmer?.farmerName || app.applicant || '-'}</span>
                            <small>{app.farmer?.mobile || app.farmer?.email || ''}</small>
                          </div>
                        </td>
                        <td>{app.farmer?.district || 'Churu'}</td>
                        <td>{app.farm?.farmArea ? `${app.farm.farmArea} ha` : '-'}</td>
                        <td>{formatDate(app.createdAt)}</td>
                        <td>
                          <StatusBadge status="PENDING" />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions-inline">
                            <button
                              type="button"
                              className="ghost-btn btn-sm"
                              onClick={() => setDetailApplication(app)}
                              title="View Application Details"
                            >
                              <Eye size={14} />
                              <span>{hi ? 'देखें' : 'View'}</span>
                            </button>
                            <button
                              type="button"
                              className="ghost-btn btn-sm review-btn"
                              onClick={() => setDetailApplication(app)}
                              title="Review Application"
                            >
                              <FileCheck size={14} />
                              <span>{hi ? 'समीक्षा' : 'Review'}</span>
                            </button>
                            <button
                              type="button"
                              className="primary-btn btn-sm"
                              onClick={() => openForwardModal(app)}
                              title="Forward Application to Super Admin"
                            >
                              <Send size={14} />
                              <span>{hi ? 'अग्रेषित करें' : 'Forward'}</span>
                            </button>
                            <button
                              type="button"
                              className="secondary-btn btn-sm btn-revert-action"
                              onClick={() => openRevertModal(app)}
                              title="Revert / Cancel this application"
                            >
                              <Undo2 size={14} />
                              <span>{hi ? 'वापस करें' : 'Revert'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPending.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table-cell">
                          <Clock size={32} className="empty-icon" />
                          <p>{hi ? 'वर्तमान में कोई लंबित आवेदन नहीं हैं।' : 'No pending applications matching your criteria.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================================================
              SECTION 2: FORWARDED APPLICATIONS
              =================================================== */}
          {activeTab === 'forwarded' && (
            <section className="records-panel reveal">
              <div className="records-heading">
                <div>
                  <div className="section-title-badge forwarded-badge-header">
                    <Send size={16} />
                    <span>{hi ? 'अग्रेषित आवेदन अनुभाग' : 'Forwarded Applications'}</span>
                  </div>
                  <h2>{hi ? `उच्चाधिकारी को अग्रेषित आवेदन (${filteredForwarded.length})` : `Forwarded Applications (${filteredForwarded.length})`}</h2>
                  <p className="section-desc">
                    {hi
                      ? 'अनुशंसा पत्र के साथ सुपर एडमिन को भेजे गए आवेदन। यह आवेदन वर्तमान में अनुमोदन प्रक्रिया में हैं।'
                      : 'Applications forwarded to Super Admin with recommendation letters, currently under review for final approval.'}
                  </p>
                </div>
                {renderExportButton(filteredForwarded, 'Forwarded Applications')}
              </div>

              {renderFilterBar(filteredForwarded.length, forwardedApplications.length)}

              <div className="table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>{hi ? 'आवेदन संख्या' : 'Application Number'}</th>
                      <th>{hi ? 'किसान का नाम' : 'Farmer Name'}</th>
                      <th>{hi ? 'जिला' : 'District'}</th>
                      <th>{hi ? 'खेत क्षेत्र' : 'Farm Area'}</th>
                      <th>{hi ? 'अनुशंसा पत्र' : 'Recommendation Letter'}</th>
                      <th>{hi ? 'अग्रेषित दिनांक' : 'Forwarded Date'}</th>
                      <th>{hi ? 'स्थिति' : 'Status'}</th>
                      <th style={{ textAlign: 'right' }}>{hi ? 'कार्रवाई' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForwarded.map((app) => {
                      const recLetterUrl = resolveDocUrl(app.recommendation?.letter)
                      return (
                        <tr key={app._id || app.applicationNumber}>
                          <td>
                            <strong className="app-id-text">{app.applicationNumber}</strong>
                          </td>
                          <td>
                            <div className="farmer-name-cell">
                              <span className="farmer-main-name">{app.farmer?.farmerName || app.applicant || '-'}</span>
                              <small>{app.farmer?.mobile || ''}</small>
                            </div>
                          </td>
                          <td>{app.farmer?.district || 'Churu'}</td>
                          <td>{app.farm?.farmArea ? `${app.farm.farmArea} ha` : '-'}</td>
                          <td>
                            {recLetterUrl ? (
                              <button
                                type="button"
                                className="doc-view-pill doc-pill-rec"
                                onClick={() => setDocumentViewer({
                                  url: recLetterUrl,
                                  label: `Recommendation Letter (${app.recommendation?.letterNumber || app.applicationNumber})`,
                                  applicationNumber: app.applicationNumber
                                })}
                              >
                                <FileText size={13} />
                                <span>{app.recommendation?.letterNumber || (hi ? 'पत्र देखें' : 'View Letter')}</span>
                              </button>
                            ) : (
                              <span className="doc-missing">{hi ? 'पत्र संलग्न' : 'Letter Attached'}</span>
                            )}
                          </td>
                          <td>{formatDate(app.recommendation?.date || app.updatedAt)}</td>
                          <td>
                            <StatusBadge status="FORWARDED" />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-inline">
                              <button
                                type="button"
                                className="ghost-btn btn-sm"
                                onClick={() => setDetailApplication(app)}
                                title="View Application Details"
                              >
                                <Eye size={14} />
                                <span>{hi ? 'देखें' : 'View'}</span>
                              </button>
                              <span className="forwarded-lock-badge" title="Application is already with Super Admin">
                                {hi ? 'अग्रेषित' : 'Under Super Admin Review'}
                              </span>
                              <button
                                type="button"
                                className="secondary-btn btn-sm btn-revert-action"
                                onClick={() => openRevertModal(app)}
                                title="Withdraw / revert this application"
                              >
                                <Undo2 size={14} />
                                <span>{hi ? 'वापस लें' : 'Revert'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredForwarded.length === 0 && (
                      <tr>
                        <td colSpan="8" className="empty-table-cell">
                          <Send size={32} className="empty-icon" />
                          <p>{hi ? 'वर्तमान में कोई अग्रेषित आवेदन नहीं है।' : 'No forwarded applications matching your criteria.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================================================
              SECTION 3: REVERTED APPLICATIONS
              =================================================== */}
          {activeTab === 'reverted' && (
            <section className="records-panel reveal">
              <div className="records-heading">
                <div>
                  <div className="section-title-badge reverted-badge-header">
                    <RotateCcw size={16} />
                    <span>{hi ? 'पुनर्विचार हेतु लौटाए गए आवेदन' : 'Reverted Applications'}</span>
                  </div>
                  <h2>{hi ? `सुधार हेतु वापस आए आवेदन (${filteredReverted.length})` : `Reverted Applications (${filteredReverted.length})`}</h2>
                  <p className="section-desc">
                    {hi
                      ? 'सुपर एडमिन द्वारा टिप्पणी सहित लौटाए गए आवेदन। इन्हें समीक्षा कर पुनः अनुशंसा पत्र सहित अग्रेषित किया जा सकता है।'
                      : 'Applications returned for rectification (by you or the Super Admin). These can be reviewed, corrected, and forwarded again.'}
                  </p>
                </div>
                {renderExportButton(filteredReverted, 'Reverted Applications')}
              </div>

              {renderFilterBar(filteredReverted.length, revertedApplications.length)}

              <div className="table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>{hi ? 'आवेदन संख्या' : 'Application Number'}</th>
                      <th>{hi ? 'किसान का नाम' : 'Farmer Name'}</th>
                      <th>{hi ? 'जिला' : 'District'}</th>
                      <th>{hi ? 'खेत क्षेत्र' : 'Farm Area'}</th>
                      <th>{hi ? 'लौटाने का कारण' : 'Revert Reason'}</th>
                      <th>{hi ? 'लौटाए जाने की तिथि' : 'Reverted Date'}</th>
                      <th>{hi ? 'स्थिति' : 'Status'}</th>
                      <th style={{ textAlign: 'right' }}>{hi ? 'कार्रवाई' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReverted.map((app) => (
                      <tr key={app._id || app.applicationNumber} className="reverted-row-highlight">
                        <td>
                          <strong className="app-id-text">{app.applicationNumber}</strong>
                        </td>
                        <td>
                          <div className="farmer-name-cell">
                            <span className="farmer-main-name">{app.farmer?.farmerName || app.applicant || '-'}</span>
                            <small>{app.farmer?.mobile || ''}</small>
                          </div>
                        </td>
                        <td>{app.farmer?.district || 'Churu'}</td>
                        <td>{app.farm?.farmArea ? `${app.farm.farmArea} ha` : '-'}</td>
                        <td className="revert-reason-cell">
                          <div className="revert-reason-box" title={app.remarks || 'Returned by Super Admin'}>
                            <AlertCircle size={14} className="revert-reason-icon" />
                            <span>{app.remarks || (hi ? 'सुधार अपेक्षित' : 'Correction required')}</span>
                          </div>
                        </td>
                        <td>{formatDate(app.updatedAt)}</td>
                        <td>
                          <StatusBadge status="REVERTED" />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions-inline">
                            <button
                              type="button"
                              className="ghost-btn btn-sm"
                              onClick={() => setDetailApplication(app)}
                              title="View Details"
                            >
                              <Eye size={14} />
                              <span>{hi ? 'देखें' : 'View'}</span>
                            </button>
                            <button
                              type="button"
                              className="ghost-btn btn-sm review-btn"
                              onClick={() => setDetailApplication(app)}
                              title="Review Reasons"
                            >
                              <FileCheck size={14} />
                              <span>{hi ? 'समीक्षा' : 'Review'}</span>
                            </button>
                            <button
                              type="button"
                              className="secondary-btn btn-sm btn-revert-action"
                              onClick={() => openForwardModal(app)}
                              title="Forward Again to Super Admin"
                            >
                              <RotateCcw size={14} />
                              <span>{hi ? 'पुनः अग्रेषित करें' : 'Forward Again'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredReverted.length === 0 && (
                      <tr>
                        <td colSpan="8" className="empty-table-cell">
                          <RotateCcw size={32} className="empty-icon" />
                          <p>{hi ? 'वर्तमान में कोई लौटाया गया आवेदन नहीं है।' : 'No reverted applications matching your criteria.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================================================
              SECTION 4: APPROVED APPLICATIONS
              =================================================== */}
          {activeTab === 'approved' && (
            <section className="records-panel reveal">
              <div className="records-heading">
                <div>
                  <div className="section-title-badge approved-badge-header">
                    <CheckCircle2 size={16} />
                    <span>{hi ? 'स्वीकृत आवेदन अनुभाग' : 'Approved Applications'}</span>
                  </div>
                  <h2>{hi ? `स्वीकृत एवं प्रमाणित आवेदन (${filteredApproved.length})` : `Approved Applications (${filteredApproved.length})`}</h2>
                  <p className="section-desc">
                    {hi
                      ? 'सुपर एडमिन द्वारा अनुमोदित अंतिम स्वीकृत पंजीकरण। यह रिकॉर्ड केवल पढ़ने योग्य (Read-Only) हैं।'
                      : 'Final approved registrations sanctioned by Super Admin. These records are read-only for Normal Admin.'}
                  </p>
                </div>
                {renderExportButton(filteredApproved, 'Approved Applications')}
              </div>

              {renderFilterBar(filteredApproved.length, approvedApplications.length)}

              <div className="table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>{hi ? 'आवेदन संख्या' : 'Application Number'}</th>
                      <th>{hi ? 'किसान का नाम' : 'Farmer Name'}</th>
                      <th>{hi ? 'जिला' : 'District'}</th>
                      <th>{hi ? 'खेत क्षेत्र' : 'Farm Area'}</th>
                      <th>{hi ? 'स्वीकृति दिनांक' : 'Approved Date'}</th>
                      <th>{hi ? 'स्थिति' : 'Status'}</th>
                      <th style={{ textAlign: 'right' }}>{hi ? 'कार्रवाई' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApproved.map((app) => (
                      <tr key={app._id || app.applicationNumber}>
                        <td>
                          <strong className="app-id-text">{app.applicationNumber}</strong>
                        </td>
                        <td>
                          <div className="farmer-name-cell">
                            <span className="farmer-main-name">{app.farmer?.farmerName || app.applicant || '-'}</span>
                            <small>{app.farmer?.mobile || ''}</small>
                          </div>
                        </td>
                        <td>{app.farmer?.district || 'Churu'}</td>
                        <td>{app.farm?.farmArea ? `${app.farm.farmArea} ha` : '-'}</td>
                        <td>{formatDate(app.updatedAt || app.createdAt)}</td>
                        <td>
                          <StatusBadge status="APPROVED" />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions-inline">
                            <button
                              type="button"
                              className="ghost-btn btn-sm"
                              onClick={() => setDetailApplication(app)}
                              title="View Application Details"
                            >
                              <Eye size={14} />
                              <span>{hi ? 'देखें (Read-Only)' : 'View'}</span>
                            </button>
                            <span className="approved-seal-tag">
                              <CheckCircle size={13} />
                              <span>{hi ? 'स्वीकृत' : 'Sanctioned'}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredApproved.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table-cell">
                          <CheckCircle2 size={32} className="empty-icon" />
                          <p>{hi ? 'वर्तमान में कोई स्वीकृत आवेदन नहीं है।' : 'No approved applications matching your criteria.'}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================================================
              TAB 5: ALL RECORDS & EXPORT
              =================================================== */}
          {activeTab === 'all' && (
            <section className="records-panel reveal">
              <div className="records-heading">
                <div>
                  <p className="eyebrow">{hi ? 'संपूर्ण डेटा' : 'Full Registry'}</p>
                  <h2>{hi ? `सभी पंजीकरण रिकॉर्ड (${filteredAll.length})` : `All Registration Records (${filteredAll.length})`}</h2>
                </div>
                <div className="export-action-bar">
                  {!exportMode ? (
                    <>
                      {renderExportButton(filteredAll, 'All Registration Records')}
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => setExportMode(true)}
                      >
                        {hi ? 'चयन करें / हटाएं' : 'Select / Delete'}
                      </button>
                    </>
                  ) : (
                    <div className="export-btn-group">
                      <button
                        type="button"
                        className="primary-btn btn-sm"
                        onClick={() => {
                          downloadCsv(applications, Array.from(selectedIds))
                          setExportMode(false)
                          setSelectedIds(new Set())
                        }}
                        disabled={selectedIds.size === 0}
                      >
                        <Download size={14} />
                        <span>{hi ? `एक्सेल CSV (${selectedIds.size})` : `Export CSV (${selectedIds.size})`}</span>
                      </button>
                      <button
                        type="button"
                        className="primary-btn btn-sm"
                        onClick={() => {
                          downloadPdf(applications, Array.from(selectedIds))
                          setExportMode(false)
                          setSelectedIds(new Set())
                        }}
                        disabled={selectedIds.size === 0}
                      >
                        <FileText size={14} />
                        <span>{hi ? `PDF रिपोर्ट (${selectedIds.size})` : `Export PDF (${selectedIds.size})`}</span>
                      </button>
                      <button
                        type="button"
                        className="secondary-btn btn-sm btn-delete-action"
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Are you sure you want to delete ${selectedIds.size} application(s)?`
                          )
                          if (!confirmed) return
                          if (typeof onDeleteApplications === 'function') {
                            onDeleteApplications(Array.from(selectedIds))
                          }
                          setExportMode(false)
                          setSelectedIds(new Set())
                        }}
                        disabled={selectedIds.size === 0}
                      >
                        <Trash2 size={14} />
                        <span>{hi ? 'चयनित हटाएं' : 'Delete Selected'}</span>
                      </button>
                      <button
                        type="button"
                        className="ghost-btn btn-sm"
                        onClick={() => {
                          setExportMode(false)
                          setSelectedIds(new Set())
                        }}
                      >
                        {hi ? 'रद्द करें' : 'Cancel'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {renderFilterBar(filteredAll.length, applications.length)}

              <div className="table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      {exportMode && (
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredAll.length && filteredAll.length > 0}
                            onChange={() => toggleSelectAll(filteredAll)}
                            aria-label="Select All"
                          />
                        </th>
                      )}
                      <th>{hi ? 'आवेदन संख्या' : 'App Number'}</th>
                      <th>{hi ? 'किसान का नाम' : 'Farmer Name'}</th>
                      <th>{hi ? 'मोबाइल' : 'Mobile'}</th>
                      <th>{hi ? 'जिला' : 'District'}</th>
                      <th>{hi ? 'खेत क्षेत्र' : 'Area'}</th>
                      <th>{hi ? 'स्थिति' : 'Status'}</th>
                      <th>{hi ? 'दिनांक' : 'Date'}</th>
                      <th style={{ textAlign: 'right' }}>{hi ? 'विवरण' : 'Details'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAll.map((app) => (
                      <tr
                        key={app._id || app.applicationNumber}
                        className={selectedIds.has(app._id) ? 'row-selected' : ''}
                      >
                        {exportMode && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(app._id)}
                              onChange={() => toggleSelect(app._id)}
                              aria-label={`Select ${app.applicationNumber}`}
                            />
                          </td>
                        )}
                        <td>
                          <strong className="app-id-text">{app.applicationNumber}</strong>
                        </td>
                        <td>{app.farmer?.farmerName || app.applicant || '-'}</td>
                        <td>{app.farmer?.mobile || '-'}</td>
                        <td>{app.farmer?.district || 'Churu'}</td>
                        <td>{app.farm?.farmArea ? `${app.farm.farmArea} ha` : '-'}</td>
                        <td><StatusBadge status={app.status} /></td>
                        <td>{formatDate(app.createdAt)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="ghost-btn btn-sm"
                            onClick={() => setDetailApplication(app)}
                          >
                            <Eye size={14} />
                            <span>{hi ? 'देखें' : 'View'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredAll.length === 0 && (
                      <tr>
                        <td colSpan={exportMode ? 9 : 8} className="empty-table-cell">
                          {hi ? 'कोई रिकॉर्ड नहीं मिला।' : 'No records found matching filters.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================================================
              TAB 6: NOTIFICATIONS LOG
              =================================================== */}
          {activeTab === 'notifications' && (
            <section className="records-panel reveal">
              <div className="records-heading">
                <div>
                  <p className="eyebrow">{hi ? 'सिस्टम लॉग' : 'Notification Log'}</p>
                  <h2>{hi ? 'ईमेल एवं स्थिति संदेश' : 'Email-ready Status Messages'}</h2>
                </div>
              </div>
              <div className="notification-stack dashboard-notifications">
                {notifications.length === 0 && (
                  <p className="empty-notification-text">
                    {hi ? 'अभी तक कोई सूचनाएं उत्पन्न नहीं हुई हैं।' : 'No notifications generated yet.'}
                  </p>
                )}
                {notifications.map((notification, idx) => (
                  <article key={notification.id || idx} className="notification-item-card">
                    <div className="notification-header">
                      <strong>{notification.email || 'System Dispatch'}</strong>
                      <small>{notification.createdAt || formatDate(new Date())}</small>
                    </div>
                    <p>{notification.message}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ===================================================
          FORWARD RECOMMENDATION MODAL
          =================================================== */}
      {forwardModalApp && (
        <div className="document-modal-overlay" onClick={() => !forwardLoading && setForwardModalApp(null)}>
          <div className="document-modal forward-recommendation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-modal-header">
              <div className="forward-modal-title">
                <Send size={20} className="forward-icon" />
                <div>
                  <h3>
                    {forwardModalApp.status === 'REVERTED'
                      ? (hi ? 'लौटाए गए आवेदन को पुनः अग्रेषित करें' : 'Forward Reverted Application Again')
                      : (hi ? 'आवेदन उच्चाधिकारी को अग्रेषित करें' : 'Forward Application to Super Admin')}
                  </h3>
                  <small>
                    {hi ? 'अनुशंसा पत्र एवं विवरण प्रस्तुत करें' : 'Attach recommendation letter and forward to Super Admin'}
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !forwardLoading && setForwardModalApp(null)}
                disabled={forwardLoading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForwardSubmit}>
              <div className="document-modal-body">
                {/* Reverted Context Alert Banner */}
                {forwardModalApp.status === 'REVERTED' && (
                  <div className="revert-context-alert">
                    <AlertCircle size={18} className="revert-alert-icon" />
                    <div>
                      <strong>{hi ? 'सुपर एडमिन द्वारा लौटाने का कारण:' : 'Revert Reason:'}</strong>
                      <p>{forwardModalApp.remarks || (hi ? 'सुधार आवश्यक' : 'Clarification required')}</p>
                      <small>{hi ? 'पुनः अग्रेषित करने पर यह उसी आवेदन रिकॉर्ड को अद्यतन (Update) करेगा।' : 'Forwarding again will update this existing application record without duplication.'}</small>
                    </div>
                  </div>
                )}

                {/* Application Mini Summary */}
                <div className="forward-app-summary-card">
                  <div className="summary-field">
                    <span>{hi ? 'आवेदन संख्या' : 'Application No:'}</span>
                    <strong>{forwardModalApp.applicationNumber}</strong>
                  </div>
                  <div className="summary-field">
                    <span>{hi ? 'किसान का नाम' : 'Farmer Name:'}</span>
                    <strong>{forwardModalApp.farmer?.farmerName || forwardModalApp.applicant}</strong>
                  </div>
                  <div className="summary-field">
                    <span>{hi ? 'जिला / गांव' : 'District / Village:'}</span>
                    <span>{forwardModalApp.farmer?.village || ''}, {forwardModalApp.farmer?.district || 'Churu'}</span>
                  </div>
                  <div className="summary-field">
                    <span>{hi ? 'खेत क्षेत्र' : 'Farm Area:'}</span>
                    <span>{forwardModalApp.farm?.farmArea ? `${forwardModalApp.farm.farmArea} ha` : '-'}</span>
                  </div>
                </div>

                {/* File Upload: Recommendation Letter (PDF) */}
                <div className="form-group-wrap">
                  <label className="form-label required">
                    {hi ? 'अनुशंसा पत्र अपलोड करें (केवल PDF)' : 'Recommendation Letter (PDF Only)'}
                  </label>
                  <div className="file-upload-dropzone">
                    <input
                      type="file"
                      id="recLetterFile"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            setForwardError(hi ? 'केवल PDF फाइल की अनुमति है।' : 'Only PDF files are allowed.')
                            return
                          }
                          setForwardError('')
                          setForwardForm({ ...forwardForm, file })
                        }
                      }}
                      className="hidden-file-input"
                    />
                    <label htmlFor="recLetterFile" className="upload-label-box">
                      <Upload size={24} className="upload-box-icon" />
                      {forwardForm.file ? (
                        <div className="file-selected-info">
                          <strong>{forwardForm.file.name}</strong>
                          <small>{(forwardForm.file.size / 1024).toFixed(1)} KB</small>
                        </div>
                      ) : (
                        <div>
                          <strong>{hi ? 'PDF फाइल चुनें या यहाँ खींचें' : 'Click to Browse or Drag PDF File'}</strong>
                          <small>{hi ? 'सहायक निदेशक / जिला मत्स्य अधिकारी अनुशंसा पत्र (अधिकतम 10MB)' : 'DFO / District Fishery Recommendation Letter (Max 10MB)'}</small>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Letter Number & Date in Grid */}
                <div className="form-row-two">
                  <div className="form-group-wrap">
                    <label className="form-label required">
                      {hi ? 'अनुशंसा पत्र क्रमांक' : 'Letter Number'}
                    </label>
                    <input
                      type="text"
                      placeholder="DFO/CHURU/AQUA/2026/001"
                      value={forwardForm.letterNumber}
                      onChange={(e) => setForwardForm({ ...forwardForm, letterNumber: e.target.value })}
                      required
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group-wrap">
                    <label className="form-label required">
                      {hi ? 'अनुशंसा दिनांक' : 'Date of Recommendation'}
                    </label>
                    <input
                      type="date"
                      value={forwardForm.date}
                      onChange={(e) => setForwardForm({ ...forwardForm, date: e.target.value })}
                      required
                      className="form-control-input"
                    />
                  </div>
                </div>

                {/* Remarks / Notes */}
                <div className="form-group-wrap">
                  <label className="form-label">
                    {hi ? 'अधिकारी टिप्पणी / अनुशंसा विवरण' : 'Remarks / Recommendation Note'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={hi ? "साइट निरीक्षण एवं दस्तावेज़ सत्यापन के आधार पर टिप्पणी लिखें..." : "Enter officer remarks or compliance verification observations..."}
                    value={forwardForm.remarks}
                    onChange={(e) => setForwardForm({ ...forwardForm, remarks: e.target.value })}
                    className="form-control-textarea"
                  />
                </div>

                {forwardError && (
                  <div className="form-error-alert">
                    <AlertCircle size={16} />
                    <span>{forwardError}</span>
                  </div>
                )}
              </div>

              <div className="document-modal-footer">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setForwardModalApp(null)}
                  disabled={forwardLoading}
                >
                  {hi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="primary-btn forward-submit-btn"
                  disabled={forwardLoading}
                >
                  {forwardLoading ? (
                    <>
                      <RefreshCw size={15} className="spinning" />
                      <span>{hi ? 'अग्रेषित किया जा रहा है...' : 'Forwarding...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>
                        {forwardModalApp.status === 'REVERTED'
                          ? (hi ? 'पुनः अग्रेषित करें' : 'Forward Again')
                          : (hi ? 'आवेदन अग्रेषित करें' : 'Forward Application')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          APPLICATION DETAIL MODAL (PRESERVED & ENHANCED)
          =================================================== */}
      {detailApplication && (
        <div className="document-modal-overlay" onClick={() => setDetailApplication(null)}>
          <div className="document-modal application-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-modal-header detail-header-bar">
              <div className="detail-header-left">
                <div className="detail-app-number-wrap">
                  <h3>{detailApplication.applicationNumber}</h3>
                  <StatusBadge status={detailApplication.status} />
                </div>
                <div className="detail-meta-text">
                  <span>
                    <strong>{hi ? 'स्थिति:' : 'Current Status:'}</strong> {detailApplication.status || 'PENDING'}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{hi ? 'अंतिम अपडेट:' : 'Last Updated:'}</strong> {formatDateTime(detailApplication.updatedAt || detailApplication.createdAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDetailApplication(null)}
              >
                ✕
              </button>
            </div>

            <div className="document-modal-body detail-modal-scroll">
              {/* REVERTED Banner (if status is REVERTED) */}
              {detailApplication.status === 'REVERTED' && (
                <div className="detail-revert-banner">
                  <div className="revert-banner-header">
                    <div className="revert-banner-title">
                      <AlertCircle size={20} className="revert-icon" />
                      <strong>{hi ? 'सुपर एडमिन द्वारा पुनर्विचार हेतु लौटाया गया' : 'Reverted for correction'}</strong>
                    </div>
                    <span className="revert-date-badge">
                      {formatDate(detailApplication.updatedAt)}
                    </span>
                  </div>
                  <div className="revert-reason-content">
                    <p><strong>{hi ? 'लौटाने का कारण:' : 'Revert Reason / Remarks:'}</strong> {detailApplication.remarks || (hi ? 'सुधार आवश्यक है।' : 'Correction requested.')}</p>
                  </div>
                  <div className="revert-banner-action">
                    <button
                      type="button"
                      className="primary-btn btn-sm btn-revert-action"
                      onClick={() => {
                        const target = detailApplication
                        setDetailApplication(null)
                        openForwardModal(target)
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>{hi ? 'पुनः अग्रेषित करें (Forward Again)' : 'Forward Again'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FORWARDED Banner (if status is FORWARDED) */}
              {detailApplication.status === 'FORWARDED' && (
                <div className="detail-forwarded-banner">
                  <div className="forwarded-banner-title">
                    <Send size={18} className="forwarded-icon" />
                    <strong>{hi ? 'आवेदन उच्चाधिकारी को अग्रेषित है' : 'Application Forwarded to Super Admin'}</strong>
                  </div>
                  <p>{hi ? 'यह आवेदन सुपर एडमिन के पास समीक्षा एवं अंतिम स्वीकृति हेतु प्रस्तुत है।' : 'Currently under final review by Super Admin.'}</p>
                  {detailApplication.recommendation?.letter && (
                    <div className="rec-letter-inline-view">
                      <span><strong>{hi ? 'अनुशंसा पत्र क्रमांक:' : 'Letter No:'}</strong> {detailApplication.recommendation.letterNumber || '-'}</span>
                      <button
                        type="button"
                        className="doc-view-pill doc-pill-rec"
                        onClick={() => {
                          const url = resolveDocUrl(detailApplication.recommendation?.letter)
                          if (url) {
                            setDocumentViewer({
                              url,
                              label: `Recommendation Letter (${detailApplication.recommendation?.letterNumber || detailApplication.applicationNumber})`,
                              applicationNumber: detailApplication.applicationNumber
                            })
                          }
                        }}
                      >
                        <FileText size={13} />
                        <span>{hi ? 'अनुशंसा पत्र देखें' : 'View Recommendation Letter'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* APPROVED Banner (if status is APPROVED) */}
              {detailApplication.status === 'APPROVED' && (
                <div className="detail-approved-banner">
                  <CheckCircle size={20} className="approved-icon" />
                  <div>
                    <strong>{hi ? 'पंजीकरण स्वीकृत एवं प्रमाणित' : 'Application Approved & Sanctioned'}</strong>
                    <p>{hi ? 'सुपर एडमिन द्वारा आधिकारिक रूप से स्वीकृत किया जा चुका है।' : 'Officially approved by Super Admin. Read-only record.'}</p>
                  </div>
                </div>
              )}

              {/* Farmer Information Card */}
              <div className="detail-section-card">
                <h4>
                  <User size={16} />
                  <span>{hi ? 'आवेदक / किसान विवरण' : 'Applicant & Farmer Details'}</span>
                </h4>
                <div className="detail-fields-grid">
                  <div><strong>{hi ? 'किसान का नाम' : 'Farmer Name'}:</strong> {detailApplication.farmer?.farmerName || detailApplication.applicant || '-'}</div>
                  <div><strong>{hi ? 'पिता का नाम' : 'Father Name'}:</strong> {detailApplication.farmer?.fatherName || '-'}</div>
                  <div><strong>{hi ? 'श्रेणी' : 'Category'}:</strong> {detailApplication.farmer?.category || '-'}</div>
                  <div><strong>{hi ? 'भूमि स्वामित्व' : 'Land Ownership'}:</strong> {detailApplication.farmer?.landOwnership || '-'}</div>
                  <div><strong>{hi ? 'ईमेल' : 'Email'}:</strong> {detailApplication.farmer?.email || '-'}</div>
                  <div><strong>{hi ? 'मोबाइल' : 'Mobile'}:</strong> {detailApplication.farmer?.mobile || '-'}</div>
                  <div><strong>{hi ? 'आधार नंबर' : 'Aadhaar Number'}:</strong> {detailApplication.farmer?.aadhaarNumber || '-'}</div>
                  <div><strong>{hi ? 'पता' : 'Address'}:</strong> {detailApplication.farmer?.address || '-'}</div>
                  <div><strong>{hi ? 'गांव' : 'Village'}:</strong> {detailApplication.farmer?.village || '-'}</div>
                  <div><strong>{hi ? 'तहसील' : 'Tehsil'}:</strong> {detailApplication.farmer?.tehsil || '-'}</div>
                  <div><strong>{hi ? 'जिला' : 'District'}:</strong> {detailApplication.farmer?.district || 'Churu'}</div>
                  <div><strong>{hi ? 'राज्य' : 'State'}:</strong> {detailApplication.farmer?.state || 'Rajasthan'}</div>
                </div>
              </div>

              {/* Farm Information Card */}
              <div className="detail-section-card">
                <h4>
                  <MapPin size={16} />
                  <span>{hi ? 'फार्म एवं जल स्रोत विवरण' : 'Farm & Culture Details'}</span>
                </h4>
                <div className="detail-fields-grid">
                  <div><strong>{hi ? 'फार्म का नाम' : 'Farm Name'}:</strong> {detailApplication.farm?.farmName || '-'}</div>
                  <div><strong>{hi ? 'खेत क्षेत्र (Farm Area)' : 'Farm Area'}:</strong> {detailApplication.farm?.farmArea ? `${detailApplication.farm.farmArea} ha` : '-'}</div>
                  <div><strong>{hi ? 'तालाबों की संख्या' : 'Pond Count'}:</strong> {detailApplication.farm?.pondCount || '-'}</div>
                  <div><strong>{hi ? 'जल स्रोत' : 'Water Source'}:</strong> {detailApplication.farm?.waterSource || '-'}</div>
                  <div><strong>{hi ? 'संवर्धन प्रजाति' : 'Culture Type'}:</strong> {detailApplication.farm?.cultureType || '-'}</div>
                  <div><strong>{hi ? 'खसरा नंबर' : 'Khasra Number'}:</strong> {detailApplication.farm?.khasraNumber || '-'}</div>
                  <div><strong>{hi ? 'अक्षांश' : 'Latitude'}:</strong> {detailApplication.farm?.latitude ?? '-'}</div>
                  <div><strong>{hi ? 'देशांतर' : 'Longitude'}:</strong> {detailApplication.farm?.longitude ?? '-'}</div>
                  <div className="detail-field-wide"><strong>{hi ? 'भूमि विवरण' : 'Land Details'}:</strong> {detailApplication.farm?.landDetails || '-'}</div>
                </div>
              </div>

              {/* Declaration */}
              <div className="detail-section-card">
                <h4>
                  <FileCheck size={16} />
                  <span>{hi ? 'घोषणा पत्र' : 'Declaration'}</span>
                </h4>
                <div className="declaration-box">
                  {detailApplication.declaration?.text || (hi ? 'घोषणा पाठ उपलब्ध नहीं है।' : 'Declaration text is not available.')}
                </div>
                <div className="declaration-meta">
                  <span className={`declaration-state ${detailApplication.declaration?.accepted ? 'accepted' : 'pending'}`}>
                    {detailApplication.declaration?.accepted
                      ? (hi ? 'आवेदक द्वारा स्वीकृत' : 'Accepted by applicant')
                      : (hi ? 'स्वीकृत नहीं' : 'Not accepted')}
                  </span>
                  {detailApplication.declaration?.acceptedAt && (
                    <span>{hi ? 'दिनांक:' : 'On:'} {formatDateTime(detailApplication.declaration.acceptedAt)}</span>
                  )}
                </div>
              </div>

              {/* Uploaded Documents Grid */}
              <div className="detail-section-card">
                <h4>
                  <FileText size={16} />
                  <span>{hi ? 'अपलोड किए गए दस्तावेज़' : 'Uploaded Verification Documents'}</span>
                </h4>
                <div className="detail-docs-grid">
                  {docFields
                    .filter((doc) => doc.key !== "otherDocuments")
                    .map((doc) => (
                      <div key={doc.key} className="doc-item-row">
                        <span className="doc-item-name">{hi ? doc.labelHi : doc.label}:</span>
                        {renderDocButton(detailApplication, doc.key, hi ? doc.labelHi : doc.label)}
                      </div>
                    ))}

                  {/* Declaration Document */}
                  <div className="doc-item-row">
                    <span className="doc-item-name">{hi ? 'शपथ पत्र / घोषणा पत्र' : 'Declaration Document'}:</span>
                    <button
                      type="button"
                      className="doc-view-pill"
                      onClick={() =>
                        setDocumentViewer({
                          url: `${API_URL}/api/application/declaration/${detailApplication._id}`,
                          label: hi ? 'शपथ पत्र (Declaration)' : 'Declaration Document',
                          applicationNumber: detailApplication.applicationNumber
                        })
                      }
                    >
                      <FileText size={14} />
                      <span>{hi ? 'घोषणा पत्र देखें' : 'View Declaration'}</span>
                    </button>
                  </div>

                  {/* Recommendation Letter if available */}
                  {detailApplication.recommendation?.letter && (
                    <div className="doc-item-row">
                      <span className="doc-item-name">{hi ? 'विभागीय अनुशंसा पत्र' : 'Recommendation Letter'}:</span>
                      <button
                        type="button"
                        className="doc-view-pill doc-pill-rec"
                        onClick={() => {
                          const url = resolveDocUrl(detailApplication.recommendation?.letter)
                          if (url) {
                            setDocumentViewer({
                              url,
                              label: `Recommendation Letter (${detailApplication.recommendation?.letterNumber || detailApplication.applicationNumber})`,
                              applicationNumber: detailApplication.applicationNumber
                            })
                          }
                        }}
                      >
                        <FileText size={14} />
                        <span>{hi ? 'अनुशंसा पत्र देखें' : 'View Recommendation Letter'}</span>
                      </button>
                    </div>
                  )}

                  {/* Other Documents */}
                  {detailApplication.documents?.otherDocuments?.length > 0 &&
                    detailApplication.documents.otherDocuments.map((doc, idx) => (
                      <div key={idx} className="doc-item-row">
                        <span className="doc-item-name">{hi ? `अन्य दस्तावेज़ ${idx + 1}` : `Other Document ${idx + 1}`}:</span>
                        <button
                          type="button"
                          className="doc-view-pill"
                          onClick={() =>
                            setDocumentViewer({
                              url: resolveDocUrl(doc),
                              label: `Other Document ${idx + 1}`,
                              applicationNumber: detailApplication.applicationNumber
                            })
                          }
                        >
                          <FileText size={14} />
                          <span>{hi ? 'दस्तावेज़ देखें' : 'View Document'}</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Status History Vertical Timeline */}
              {Array.isArray(detailApplication.statusHistory) && detailApplication.statusHistory.length > 0 && (
                <div className="detail-section-card">
                  <h4>
                    <Clock size={16} />
                    <span>{hi ? 'आवेदन स्थिति इतिहास (Audit Trail)' : 'Status History & Timeline'}</span>
                  </h4>
                  <div className="vertical-timeline">
                    {detailApplication.statusHistory.map((item, index) => (
                      <div key={index} className="timeline-item">
                        <div className={`timeline-marker marker-${(item.status || 'PENDING').toLowerCase()}`}>
                          {item.status === 'APPROVED' ? (
                            <CheckCircle2 size={13} />
                          ) : item.status === 'REVERTED' ? (
                            <RotateCcw size={13} />
                          ) : item.status === 'FORWARDED' ? (
                            <Send size={13} />
                          ) : (
                            <Clock size={13} />
                          )}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <StatusBadge status={item.status} />
                            <span className="timeline-role-badge">
                              {item.role || 'Officer'}
                            </span>
                            <small className="timeline-date">{formatDateTime(item.createdAt)}</small>
                          </div>
                          {item.remarks && (
                            <p className="timeline-remarks">{item.remarks}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="document-modal-footer detail-modal-footer">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setDetailApplication(null)}
              >
                {hi ? 'बंद करें' : 'Close'}
              </button>

              {/* Individual application report (CSV / PDF) */}
              <div className="export-menu-wrap">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setDetailExportOpen((open) => !open)}
                  disabled={exportBusy}
                >
                  <Download size={15} />
                  <span>{exportBusy ? (hi ? 'तैयार हो रहा है...' : 'Preparing...') : (hi ? 'रिपोर्ट डाउनलोड' : 'Download Report')}</span>
                  <ChevronDown size={13} />
                </button>
                {detailExportOpen && (
                  <div className="export-menu">
                    <button
                      type="button"
                      onClick={async () => {
                        setDetailExportOpen(false)
                        await runExport('pdf', [detailApplication])
                      }}
                    >
                      <FileText size={15} />
                      <span>{hi ? 'PDF रिपोर्ट (घोषणा सहित)' : 'PDF report (with declaration)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setDetailExportOpen(false)
                        await runExport('csv', [detailApplication])
                      }}
                    >
                      <FileSpreadsheet size={15} />
                      <span>{hi ? 'CSV फाइल' : 'CSV spreadsheet'}</span>
                    </button>
                  </div>
                )}
              </div>

              {(detailApplication.status === 'PENDING' || detailApplication.status === 'FORWARDED') && (
                <button
                  type="button"
                  className="secondary-btn btn-revert-action"
                  onClick={() => {
                    const target = detailApplication
                    setDetailExportOpen(false)
                    openRevertModal(target)
                  }}
                >
                  <Undo2 size={15} />
                  <span>{hi ? 'वापस / रद्द करें' : 'Revert / Cancel'}</span>
                </button>
              )}

              {/* Action buttons inside detail modal */}
              {detailApplication.status === 'PENDING' && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    const target = detailApplication
                    setDetailApplication(null)
                    openForwardModal(target)
                  }}
                >
                  <Send size={15} />
                  <span>{hi ? 'अनुशंसा पत्र अग्रेषित करें' : 'Forward Application'}</span>
                </button>
              )}

              {detailApplication.status === 'REVERTED' && (
                <button
                  type="button"
                  className="secondary-btn btn-revert-action"
                  onClick={() => {
                    const target = detailApplication
                    setDetailApplication(null)
                    openForwardModal(target)
                  }}
                >
                  <RotateCcw size={15} />
                  <span>{hi ? 'सुधार उपरांत पुनः अग्रेषित करें' : 'Forward Again'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          EXPORT DIALOG (CSV / PDF + selection)
          =================================================== */}
      {exportDialog && (() => {
        const q = exportSearch.trim().toLowerCase()
        const visible = exportDialog.list.filter((app) => {
          if (!q) return true
          return [app.applicationNumber, app.farmer?.farmerName, app.farmer?.mobile, app.farmer?.village]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q)
        })
        const allVisibleSelected = visible.length > 0 && visible.every((app) => exportSelection.has(app._id))
        const chosenCount = exportDialog.list.filter((app) => exportSelection.has(app._id)).length
        return (
          <div className="document-modal-overlay" onClick={closeExportDialog}>
            <div className="document-modal export-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="document-modal-header">
                <div className="forward-modal-title">
                  <Download size={20} className="forward-icon" />
                  <div>
                    <h3>{hi ? 'आवेदन निर्यात करें' : 'Export Applications'}</h3>
                    <small>{exportDialog.title}</small>
                  </div>
                </div>
                <button type="button" className="modal-close-btn" onClick={closeExportDialog} disabled={exportBusy}>✕</button>
              </div>

              <div className="document-modal-body export-dialog-body">
                <div className="export-format-toggle" role="radiogroup" aria-label="Export format">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={exportFormat === 'pdf'}
                    className={exportFormat === 'pdf' ? 'active' : ''}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FileText size={18} />
                    <div>
                      <strong>PDF</strong>
                      <small>{hi ? 'हर आवेदन का सुंदर रिपोर्ट पेज' : 'Formatted report, one page per application'}</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={exportFormat === 'csv'}
                    className={exportFormat === 'csv' ? 'active' : ''}
                    onClick={() => setExportFormat('csv')}
                  >
                    <FileSpreadsheet size={18} />
                    <div>
                      <strong>CSV</strong>
                      <small>{hi ? 'एक्सेल हेतु सारणी' : 'Spreadsheet with all fields'}</small>
                    </div>
                  </button>
                </div>

                <div className="export-select-toolbar">
                  <div className="search-input-wrap">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder={hi ? 'नाम / आवेदन संख्या खोजें...' : 'Search name / application no...'}
                      value={exportSearch}
                      onChange={(e) => setExportSearch(e.target.value)}
                    />
                  </div>
                  <label className="export-select-all">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={() => {
                        setExportSelection((current) => {
                          const next = new Set(current)
                          if (allVisibleSelected) visible.forEach((app) => next.delete(app._id))
                          else visible.forEach((app) => next.add(app._id))
                          return next
                        })
                      }}
                    />
                    <span>{hi ? 'सभी चुनें' : 'Select all'}</span>
                  </label>
                </div>

                <div className="export-list">
                  {visible.map((app) => (
                    <label key={app._id} className={`export-list-item ${exportSelection.has(app._id) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={exportSelection.has(app._id)}
                        onChange={() => toggleExportItem(app._id)}
                      />
                      <div className="export-item-main">
                        <strong>{app.farmer?.farmerName || '-'}</strong>
                        <small>{app.applicationNumber} · {app.farmer?.village || app.farmer?.district || ''}</small>
                      </div>
                      <StatusBadge status={app.status} />
                    </label>
                  ))}
                  {visible.length === 0 && (
                    <p className="empty-notification-text">{hi ? 'कोई आवेदन नहीं मिला।' : 'No applications found.'}</p>
                  )}
                </div>
              </div>

              <div className="document-modal-footer">
                <span className="export-count">{hi ? `${chosenCount} चयनित` : `${chosenCount} selected`}</span>
                <button type="button" className="ghost-btn" onClick={closeExportDialog} disabled={exportBusy}>
                  {hi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleExportConfirm}
                  disabled={exportBusy || chosenCount === 0}
                >
                  {exportBusy ? <RefreshCw size={15} className="spinning" /> : <Download size={15} />}
                  <span>
                    {exportBusy
                      ? (hi ? 'तैयार हो रहा है...' : 'Preparing...')
                      : (hi ? `${exportFormat.toUpperCase()} डाउनलोड करें` : `Download ${exportFormat.toUpperCase()}`)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ===================================================
          REVERT / CANCEL MODAL
          =================================================== */}
      {revertModalApp && (
        <div className="document-modal-overlay" onClick={() => !revertLoading && setRevertModalApp(null)}>
          <div className="document-modal revert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-modal-header">
              <div className="forward-modal-title">
                <Undo2 size={20} className="forward-icon" />
                <div>
                  <h3>{hi ? 'आवेदन वापस / रद्द करें' : 'Revert / Cancel Application'}</h3>
                  <small>{revertModalApp.applicationNumber} · {revertModalApp.farmer?.farmerName}</small>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setRevertModalApp(null)} disabled={revertLoading}>✕</button>
            </div>
            <form onSubmit={handleRevertSubmit}>
              <div className="document-modal-body">
                <div className="revert-context-alert">
                  <AlertCircle size={18} className="revert-alert-icon" />
                  <div>
                    <strong>{hi ? 'यह आवेदन सुधार हेतु लौटाया जाएगा' : 'This application will be marked as Reverted'}</strong>
                    <small>{hi ? 'आवेदक को ईमेल द्वारा सूचित किया जाएगा। बाद में इसे पुनः अग्रेषित किया जा सकता है।' : 'The applicant is notified by email. You can review and forward it again later.'}</small>
                  </div>
                </div>
                <div className="form-group-wrap">
                  <label className="form-label required">{hi ? 'लौटाने का कारण' : 'Reason / Remarks'}</label>
                  <textarea
                    rows={4}
                    className="form-control-textarea"
                    placeholder={hi ? 'कारण लिखें...' : 'Write the reason for reverting...'}
                    value={revertRemarks}
                    onChange={(e) => setRevertRemarks(e.target.value)}
                    autoFocus
                  />
                </div>
                {revertError && (
                  <div className="form-error-alert">
                    <AlertCircle size={16} />
                    <span>{revertError}</span>
                  </div>
                )}
              </div>
              <div className="document-modal-footer">
                <button type="button" className="ghost-btn" onClick={() => setRevertModalApp(null)} disabled={revertLoading}>
                  {hi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button type="submit" className="primary-btn revert-submit-btn" disabled={revertLoading}>
                  {revertLoading ? <RefreshCw size={15} className="spinning" /> : <Undo2 size={15} />}
                  <span>{hi ? 'आवेदन वापस करें' : 'Revert Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DOCUMENT VIEWER MODAL (PRESERVED)
          =================================================== */}
      {documentViewer && (
        <div className="document-modal-overlay" onClick={() => setDocumentViewer(null)}>
          <div className="document-modal doc-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-modal-header">
              <div className="viewer-title-box">
                <FileText size={18} />
                <div>
                  <h3>{documentViewer.label}</h3>
                  {documentViewer.applicationNumber && (
                    <small>{hi ? 'आवेदन संख्या:' : 'Application:'} {documentViewer.applicationNumber}</small>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDocumentViewer(null)}
              >
                ✕
              </button>
            </div>

            <DocumentViewerContent
              key={documentViewer.url}
              url={documentViewer.url}
              label={documentViewer.label}
              hi={hi}
              onClose={() => setDocumentViewer(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
