import { useEffect, useState } from 'react'
import { Download, ExternalLink, RefreshCw } from 'lucide-react'
import { loadDocument, saveDocument } from '../utils/documentPreview'

// Body + footer of the document viewer modal: real in-place preview for
// any PDF or image (type is detected from the file itself).
function DocumentViewerContent({ url, label, hi, onClose }) {
  const [state, setState] = useState({ status: 'loading', doc: null })

  useEffect(() => {
    let active = true
    let created = null
    setState({ status: 'loading', doc: null })

    loadDocument(url)
      .then((doc) => {
        created = doc
        if (active) setState({ status: 'ready', doc })
        else URL.revokeObjectURL(doc.objectUrl)
      })
      .catch(() => active && setState({ status: 'error', doc: null }))

    return () => {
      active = false
      if (created) URL.revokeObjectURL(created.objectUrl)
    }
  }, [url])

  const { status, doc } = state

  return (
    <>
      <div className="document-modal-body doc-viewer-body">
        {status === 'loading' && (
          <div className="doc-viewer-state">
            <RefreshCw size={26} className="spinning" />
            <span>{hi ? 'प्रीव्यू लोड हो रहा है...' : 'Loading preview...'}</span>
          </div>
        )}
        {status === 'ready' && doc.kind === 'pdf' && (
          <iframe src={doc.objectUrl} title={label || 'Document'} className="doc-viewer-frame" />
        )}
        {status === 'ready' && doc.kind === 'image' && (
          <div className="image-preview-wrap">
            <img src={doc.objectUrl} alt={label || 'Document'} className="doc-viewer-image" />
          </div>
        )}
        {status === 'ready' && doc.kind === 'other' && (
          <div className="doc-viewer-state">
            {hi ? 'इस फ़ाइल का प्रीव्यू उपलब्ध नहीं है। कृपया डाउनलोड करें।' : 'Preview is not available for this file type. Please download it.'}
          </div>
        )}
        {status === 'error' && (
          <div className="doc-viewer-state">
            {hi ? 'प्रीव्यू लोड नहीं हो सका। नए टैब में खोलकर देखें।' : 'Could not load the preview. Try opening it in a new tab.'}
          </div>
        )}
      </div>

      <div className="document-modal-footer">
        <button type="button" className="ghost-btn" onClick={onClose}>
          {hi ? 'बंद करें' : 'Close'}
        </button>
        <a className="ghost-btn doc-open-link" href={url} target="_blank" rel="noreferrer">
          <ExternalLink size={14} />
          <span>{hi ? 'नए टैब में खोलें' : 'Open in new tab'}</span>
        </a>
        <button
          type="button"
          className="primary-btn"
          disabled={status !== 'ready'}
          onClick={() => saveDocument(doc, label || 'document')}
        >
          <Download size={14} />
          <span>{hi ? 'डाउनलोड' : 'Download'}</span>
        </button>
      </div>
    </>
  )
}

export default DocumentViewerContent
