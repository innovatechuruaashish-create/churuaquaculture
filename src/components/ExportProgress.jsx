import { useEffect, useState } from 'react'
import { CheckCircle2, Download } from 'lucide-react'
import { subscribeExportProgress } from '../utils/exportApplications'

// Floating progress bar shown while a CSV / PDF export is being created.
function ExportProgress() {
  const [state, setState] = useState(null)

  useEffect(() => subscribeExportProgress(setState), [])

  if (!state) return null

  const done = state.percent >= 100

  return (
    <div className={`export-progress ${done ? 'done' : ''}`} role="status" aria-live="polite">
      <div className="export-progress-head">
        {done ? <CheckCircle2 size={18} /> : <Download size={18} />}
        <strong>
          {done ? 'Export complete' : `Exporting ${state.format.toUpperCase()}`}
        </strong>
        <span className="export-progress-percent">{state.percent}%</span>
      </div>
      <div className="export-progress-track">
        <div className="export-progress-fill" style={{ width: `${state.percent}%` }} />
      </div>
      <small>
        {done
          ? `${state.count} application${state.count > 1 ? 's' : ''} downloaded`
          : state.label}
      </small>
    </div>
  )
}

export default ExportProgress
