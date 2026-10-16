// Fetches a document and works out what it really is (PDF / image) from its
// first bytes. Cloudinary "raw" uploads have no file extension in the URL, so
// the URL alone cannot be trusted.

function startsWith(bytes, signature) {
  return signature.every((value, index) => bytes[index] === value)
}

function sniff(bytes, fallbackMime = '') {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return { kind: 'pdf', mime: 'application/pdf', ext: 'pdf' }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return { kind: 'image', mime: 'image/png', ext: 'png' }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { kind: 'image', mime: 'image/jpeg', ext: 'jpg' }
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return { kind: 'image', mime: 'image/gif', ext: 'gif' }
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes.slice(8), [0x57, 0x45, 0x42, 0x50])
  ) {
    return { kind: 'image', mime: 'image/webp', ext: 'webp' }
  }

  if (fallbackMime.startsWith('image/')) {
    return { kind: 'image', mime: fallbackMime, ext: fallbackMime.split('/')[1] || 'img' }
  }

  return { kind: 'other', mime: fallbackMime || 'application/octet-stream', ext: 'bin' }
}

export async function loadDocument(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Could not load document (${response.status})`)
  }

  const raw = await response.blob()
  const head = new Uint8Array(await raw.slice(0, 16).arrayBuffer())
  const info = sniff(head, raw.type)
  const blob = new Blob([raw], { type: info.mime })

  return { ...info, blob, objectUrl: URL.createObjectURL(blob) }
}

export function saveDocument(doc, baseName = 'document') {
  const clean = String(baseName).replace(/[<>:"/\\|?*\s]+/g, '-')
  const link = document.createElement('a')
  link.href = doc.objectUrl
  link.download = /\.[a-z0-9]{2,5}$/i.test(clean) ? clean : `${clean}.${doc.ext}`
  document.body.appendChild(link)
  link.click()
  link.remove()
}
