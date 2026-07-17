const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function requestFile(path: string, formData: FormData): Promise<Blob> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    const text = await response.text()
    let message = text || `Erreur ${response.status}`
    try {
      const data = JSON.parse(text) as { detail?: string }
      if (data.detail) message = data.detail
    } catch {
      // Not JSON (e.g. an HTML error page from a proxy) — keep the raw text.
    }
    throw new Error(message)
  }
  return response.blob()
}

export const api = {
  removeBackground: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestFile('/background/remove', formData)
  },
  compressImage: (image: File, quality: number) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('quality', String(quality))
    return requestFile('/images/compress', formData)
  },
  convertImage: (image: File, targetFormat: string) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('target_format', targetFormat)
    return requestFile('/images/convert', formData)
  },
  colorMatch: (reference: File, images: File[]) => {
    const formData = new FormData()
    formData.append('reference', reference)
    images.forEach((image) => formData.append('images', image))
    return requestFile('/images/color-match', formData)
  },
  normalizeBrightness: (images: File[], reference: File | null) => {
    const formData = new FormData()
    images.forEach((image) => formData.append('images', image))
    if (reference) formData.append('reference', reference)
    return requestFile('/images/normalize-brightness', formData)
  },
  trimVideo: (video: File, start: number, end: number) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('start', String(start))
    formData.append('end', String(end))
    return requestFile('/videos/trim', formData)
  },
  videoToGif: (video: File, start: number, duration: number, fps: number, width: number) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('start', String(start))
    formData.append('duration', String(duration))
    formData.append('fps', String(fps))
    formData.append('width', String(width))
    return requestFile('/videos/to-gif', formData)
  },
}
