const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

// Matches the backend's MaxBodySizeMiddleware — checked client-side too so
// the user gets an immediate, specific message instead of waiting for an
// upload to complete only to have the server reject it with a 413.
export const MAX_FILE_BYTES = 500 * 1024 * 1024

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`
}

function assertFileSizes(formData: FormData): void {
  for (const value of formData.values()) {
    if (value instanceof File && value.size > MAX_FILE_BYTES) {
      throw new Error(
        `Fichier trop volumineux : "${value.name}" (${formatMegabytes(value.size)}, max ${formatMegabytes(MAX_FILE_BYTES)})`,
      )
    }
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text()
  let message = text || `Erreur ${response.status}`
  try {
    const data = JSON.parse(text) as { detail?: string }
    if (data.detail) message = data.detail
  } catch {
    // Not JSON (e.g. an HTML error page from a proxy) — keep the raw text.
  }
  return message
}

async function requestFile(path: string, formData: FormData): Promise<Blob> {
  assertFileSizes(formData)
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return response.blob()
}

async function requestJson<T>(path: string, formData: FormData): Promise<T> {
  assertFileSizes(formData)
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return response.json() as Promise<T>
}

export const api = {
  removeBackground: (image: File, alphaMatting: boolean) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('alpha_matting', String(alphaMatting))
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
  cropImage: (image: File, params: { ratio: string } | { x: number; y: number; width: number; height: number }) => {
    const formData = new FormData()
    formData.append('image', image)
    if ('ratio' in params) {
      formData.append('ratio', params.ratio)
    } else {
      formData.append('x', String(params.x))
      formData.append('y', String(params.y))
      formData.append('width', String(params.width))
      formData.append('height', String(params.height))
    }
    return requestFile('/images/crop', formData)
  },
  resizeImage: (
    image: File,
    params: { width?: number; height?: number; percent?: number; keepRatio: boolean },
  ) => {
    const formData = new FormData()
    formData.append('image', image)
    if (params.percent !== undefined) formData.append('percent', String(params.percent))
    if (params.width !== undefined) formData.append('width', String(params.width))
    if (params.height !== undefined) formData.append('height', String(params.height))
    formData.append('keep_ratio', String(params.keepRatio))
    return requestFile('/images/resize', formData)
  },
  rotateFlipImage: (image: File, angle: number, flipHorizontal: boolean, flipVertical: boolean) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('angle', String(angle))
    formData.append('flip_horizontal', String(flipHorizontal))
    formData.append('flip_vertical', String(flipVertical))
    return requestFile('/images/rotate-flip', formData)
  },
  watermarkImages: (
    images: File[],
    params: { text?: string; logo?: File; opacity: number; position: string },
  ) => {
    const formData = new FormData()
    images.forEach((image) => formData.append('images', image))
    if (params.text) formData.append('text', params.text)
    if (params.logo) formData.append('logo', params.logo)
    formData.append('opacity', String(params.opacity))
    formData.append('position', params.position)
    return requestFile('/images/watermark', formData)
  },
  adjustImages: (images: File[], brightness: number, contrast: number, saturation: number) => {
    const formData = new FormData()
    images.forEach((image) => formData.append('images', image))
    formData.append('brightness', String(brightness))
    formData.append('contrast', String(contrast))
    formData.append('saturation', String(saturation))
    return requestFile('/images/adjust', formData)
  },
  favicon: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestFile('/assets/favicon', formData)
  },
  iconPack: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestFile('/assets/icon-pack', formData)
  },
  srcset: (image: File, widths: number[]) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('widths', widths.join(','))
    return requestFile('/assets/srcset', formData)
  },
  lqip: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestJson<{ data_uri: string }>('/assets/lqip', formData)
  },
  base64Encode: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestJson<{ data_uri: string }>('/assets/base64', formData)
  },
  spritesheet: (images: File[]) => {
    const formData = new FormData()
    images.forEach((image) => formData.append('images', image))
    return requestFile('/assets/spritesheet', formData)
  },
  socialFormats: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestFile('/assets/social-formats', formData)
  },
  placeholder: (params: { width: number; height: number; bgColor: string; textColor: string; text?: string }) => {
    const formData = new FormData()
    formData.append('width', String(params.width))
    formData.append('height', String(params.height))
    formData.append('bg_color', params.bgColor)
    formData.append('text_color', params.textColor)
    if (params.text) formData.append('text', params.text)
    return requestFile('/assets/placeholder', formData)
  },
  svgOptimize: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return requestFile('/svg/optimize', formData)
  },
  svgConvert: (file: File, direction: 'svg-to-png' | 'png-to-svg', width?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('direction', direction)
    if (width !== undefined) formData.append('width', String(width))
    return requestFile('/svg/convert', formData)
  },
  colorPalette: (image: File, numColors: number) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('num_colors', String(numColors))
    return requestJson<{ colors: { hex: string; rgb: number[]; percentage: number }[] }>(
      '/analysis/palette',
      formData,
    )
  },
  compareImages: (imageA: File, imageB: File) => {
    const formData = new FormData()
    formData.append('image_a', imageA)
    formData.append('image_b', imageB)
    return requestJson<{ data_uri: string; similarity: number }>('/analysis/compare', formData)
  },
  stripExif: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestFile('/advanced/strip-exif', formData)
  },
  extractExif: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestJson<{ metadata: Record<string, unknown> }>('/advanced/extract-exif', formData)
  },
  deskewImage: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return requestFile('/advanced/deskew', formData)
  },
  denoiseImage: (image: File, strength: number) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('strength', String(strength))
    return requestFile('/advanced/denoise', formData)
  },
  contactSheet: (images: File[], columns: number, thumbSize: number) => {
    const formData = new FormData()
    images.forEach((image) => formData.append('images', image))
    formData.append('columns', String(columns))
    formData.append('thumb_size', String(thumbSize))
    return requestFile('/advanced/contact-sheet', formData)
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
  convertVideo: (video: File, targetFormat: string) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('target_format', targetFormat)
    return requestFile('/videos/convert', formData)
  },
  compressVideo: (video: File, bitrateKbps?: number, width?: number) => {
    const formData = new FormData()
    formData.append('video', video)
    if (bitrateKbps !== undefined) formData.append('bitrate_kbps', String(bitrateKbps))
    if (width !== undefined) formData.append('width', String(width))
    return requestFile('/videos/compress', formData)
  },
  extractFrame: (video: File, timestamp: number) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('timestamp', String(timestamp))
    return requestFile('/videos/extract-frame', formData)
  },
  concatVideos: (videos: File[]) => {
    const formData = new FormData()
    videos.forEach((video) => formData.append('videos', video))
    return requestFile('/videos/concat', formData)
  },
  audioTrack: (video: File, action: 'remove' | 'replace', audio?: File) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('action', action)
    if (audio) formData.append('audio', audio)
    return requestFile('/videos/audio-track', formData)
  },
  extractAudio: (video: File, targetFormat: 'mp3' | 'wav') => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('target_format', targetFormat)
    return requestFile('/videos/extract-audio', formData)
  },
  changeSpeed: (video: File, speed: number) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('speed', String(speed))
    return requestFile('/videos/speed', formData)
  },
  burnSubtitles: (video: File, srt: File) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('srt', srt)
    return requestFile('/videos/subtitles', formData)
  },
  createLoop: (video: File, fadeDuration: number) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('fade_duration', String(fadeDuration))
    return requestFile('/videos/loop', formData)
  },
  waveform: (video: File, width: number, height: number) => {
    const formData = new FormData()
    formData.append('video', video)
    formData.append('width', String(width))
    formData.append('height', String(height))
    return requestFile('/videos/waveform', formData)
  },
  qrcode: (data: string, boxSize: number) => {
    const formData = new FormData()
    formData.append('data', data)
    formData.append('box_size', String(boxSize))
    return requestFile('/misc/qrcode', formData)
  },
  imagesToPdf: (images: File[]) => {
    const formData = new FormData()
    images.forEach((image) => formData.append('images', image))
    return requestFile('/misc/images-to-pdf', formData)
  },
  pdfToImages: (file: File, dpi: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dpi', String(dpi))
    return requestFile('/misc/pdf-to-images', formData)
  },
  renameFiles: (files: File[], pattern: string, start: number) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('pattern', pattern)
    formData.append('start', String(start))
    return requestFile('/misc/rename', formData)
  },
  mergePdf: (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return requestFile('/misc/merge-pdf', formData)
  },
  compressPdf: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return requestFile('/misc/compress-pdf', formData)
  },
  computeHash: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return requestJson<{ md5: string; sha256: string }>('/misc/hash', formData)
  },
  contrastRatio: (colorA: string, colorB: string) => {
    const formData = new FormData()
    formData.append('color_a', colorA)
    formData.append('color_b', colorB)
    return requestJson<{
      ratio: number
      aa_normal_text: boolean
      aa_large_text: boolean
      aaa_normal_text: boolean
      aaa_large_text: boolean
    }>('/misc/contrast', formData)
  },
}
