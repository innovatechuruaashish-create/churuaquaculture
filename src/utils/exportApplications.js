// =====================================================
// Shared helpers
// =====================================================

const DOCUMENT_FIELDS = [
  ['aadhaarCard', 'Aadhaar Card'],
  ['landOwnershipDocument', 'Land Ownership Document'],
  ['patwariReport', 'Patwari Report'],
  ['waterQualityTestReport', 'Water Quality Test Report'],
  ['pondPhotograph', 'Pond Photograph'],
  ['farmerPhotograph', 'Farmer Photograph'],
]

// =====================================================
// Progress reporting (consumed by the <ExportProgress /> bar)
// =====================================================

const progressListeners = new Set()
let clearTimer = null

export function subscribeExportProgress(listener) {
  progressListeners.add(listener)
  return () => progressListeners.delete(listener)
}

function emitProgress(state) {
  progressListeners.forEach((listener) => listener(state))
}

function reportProgress(format, percent, label, count) {
  clearTimeout(clearTimer)
  emitProgress({ format, percent: Math.min(100, Math.round(percent)), label, count })
}

function finishProgress(format, count, label = 'Export complete') {
  reportProgress(format, 100, label, count)
  clearTimer = setTimeout(() => emitProgress(null), 1600)
}

function abortProgress() {
  clearTimeout(clearTimer)
  emitProgress(null)
}

function isBlank(value) {
  return value === undefined || value === null || value === ''
}

function text(value, fallback = '') {
  return isBlank(value) ? fallback : String(value)
}

function dateOnly(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function dateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stamp() {
  return new Date().toISOString().slice(0, 10)
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function safeFileName(value) {
  return String(value || 'application').replace(/[^a-zA-Z0-9-_]+/g, '-')
}

const DECLARATION_PARAGRAPHS = [
  'agree to abide by all the terms and conditions issued by the Department of Fisheries, Government of Rajasthan.',
  'I hereby declare that all documents and information provided by me for Farm Pond Registration are true, correct, and complete. I shall be solely responsible for any incorrect documents, false information, or misleading details submitted by me.',
  'I agree that the Department may take appropriate action on my application in case any information or document provided by me is found to be incorrect or misleading. The Department shall be free to approve, reject, suspend, or cancel my registration/application as per applicable rules and regulations.',
]

// Same declaration the Super Admin sees (name + father's name filled in).
function declarationParagraphs(application) {
  const farmer = application?.farmer || {}
  return [
    `I, ${text(farmer.farmerName, '__________')}, Son/Daughter of ${text(farmer.fatherName, '__________')}, ${DECLARATION_PARAGRAPHS[0]}`,
    DECLARATION_PARAGRAPHS[1],
    DECLARATION_PARAGRAPHS[2],
  ]
}

function declarationLabel(application) {
  return application?.declaration?.accepted ? 'Accepted' : 'Not accepted'
}

function documentStatus(application) {
  const documents = application?.documents || {}
  const rows = DOCUMENT_FIELDS.map(([key, label]) => ({
    label,
    url: documents[key] || '',
  }))

  const others = Array.isArray(documents.otherDocuments)
    ? documents.otherDocuments
    : []

  others.forEach((url, index) => {
    rows.push({ label: `Other Document ${index + 1}`, url })
  })

  return rows
}

// =====================================================
// CSV
// =====================================================

// Numbers that Excel would mangle (Aadhaar, mobile) are written as ="value".
const asText = (value) => (isBlank(value) ? '' : `="${String(value).replace(/"/g, '')}"`)

const CSV_COLUMNS = [
  ['Application Number', (a) => a.applicationNumber],
  ['Status', (a) => a.status || 'PENDING'],
  ['Submitted On', (a) => dateOnly(a.createdAt)],

  ['Farmer Name', (a) => a.farmer?.farmerName],
  ['Father Name', (a) => a.farmer?.fatherName],
  ['Category', (a) => a.farmer?.category],
  ['Land Ownership', (a) => a.farmer?.landOwnership],
  ['Mobile', (a) => asText(a.farmer?.mobile), true],
  ['Email', (a) => a.farmer?.email],
  ['Aadhaar Number', (a) => asText(a.farmer?.aadhaarNumber), true],
  ['Address', (a) => a.farmer?.address],
  ['Village', (a) => a.farmer?.village],
  ['Tehsil', (a) => a.farmer?.tehsil],
  ['District', (a) => a.farmer?.district],

  ['Khasra Number', (a) => a.farm?.khasraNumber],
  ['Farm Area (ha)', (a) => a.farm?.farmArea],
  ['Pond Count', (a) => a.farm?.pondCount],
  ['Water Source', (a) => a.farm?.waterSource],
  ['Culture Type', (a) => a.farm?.cultureType],
  ['Latitude', (a) => a.farm?.latitude],
  ['Longitude', (a) => a.farm?.longitude],

  ['Recommendation Letter No', (a) => a.recommendation?.letterNumber],
  ['Recommendation Date', (a) => dateOnly(a.recommendation?.date)],
  ['Remarks', (a) => a.remarks],
]

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
}

export function exportCsv(applications, fileName) {
  const list = Array.isArray(applications) ? applications : []
  if (!list.length) return false

  reportProgress('csv', 15, 'Preparing CSV…', list.length)

  const header = CSV_COLUMNS.map(([label]) => csvCell(label)).join(',')
  const rows = list.map((application) =>
    CSV_COLUMNS.map(([, getter, raw]) => {
      const value = text(getter(application))
      return raw ? value : csvCell(value)
    }).join(','),
  )

  // BOM so Excel opens Hindi / UTF-8 text correctly.
  const csv = `\uFEFF${[header, ...rows].join('\r\n')}`
  const name =
    fileName ||
    (list.length === 1
      ? `application-${safeFileName(list[0].applicationNumber)}.csv`
      : `fisheries-applications-${stamp()}.csv`)

  reportProgress('csv', 80, 'Saving file…', list.length)
  saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), name)
  finishProgress('csv', list.length)
  return true
}

// =====================================================
// PDF (HTML based so Hindi declaration text renders correctly)
// =====================================================

const STATUS_COLORS = {
  PENDING: ['#fef3c7', '#92400e'],
  FORWARDED: ['#e0f2fe', '#0369a1'],
  REVERTED: ['#ffedd5', '#c2410c'],
  APPROVED: ['#dcfce7', '#15803d'],
  REJECTED: ['#fee2e2', '#b91c1c'],
}

const REPORT_CSS = `
  body { margin:0; background:#fff; }
  .rpt-root { font-family: 'Noto Sans Devanagari','Poppins','Segoe UI',Arial,sans-serif; color:#0f172a; width:720px; background:#fff; }
  .rpt-root, .rpt-root * { overflow-wrap:anywhere; min-width:0; }
  .rpt-root div, .rpt-root table, .rpt-root td, .rpt-root th { box-sizing:border-box; font-family:'Noto Sans Devanagari','Poppins','Segoe UI',Arial,sans-serif; }
  .rpt-page > div:not(.rpt-head) { padding-bottom:8px; }
  .rpt-page { width:720px; overflow:hidden; padding:6px 4px 0; background:#fff; }
  .rpt-head { background:#0c5a3e; color:#fff; padding:16px 20px; border-radius:10px; }
  .rpt-head-title { font-size:19px; font-weight:700; letter-spacing:.3px; }
  .rpt-head-sub { font-size:12px; opacity:.88; margin-top:3px; }
  .rpt-idrow { display:flex; justify-content:space-between; align-items:center; padding:12px 2px 2px; }
  .rpt-appno { font-size:17px; font-weight:700; color:#0c5a3e; }
  .rpt-appmeta { font-size:11px; color:#64748b; margin-top:2px; }
  .rpt-badge { font-size:11px; font-weight:700; padding:5px 12px; border-radius:999px; letter-spacing:.5px; }
  .rpt-section { padding-top:12px; }
  .rpt-section-title { font-size:12.5px; font-weight:700; color:#0c5a3e; text-transform:uppercase; letter-spacing:.6px; padding:0 0 5px; border-bottom:2px solid #0c5a3e; margin-bottom:8px; }
  .rpt-grid { width:100%; border-collapse:collapse; table-layout:fixed; }
  .rpt-grid td { width:50%; vertical-align:top; padding:0 6px 8px 0; }
  .rpt-field { overflow:hidden; background:#f8fafc; border:1px solid #e2e8f0; border-radius:7px; padding:7px 10px; min-height:44px; }
  .rpt-label { font-size:9.5px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.5px; }
  .rpt-value { font-size:12px; font-weight:600; color:#0f172a; margin-top:2px; word-break:break-word; line-height:1.45; }
  .rpt-doc-table { width:100%; table-layout:fixed; border-collapse:collapse; font-size:11.5px; }
  .rpt-doc-table td { padding:6px 8px; border-bottom:1px solid #e2e8f0; }
  .rpt-doc-yes { color:#15803d; font-weight:700; }
  .rpt-doc-no { color:#b91c1c; font-weight:700; }
  .rpt-decl { background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #0c5a3e; border-radius:8px; padding:12px 14px; font-size:11.5px; line-height:1.7; color:#14532d; }
  .rpt-decl-p { margin-bottom:8px; }
  .rpt-decl-meta { margin-top:8px; font-size:11px; color:#334155; }
  .rpt-sign { margin-top:34px; display:flex; justify-content:space-between; font-size:11px; color:#334155; }
  .rpt-sign-line { border-top:1px solid #64748b; padding-top:4px; width:210px; text-align:center; }
  .rpt-hist-table { width:100%; table-layout:fixed; border-collapse:collapse; font-size:11px; }
  .rpt-hist-table th { text-align:left; background:#f1f5f9; padding:6px 8px; font-size:10px; text-transform:uppercase; letter-spacing:.4px; color:#475569; }
  .rpt-hist-table td { padding:6px 8px; border-bottom:1px solid #e2e8f0; vertical-align:top; }
  .rpt-foot { margin-top:8px; padding-top:7px; border-top:1px solid #cbd5e1; font-size:9.5px; color:#64748b; display:flex; justify-content:space-between; }

  /* compact layout: fewer pages per application */
  .rpt-page { padding-top:2px; }
  .rpt-page > div:not(.rpt-head) { padding-bottom:2px; }
  .rpt-head { padding:9px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; }
  .rpt-head-title { font-size:15px; }
  .rpt-head-sub { font-size:10px; margin-top:1px; }
  .rpt-serial { font-size:11px; font-weight:700; background:rgba(255,255,255,.18); padding:4px 12px; border-radius:999px; white-space:nowrap; }
  .rpt-idrow { padding:7px 2px 0; }
  .rpt-appno { font-size:14.5px; }
  .rpt-appmeta { font-size:10px; }
  .rpt-badge { font-size:10px; padding:3px 10px; }
  .rpt-section { padding-top:5px; }
  .rpt-section-title { font-size:11px; padding-bottom:3px; margin-bottom:5px; border-bottom-width:1.5px; }
  .rpt-grid td { padding:0 4px 4px 0; }
  .rpt-grid td:last-child { padding-right:0; }
  .rpt-field { padding:3px 8px; min-height:0; border-radius:5px; }
  .rpt-label { font-size:8.5px; letter-spacing:.4px; }
  .rpt-value { font-size:10.5px; margin-top:1px; line-height:1.35; }
  .rpt-docs { display:flex; flex-wrap:wrap; gap:4px; }
  .rpt-doc { font-size:10px; padding:3px 9px; border-radius:999px; border:1px solid #e2e8f0; background:#f8fafc; }
  .rpt-doc.yes { background:#ecfdf5; border-color:#a7f3d0; color:#047857; font-weight:700; }
  .rpt-doc.no { color:#94a3b8; }
  .rpt-decl { padding:8px 11px; font-size:9.6px; line-height:1.5; }
  .rpt-decl-p { margin-bottom:4px; }
  .rpt-decl-meta { margin-top:5px; font-size:10px; }
  .rpt-sign { margin-top:6px; font-size:10px; }
  .rpt-sign-line { width:230px; }
  .rpt-hist-table, .rpt-hist-table td, .rpt-hist-table th { font-size:9.5px; }
  .rpt-hist-table th, .rpt-hist-table td { padding:3px 6px; }
`

function field(label, value) {
  const shown = isBlank(value) ? '—' : value
  return `<div class="rpt-field"><div class="rpt-label">${escapeHtml(label)}</div><div class="rpt-value">${escapeHtml(shown)}</div></div>`
}

const WIDE_LABELS = new Set(['Postal Address', 'Land Details', 'Recommendation Remarks', 'Latest Remarks'])

// 3 columns; long fields (address, remarks...) take a full row.
function fieldGrid(pairs, columns = 3) {
  const rows = []
  let row = []

  const flush = () => {
    if (!row.length) return
    const cells = row.map(([label, value]) => `<td>${field(label, value)}</td>`)
    while (cells.length < columns) cells.push('<td></td>')
    rows.push(`<tr>${cells.join('')}</tr>`)
    row = []
  }

  pairs.forEach((pair) => {
    if (WIDE_LABELS.has(pair[0])) {
      flush()
      rows.push(`<tr><td colspan="${columns}">${field(pair[0], pair[1])}</td></tr>`)
      return
    }
    row.push(pair)
    if (row.length === columns) flush()
  })
  flush()

  return `<table class="rpt-grid">${rows.join('')}</table>`
}

function section(title, body) {
  return `<div class="rpt-section"><div class="rpt-section-title">${escapeHtml(title)}</div>${body}</div>`
}

function buildApplicationPage(application, index = 0, total = 1) {
  const farmer = application.farmer || {}
  const farm = application.farm || {}
  const declaration = application.declaration || {}
  const recommendation = application.recommendation || {}
  const status = String(application.status || 'PENDING').toUpperCase()
  const [badgeBg, badgeFg] = STATUS_COLORS[status] || STATUS_COLORS.PENDING

  const applicantSection = section(
    'Applicant Details',
    fieldGrid([
      ['Farmer Name', farmer.farmerName],
      ['Father / Husband Name', farmer.fatherName],
      ['Category', farmer.category],
      ['Land Ownership', farmer.landOwnership],
      ['Mobile', farmer.mobile],
      ['Email', farmer.email],
      ['Aadhaar Number', farmer.aadhaarNumber],
      ['Village', farmer.village],
      ['Tehsil', farmer.tehsil],
      ['District', farmer.district],
      ['State', farmer.state],
      ['Postal Address', farmer.address],
    ]),
  )

  const farmSection = section(
    'Farm & Land Details',
    fieldGrid([
      ['Farm Name', farm.farmName],
      ['Land Type (Self / Leased)', farmer.landOwnership],
      ['Khasra Number', farm.khasraNumber],
      ['Total Farm Area (ha)', farm.farmArea],
      ['Number of Ponds', farm.pondCount],
      ['Water Source', farm.waterSource],
      ['Culture Type / Species', farm.cultureType],
      ['Latitude', farm.latitude],
      ['Longitude', farm.longitude],
      ['Land Details', farm.landDetails],
    ]),
  )

  const documentsSection = section(
    'Uploaded Documents',
    `<div class="rpt-docs">${documentStatus(application)
      .map(
        ({ label, url }) =>
          `<div class="rpt-doc ${url ? 'yes' : 'no'}">${url ? '✓' : '–'} ${escapeHtml(label)}</div>`,
      )
      .join('')}</div>`,
  )

  const declarationBody = `
    <div class="rpt-decl">
      ${declarationParagraphs(application)
        .map((paragraph) => `<div class="rpt-decl-p">${escapeHtml(paragraph)}</div>`)
        .join('')}
      <div class="rpt-decl-p"><b>Application Number:</b> ${escapeHtml(text(application.applicationNumber, '—'))}</div>
    </div>
    <div class="rpt-decl-meta">
      <b>Status:</b> ${escapeHtml(declarationLabel(application))}
      ${declaration.acceptedAt ? `&nbsp;&nbsp;|&nbsp;&nbsp;<b>Accepted on:</b> ${escapeHtml(dateTime(declaration.acceptedAt))}` : ''}
    </div>
    <div class="rpt-sign">
      <div class="rpt-sign-line">Applicant Signature<br/>${escapeHtml(text(farmer.farmerName, '—'))} (S/D of ${escapeHtml(text(farmer.fatherName, '—'))})</div>
      <div class="rpt-sign-line">Date</div>
    </div>`
  const declarationSection = section('Declaration', declarationBody)

  const hasRecommendation =
    recommendation.letterNumber || recommendation.date || recommendation.remarks
  const recommendationSection = hasRecommendation
    ? section(
        'Department Recommendation',
        fieldGrid([
          ['Letter Number', recommendation.letterNumber],
          ['Recommendation Date', dateOnly(recommendation.date)],
          ['Letter Attached', recommendation.letter ? 'Yes' : 'No'],
          ['Recommendation Remarks', recommendation.remarks],
        ]),
      )
    : ''

  const history = Array.isArray(application.statusHistory)
    ? application.statusHistory
    : []
  const historySection = history.length
    ? section(
        'Status History',
        `<table class="rpt-hist-table"><thead><tr><th>Status</th><th>By</th><th>Date</th><th>Remarks</th></tr></thead><tbody>${history
          .map(
            (item) =>
              `<tr><td><b>${escapeHtml(item.status)}</b></td><td>${escapeHtml(text(item.role, '—'))}</td><td>${escapeHtml(dateTime(item.createdAt))}</td><td>${escapeHtml(text(item.remarks, '—'))}</td></tr>`,
          )
          .join('')}</tbody></table>`,
      )
    : ''

  const remarksSection = application.remarks
    ? section('Remarks / Reason', fieldGrid([['Latest Remarks', application.remarks]]))
    : ''

  return `
    <div class="rpt-page">
      <div class="rpt-head">
        <div>
          <div class="rpt-head-title">Department of Fisheries — Churu, Rajasthan</div>
          <div class="rpt-head-sub">Inland Saline Water Aquaculture Farm Registration — Application Report</div>
        </div>
        <div class="rpt-serial">Application ${index + 1} of ${total}</div>
      </div>
      <div class="rpt-idrow">
        <div>
          <div class="rpt-appno">${escapeHtml(application.applicationNumber)}</div>
          <div class="rpt-appmeta">Submitted ${escapeHtml(dateTime(application.createdAt) || '—')} &nbsp;•&nbsp; Updated ${escapeHtml(dateTime(application.updatedAt) || '—')}</div>
        </div>
        <div class="rpt-badge" style="background:${badgeBg};color:${badgeFg};">${escapeHtml(status)}</div>
      </div>
      ${applicantSection}
      ${farmSection}
      ${documentsSection}
      ${declarationSection}
      ${recommendationSection}
      ${remarksSection}
      ${historySection}
    </div>`
}

export function buildReportHtml(list) {
  return `<style>${REPORT_CSS}</style><div class="rpt-root">${list
    .map(
      (application, index) =>
        `<div class="rpt-app">${buildApplicationPage(application, index, list.length)}</div>`,
    )
    .join('')}</div>`
}

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap'

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

// Renders in an isolated iframe so the site's own CSS / scroll position can
// never affect (or blank out) the report.
async function createReportFrame(list) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText =
    'position:fixed;left:0;top:0;width:740px;height:600px;border:0;opacity:0;pointer-events:none;z-index:-1;'
  document.body.appendChild(frame)

  const doc = frame.contentDocument
  doc.open()
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONT_URL}"></head><body>${buildReportHtml(list)}</body></html>`,
  )
  doc.close()

  await Promise.race([
    (async () => {
      await new Promise((resolve) => {
        if (doc.readyState === 'complete') resolve()
        else frame.addEventListener('load', resolve, { once: true })
      })
      await doc.fonts?.load("600 14px 'Noto Sans Devanagari'", 'अआइ').catch(() => undefined)
      await doc.fonts?.ready
    })(),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ])
  await nextFrame()

  return frame
}

export async function exportPdf(applications, fileName) {
  const list = Array.isArray(applications) ? applications : []
  if (!list.length) return false

  reportProgress('pdf', 2, 'Preparing report…', list.length)

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  reportProgress('pdf', 6, 'Preparing report…', list.length)
  const frame = await createReportFrame(list)
  reportProgress('pdf', 10, 'Building pages…', list.length)

  try {
    const doc = frame.contentDocument
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const margin = 8
    const contentW = pageW - margin * 2
    const bottom = pageH - margin - 5
    const appPages = []
    const gap = 1.5

    const apps = Array.from(doc.querySelectorAll('.rpt-app'))
    const totalBlocks = apps.reduce(
      (sum, node) => sum + node.querySelector('.rpt-page').children.length,
      0,
    )
    let doneBlocks = 0
    let firstPage = true

    for (let a = 0; a < apps.length; a += 1) {
      const blocks = Array.from(apps[a].querySelector('.rpt-page').children)
      let y = margin

      if (!firstPage) pdf.addPage()
      firstPage = false
      const startPage = pdf.getNumberOfPages()

      for (const block of blocks) {
        const canvas = await html2canvas(block, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
        })

        if (!canvas.width || !canvas.height) continue

        const h = (canvas.height * contentW) / canvas.width

        if (y + h > bottom && y > margin) {
          pdf.addPage()
          y = margin
        }

        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, y, contentW, h)
        y += h + gap

        doneBlocks += 1
        reportProgress(
          'pdf',
          10 + (doneBlocks / totalBlocks) * 85,
          `Creating PDF… (application ${a + 1} of ${apps.length})`,
          list.length,
        )
      }

      appPages.push({ start: startPage, end: pdf.getNumberOfPages() })

      // let the browser breathe between applications (keeps UI smooth)
      await nextFrame()
    }

    // Footer on every page: serial no. of the application + its page x/y
    const generated = dateTime(new Date())
    pdf.setFontSize(8)
    pdf.setTextColor(100, 116, 139)
    appPages.forEach(({ start, end }, index) => {
      for (let page = start; page <= end; page += 1) {
        pdf.setPage(page)
        pdf.setDrawColor(203, 213, 225)
        pdf.line(margin, pageH - margin - 3, pageW - margin, pageH - margin - 3)
        pdf.text(`Generated on ${generated}`, margin, pageH - margin + 0.5)
        pdf.text(
          `Application ${index + 1} of ${apps.length}  |  ${text(list[index].applicationNumber)}  |  Page ${page - start + 1} of ${end - start + 1}`,
          pageW - margin,
          pageH - margin + 0.5,
          { align: 'right' },
        )
      }
    })

    const name =
      fileName ||
      (list.length === 1
        ? `application-${safeFileName(list[0].applicationNumber)}.pdf`
        : `fisheries-applications-${stamp()}.pdf`)

    reportProgress('pdf', 97, 'Saving file…', list.length)
    pdf.save(name)
    finishProgress('pdf', list.length)
    return true
  } catch (error) {
    abortProgress()
    throw error
  } finally {
    document.body.removeChild(frame)
  }
}
