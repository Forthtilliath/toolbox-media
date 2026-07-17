import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './client'

function file(name = 'test.jpg', type = 'image/jpeg') {
  return new File(['fake-content'], name, { type })
}

function mockFetchOk(body: string | Record<string, unknown> = 'fake-blob-content') {
  const isJson = typeof body === 'object'
  const text = isJson ? JSON.stringify(body) : body
  const blob = new Blob([text])
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    blob: () => Promise.resolve(blob),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(text),
  } as unknown as Response)
}

function mockFetchError(status: number, body: string) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(body),
  } as unknown as Response)
}

function lastCall() {
  const mock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
  const [url, options] = mock.mock.calls[0]
  return { url: url as string, formData: options.body as FormData }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('error handling', () => {
  it('surfaces the server-provided JSON detail message', async () => {
    mockFetchError(400, JSON.stringify({ detail: 'Fichier image invalide' }))
    await expect(api.removeBackground(file(), false)).rejects.toThrow('Fichier image invalide')
  })

  it('falls back to the raw response body when it is not JSON', async () => {
    mockFetchError(502, '<html>Bad Gateway</html>')
    await expect(api.removeBackground(file(), false)).rejects.toThrow('<html>Bad Gateway</html>')
  })

  it('falls back to a generic message when the body is empty', async () => {
    mockFetchError(500, '')
    await expect(api.removeBackground(file(), false)).rejects.toThrow('Erreur 500')
  })
})

describe('background', () => {
  it('removeBackground posts to /background/remove', async () => {
    mockFetchOk()
    const f = file()
    await api.removeBackground(f, false)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/background/remove')
    expect(formData.get('image')).toBe(f)
    expect(formData.get('alpha_matting')).toBe('false')
  })

  it('removeBackground sends alpha_matting=true when enabled', async () => {
    mockFetchOk()
    await api.removeBackground(file(), true)
    const { formData } = lastCall()
    expect(formData.get('alpha_matting')).toBe('true')
  })
})

describe('images', () => {
  it('compressImage sends the quality', async () => {
    mockFetchOk()
    await api.compressImage(file(), 42)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/compress')
    expect(formData.get('quality')).toBe('42')
  })

  it('convertImage sends the target format', async () => {
    mockFetchOk()
    await api.convertImage(file(), 'webp')
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/convert')
    expect(formData.get('target_format')).toBe('webp')
  })

  it('colorMatch sends a reference and multiple images', async () => {
    mockFetchOk()
    const ref = file('ref.jpg')
    const a = file('a.jpg')
    const b = file('b.jpg')
    await api.colorMatch(ref, [a, b])
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/color-match')
    expect(formData.get('reference')).toBe(ref)
    expect(formData.getAll('images')).toEqual([a, b])
  })

  it('normalizeBrightness omits the reference field when null', async () => {
    mockFetchOk()
    await api.normalizeBrightness([file()], null)
    const { formData } = lastCall()
    expect(formData.has('reference')).toBe(false)
  })

  it('normalizeBrightness includes the reference field when provided', async () => {
    mockFetchOk()
    const ref = file('ref.jpg')
    await api.normalizeBrightness([file()], ref)
    const { formData } = lastCall()
    expect(formData.get('reference')).toBe(ref)
  })

  it('cropImage sends a ratio in ratio mode', async () => {
    mockFetchOk()
    await api.cropImage(file(), { ratio: '4:3' })
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/crop')
    expect(formData.get('ratio')).toBe('4:3')
    expect(formData.has('x')).toBe(false)
  })

  it('cropImage sends x/y/width/height in manual mode', async () => {
    mockFetchOk()
    await api.cropImage(file(), { x: 1, y: 2, width: 3, height: 4 })
    const { formData } = lastCall()
    expect(formData.get('x')).toBe('1')
    expect(formData.get('y')).toBe('2')
    expect(formData.get('width')).toBe('3')
    expect(formData.get('height')).toBe('4')
    expect(formData.has('ratio')).toBe(false)
  })

  it('resizeImage only sends the provided dimensions', async () => {
    mockFetchOk()
    await api.resizeImage(file(), { width: 100, keepRatio: true })
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/resize')
    expect(formData.get('width')).toBe('100')
    expect(formData.has('height')).toBe(false)
    expect(formData.get('keep_ratio')).toBe('true')
  })

  it('rotateFlipImage sends angle and flip flags', async () => {
    mockFetchOk()
    await api.rotateFlipImage(file(), 90, true, false)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/rotate-flip')
    expect(formData.get('angle')).toBe('90')
    expect(formData.get('flip_horizontal')).toBe('true')
    expect(formData.get('flip_vertical')).toBe('false')
  })

  it('watermarkImages sends text mode without a logo', async () => {
    mockFetchOk()
    await api.watermarkImages([file()], { text: 'Copyright', opacity: 80, position: 'center' })
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/watermark')
    expect(formData.get('text')).toBe('Copyright')
    expect(formData.has('logo')).toBe(false)
    expect(formData.get('position')).toBe('center')
  })

  it('watermarkImages sends a logo file when provided', async () => {
    mockFetchOk()
    const logo = file('logo.png', 'image/png')
    await api.watermarkImages([file()], { logo, opacity: 50, position: 'top-left' })
    const { formData } = lastCall()
    expect(formData.get('logo')).toBe(logo)
  })

  it('adjustImages sends brightness/contrast/saturation for every image', async () => {
    mockFetchOk()
    const a = file('a.jpg')
    const b = file('b.jpg')
    await api.adjustImages([a, b], 1.2, 1.0, 0.8)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/images/adjust')
    expect(formData.getAll('images')).toEqual([a, b])
    expect(formData.get('brightness')).toBe('1.2')
    expect(formData.get('saturation')).toBe('0.8')
  })
})

describe('advanced', () => {
  it('stripExif posts to /advanced/strip-exif', async () => {
    mockFetchOk()
    const f = file()
    await api.stripExif(f)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/advanced/strip-exif')
    expect(formData.get('image')).toBe(f)
  })

  it('extractExif parses the metadata object', async () => {
    mockFetchOk({ metadata: { Make: 'Apple', GPSDecimal: { latitude: 1, longitude: 2 } } })
    const result = await api.extractExif(file())
    expect(lastCall().url).toBe('/api/advanced/extract-exif')
    expect(result.metadata.Make).toBe('Apple')
  })

  it('deskewImage posts to /advanced/deskew', async () => {
    mockFetchOk()
    await api.deskewImage(file())
    expect(lastCall().url).toBe('/api/advanced/deskew')
  })

  it('denoiseImage sends the strength', async () => {
    mockFetchOk()
    await api.denoiseImage(file(), 15)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/advanced/denoise')
    expect(formData.get('strength')).toBe('15')
  })

  it('contactSheet sends every image plus columns and thumb size', async () => {
    mockFetchOk()
    const a = file('a.jpg')
    const b = file('b.jpg')
    await api.contactSheet([a, b], 3, 150)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/advanced/contact-sheet')
    expect(formData.getAll('images')).toEqual([a, b])
    expect(formData.get('columns')).toBe('3')
    expect(formData.get('thumb_size')).toBe('150')
  })
})

describe('dev assets', () => {
  it('favicon posts to /assets/favicon', async () => {
    mockFetchOk()
    const f = file()
    await api.favicon(f)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/assets/favicon')
    expect(formData.get('image')).toBe(f)
  })

  it('iconPack posts to /assets/icon-pack', async () => {
    mockFetchOk()
    await api.iconPack(file())
    expect(lastCall().url).toBe('/api/assets/icon-pack')
  })

  it('srcset joins widths with commas', async () => {
    mockFetchOk()
    await api.srcset(file(), [320, 640, 1280])
    const { url, formData } = lastCall()
    expect(url).toBe('/api/assets/srcset')
    expect(formData.get('widths')).toBe('320,640,1280')
  })

  it('lqip parses the JSON data_uri response', async () => {
    mockFetchOk({ data_uri: 'data:image/jpeg;base64,abc' })
    const result = await api.lqip(file())
    expect(lastCall().url).toBe('/api/assets/lqip')
    expect(result.data_uri).toBe('data:image/jpeg;base64,abc')
  })

  it('base64Encode parses the JSON data_uri response', async () => {
    mockFetchOk({ data_uri: 'data:image/png;base64,xyz' })
    const result = await api.base64Encode(file())
    expect(lastCall().url).toBe('/api/assets/base64')
    expect(result.data_uri).toBe('data:image/png;base64,xyz')
  })

  it('spritesheet appends every image under the same field name', async () => {
    mockFetchOk()
    const a = file('a.png')
    const b = file('b.png')
    await api.spritesheet([a, b])
    const { url, formData } = lastCall()
    expect(url).toBe('/api/assets/spritesheet')
    expect(formData.getAll('images')).toEqual([a, b])
  })

  it('socialFormats posts to /assets/social-formats', async () => {
    mockFetchOk()
    const f = file()
    await api.socialFormats(f)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/assets/social-formats')
    expect(formData.get('image')).toBe(f)
  })

  it('placeholder omits text when not provided', async () => {
    mockFetchOk()
    await api.placeholder({ width: 400, height: 300, bgColor: 'ccc', textColor: '969696' })
    const { url, formData } = lastCall()
    expect(url).toBe('/api/assets/placeholder')
    expect(formData.get('width')).toBe('400')
    expect(formData.get('bg_color')).toBe('ccc')
    expect(formData.has('text')).toBe(false)
  })

  it('placeholder includes text when provided', async () => {
    mockFetchOk()
    await api.placeholder({ width: 400, height: 300, bgColor: 'ccc', textColor: '969696', text: 'Hello' })
    const { formData } = lastCall()
    expect(formData.get('text')).toBe('Hello')
  })
})

describe('svg', () => {
  it('svgOptimize posts to /svg/optimize', async () => {
    mockFetchOk()
    const f = file('logo.svg', 'image/svg+xml')
    await api.svgOptimize(f)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/svg/optimize')
    expect(formData.get('file')).toBe(f)
  })

  it('svgConvert sends the direction and an optional width', async () => {
    mockFetchOk()
    await api.svgConvert(file('logo.svg', 'image/svg+xml'), 'svg-to-png', 200)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/svg/convert')
    expect(formData.get('direction')).toBe('svg-to-png')
    expect(formData.get('width')).toBe('200')
  })

  it('svgConvert omits width when not provided', async () => {
    mockFetchOk()
    await api.svgConvert(file('icon.png', 'image/png'), 'png-to-svg')
    const { formData } = lastCall()
    expect(formData.has('width')).toBe(false)
  })
})

describe('analysis', () => {
  it('colorPalette parses the colors array', async () => {
    mockFetchOk({ colors: [{ hex: '#ff0000', rgb: [255, 0, 0], percentage: 100 }] })
    const result = await api.colorPalette(file(), 5)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/analysis/palette')
    expect(formData.get('num_colors')).toBe('5')
    expect(result.colors[0].hex).toBe('#ff0000')
  })

  it('compareImages sends both images and parses the similarity score', async () => {
    mockFetchOk({ data_uri: 'data:image/png;base64,abc', similarity: 0.97 })
    const a = file('a.jpg')
    const b = file('b.jpg')
    const result = await api.compareImages(a, b)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/analysis/compare')
    expect(formData.get('image_a')).toBe(a)
    expect(formData.get('image_b')).toBe(b)
    expect(result.similarity).toBe(0.97)
  })
})

describe('video', () => {
  function video(name = 'clip.mp4') {
    return new File(['fake-video'], name, { type: 'video/mp4' })
  }

  it('trimVideo sends start and end', async () => {
    mockFetchOk()
    await api.trimVideo(video(), 1, 5)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/trim')
    expect(formData.get('start')).toBe('1')
    expect(formData.get('end')).toBe('5')
  })

  it('videoToGif sends every parameter', async () => {
    mockFetchOk()
    await api.videoToGif(video(), 0, 3, 12, 480)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/to-gif')
    expect(formData.get('duration')).toBe('3')
    expect(formData.get('fps')).toBe('12')
    expect(formData.get('width')).toBe('480')
  })

  it('convertVideo sends the target format', async () => {
    mockFetchOk()
    await api.convertVideo(video(), 'webm')
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/convert')
    expect(formData.get('target_format')).toBe('webm')
  })

  it('compressVideo omits unset optional fields', async () => {
    mockFetchOk()
    await api.compressVideo(video(), 500)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/compress')
    expect(formData.get('bitrate_kbps')).toBe('500')
    expect(formData.has('width')).toBe(false)
  })

  it('extractFrame sends the timestamp', async () => {
    mockFetchOk()
    await api.extractFrame(video(), 2.5)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/extract-frame')
    expect(formData.get('timestamp')).toBe('2.5')
  })

  it('concatVideos appends every clip under the same field name', async () => {
    mockFetchOk()
    const a = video('a.mp4')
    const b = video('b.mp4')
    await api.concatVideos([a, b])
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/concat')
    expect(formData.getAll('videos')).toEqual([a, b])
  })

  it('audioTrack omits the audio file for the remove action', async () => {
    mockFetchOk()
    await api.audioTrack(video(), 'remove')
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/audio-track')
    expect(formData.get('action')).toBe('remove')
    expect(formData.has('audio')).toBe(false)
  })

  it('audioTrack includes the audio file for the replace action', async () => {
    mockFetchOk()
    const audio = new File(['fake-audio'], 'audio.aac', { type: 'audio/aac' })
    await api.audioTrack(video(), 'replace', audio)
    const { formData } = lastCall()
    expect(formData.get('audio')).toBe(audio)
  })

  it('extractAudio sends the target format', async () => {
    mockFetchOk()
    await api.extractAudio(video(), 'wav')
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/extract-audio')
    expect(formData.get('target_format')).toBe('wav')
  })

  it('changeSpeed sends the speed', async () => {
    mockFetchOk()
    await api.changeSpeed(video(), 1.5)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/speed')
    expect(formData.get('speed')).toBe('1.5')
  })

  it('burnSubtitles sends the video and the srt file', async () => {
    mockFetchOk()
    const srt = new File(['1\n00:00:00,000 --> 00:00:01,000\nHi'], 'subs.srt', { type: 'text/plain' })
    await api.burnSubtitles(video(), srt)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/subtitles')
    expect(formData.get('srt')).toBe(srt)
  })

  it('createLoop sends the fade duration', async () => {
    mockFetchOk()
    await api.createLoop(video(), 1.5)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/loop')
    expect(formData.get('fade_duration')).toBe('1.5')
  })

  it('waveform sends width and height', async () => {
    mockFetchOk()
    await api.waveform(video(), 1000, 200)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/videos/waveform')
    expect(formData.get('width')).toBe('1000')
    expect(formData.get('height')).toBe('200')
  })
})

describe('misc', () => {
  it('qrcode sends the data and box size', async () => {
    mockFetchOk()
    await api.qrcode('https://example.com', 10)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/misc/qrcode')
    expect(formData.get('data')).toBe('https://example.com')
    expect(formData.get('box_size')).toBe('10')
  })

  it('imagesToPdf appends every image under the same field name', async () => {
    mockFetchOk()
    const a = file('a.jpg')
    const b = file('b.jpg')
    await api.imagesToPdf([a, b])
    const { url, formData } = lastCall()
    expect(url).toBe('/api/misc/images-to-pdf')
    expect(formData.getAll('images')).toEqual([a, b])
  })

  it('pdfToImages sends the file and dpi', async () => {
    mockFetchOk()
    const pdf = file('doc.pdf', 'application/pdf')
    await api.pdfToImages(pdf, 300)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/misc/pdf-to-images')
    expect(formData.get('file')).toBe(pdf)
    expect(formData.get('dpi')).toBe('300')
  })

  it('renameFiles sends the pattern and start index', async () => {
    mockFetchOk()
    const a = file('a.jpg')
    await api.renameFiles([a], 'photo-{n:03d}', 5)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/misc/rename')
    expect(formData.getAll('files')).toEqual([a])
    expect(formData.get('pattern')).toBe('photo-{n:03d}')
    expect(formData.get('start')).toBe('5')
  })

  it('mergePdf appends every file under the same field name', async () => {
    mockFetchOk()
    const a = file('a.pdf', 'application/pdf')
    const b = file('b.pdf', 'application/pdf')
    await api.mergePdf([a, b])
    const { url, formData } = lastCall()
    expect(url).toBe('/api/misc/merge-pdf')
    expect(formData.getAll('files')).toEqual([a, b])
  })

  it('compressPdf posts to /misc/compress-pdf', async () => {
    mockFetchOk()
    const pdf = file('doc.pdf', 'application/pdf')
    await api.compressPdf(pdf)
    const { url, formData } = lastCall()
    expect(url).toBe('/api/misc/compress-pdf')
    expect(formData.get('file')).toBe(pdf)
  })

  it('computeHash parses the md5/sha256 response', async () => {
    mockFetchOk({ md5: 'abc', sha256: 'def' })
    const result = await api.computeHash(file())
    expect(lastCall().url).toBe('/api/misc/hash')
    expect(result.md5).toBe('abc')
    expect(result.sha256).toBe('def')
  })

  it('contrastRatio sends both colors and parses the result', async () => {
    mockFetchOk({ ratio: 21, aa_normal_text: true, aa_large_text: true, aaa_normal_text: true, aaa_large_text: true })
    const result = await api.contrastRatio('000000', 'ffffff')
    const { url, formData } = lastCall()
    expect(url).toBe('/api/misc/contrast')
    expect(formData.get('color_a')).toBe('000000')
    expect(formData.get('color_b')).toBe('ffffff')
    expect(result.ratio).toBe(21)
  })
})
