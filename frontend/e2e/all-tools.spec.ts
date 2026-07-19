import { expect, test, type Page } from '@playwright/test'

// One real-browser happy-path pass per tool page: navigate, upload real file
// input(s) (or fill the rare no-file form), mock the network response, submit,
// and check the success UI renders. jsdom-based pages.functional.test.tsx
// already exercises every branch/argument exhaustively — this suite exists to
// catch what only a real browser can (real Radix Select/Dropzone rendering,
// real disabled-state reflection, real focus/DOM/CSS), which is exactly the
// class of bug that slipped through jsdom (the icon-pack "Slot" crash, the
// sidebar scroll coupling).

interface FileSpec {
  name: string
  mimeType: string
}

interface ToolCase {
  name: string
  path: string
  apiPath: string
  submitName: string | RegExp
  files: FileSpec[][] // one array per file input, in DOM order; each inner array may hold >1 file for multi-upload inputs
  fillText?: { label: string; value: string }
  response: { contentType: string; body: string | Buffer }
  verify: (page: Page) => Promise<void>
}

const img = (name = 'a.png'): FileSpec => ({ name, mimeType: 'image/png' })
const svg = (name = 'a.svg'): FileSpec => ({ name, mimeType: 'image/svg+xml' })
const video = (name = 'v.mp4'): FileSpec => ({ name, mimeType: 'video/mp4' })
const pdf = (name = 'doc.pdf'): FileSpec => ({ name, mimeType: 'application/pdf' })
const srt = (name = 's.srt'): FileSpec => ({ name, mimeType: 'text/plain' })

function blobResponse(contentType: string): ToolCase['response'] {
  return { contentType, body: Buffer.from('fake-bytes') }
}

function jsonResponse(data: unknown): ToolCase['response'] {
  return { contentType: 'application/json', body: JSON.stringify(data) }
}

async function expectDownloadButton(page: Page) {
  await expect(page.getByRole('button', { name: /Télécharger/ })).toBeVisible()
}

const cases: ToolCase[] = [
  // --- Retouche d'image ---
  {
    name: 'RemoveBackground',
    path: '/remove-background',
    apiPath: '**/api/background/remove',
    submitName: 'Supprimer le fond',
    files: [[img()]],
    response: blobResponse('image/png'),
    verify: expectDownloadButton,
  },
  {
    name: 'CropImage',
    path: '/crop-image',
    apiPath: '**/api/images/crop',
    submitName: 'Rogner',
    files: [[img()]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'ResizeImage',
    path: '/resize-image',
    apiPath: '**/api/images/resize',
    submitName: 'Redimensionner',
    files: [[img()]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'RotateFlipImage',
    path: '/rotate-flip-image',
    apiPath: '**/api/images/rotate-flip',
    submitName: 'Appliquer',
    files: [[img()]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'Deskew',
    path: '/deskew',
    apiPath: '**/api/advanced/deskew',
    submitName: 'Redresser',
    files: [[img()]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'Denoise',
    path: '/denoise',
    apiPath: '**/api/advanced/denoise',
    submitName: 'Réduire le bruit',
    files: [[img()]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'CompressImage',
    path: '/compress-image',
    apiPath: '**/api/images/compress',
    submitName: 'Compresser',
    files: [[img()]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'ConvertImage',
    path: '/convert-image',
    apiPath: '**/api/images/convert',
    submitName: 'Convertir',
    files: [[img()]],
    response: blobResponse('image/png'),
    verify: expectDownloadButton,
  },
  {
    name: 'Watermark',
    path: '/watermark',
    apiPath: '**/api/images/watermark',
    submitName: 'Appliquer',
    files: [[img()]],
    fillText: { label: 'Texte', value: 'Copyright' },
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'AdjustImages',
    path: '/adjust-images',
    apiPath: '**/api/images/adjust',
    submitName: 'Appliquer',
    files: [[img()]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'StripExif',
    path: '/strip-exif',
    apiPath: '**/api/advanced/strip-exif',
    submitName: 'Supprimer les métadonnées',
    files: [[img()]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'ExtractExif',
    path: '/extract-exif',
    apiPath: '**/api/advanced/extract-exif',
    submitName: 'Extraire',
    files: [[img()]],
    response: jsonResponse({ metadata: { Make: 'Test Camera' } }),
    verify: async (page) => {
      await expect(page.getByText('Test Camera')).toBeVisible()
    },
  },
  {
    name: 'ContactSheet',
    path: '/contact-sheet',
    apiPath: '**/api/advanced/contact-sheet',
    submitName: 'Générer',
    files: [[img('a.png'), img('b.png')]],
    response: blobResponse('image/jpeg'),
    verify: expectDownloadButton,
  },
  // --- Uniformisation par lot ---
  {
    name: 'ColorMatch',
    path: '/color-match',
    apiPath: '**/api/images/color-match',
    submitName: 'Uniformiser',
    files: [[img('ref.png')], [img('a.png')]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'BrightnessMatch',
    path: '/brightness-match',
    apiPath: '**/api/images/normalize-brightness',
    submitName: 'Uniformiser',
    files: [[img('a.png'), img('b.png')]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  // --- Assets pour le développement web ---
  {
    name: 'Srcset',
    path: '/srcset',
    apiPath: '**/api/assets/srcset',
    submitName: 'Générer',
    files: [[img()]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'Lqip',
    path: '/lqip',
    apiPath: '**/api/assets/lqip',
    submitName: 'Générer',
    files: [[img()]],
    response: jsonResponse({ data_uri: 'data:image/png;base64,AAAA' }),
    verify: async (page) => {
      await expect(page.getByAltText('Placeholder flou')).toBeVisible()
    },
  },
  {
    name: 'Base64Encode',
    path: '/base64-encode',
    apiPath: '**/api/assets/base64',
    submitName: 'Encoder',
    files: [[img()]],
    response: jsonResponse({ data_uri: 'data:image/png;base64,AAAA' }),
    verify: async (page) => {
      await expect(page.getByAltText('Aperçu')).toBeVisible()
    },
  },
  {
    name: 'Spritesheet',
    path: '/spritesheet',
    apiPath: '**/api/assets/spritesheet',
    submitName: 'Assembler',
    files: [[img('a.png'), img('b.png')]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'SvgOptimize',
    path: '/svg-optimize',
    apiPath: '**/api/svg/optimize',
    submitName: 'Optimiser',
    files: [[svg()]],
    response: blobResponse('image/svg+xml'),
    verify: expectDownloadButton,
  },
  {
    name: 'SvgConvert',
    path: '/svg-convert',
    apiPath: '**/api/svg/convert',
    submitName: 'Convertir',
    files: [[svg()]],
    response: blobResponse('image/png'),
    verify: expectDownloadButton,
  },
  {
    name: 'SocialFormats',
    path: '/social-formats',
    apiPath: '**/api/assets/social-formats',
    submitName: 'Générer',
    files: [[img()]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'Placeholder',
    path: '/placeholder',
    apiPath: '**/api/assets/placeholder',
    submitName: 'Générer',
    files: [],
    response: blobResponse('image/png'),
    verify: expectDownloadButton,
  },
  // --- Analyse d'image ---
  {
    name: 'ColorPalette',
    path: '/color-palette',
    apiPath: '**/api/analysis/palette',
    submitName: 'Extraire',
    files: [[img()]],
    response: jsonResponse({ colors: [{ hex: '#ff0000', rgb: [255, 0, 0], percentage: 42 }] }),
    verify: async (page) => {
      await expect(page.getByText(/#ff0000/)).toBeVisible()
    },
  },
  {
    name: 'CompareImages',
    path: '/compare-images',
    apiPath: '**/api/analysis/compare',
    submitName: 'Comparer',
    files: [[img('a.png')], [img('b.png')]],
    response: jsonResponse({ data_uri: 'data:image/png;base64,AAAA', similarity: 0.87 }),
    verify: async (page) => {
      await expect(page.getByText(/87\.0%/)).toBeVisible()
    },
  },
  // --- Vidéo ---
  {
    name: 'TrimVideo',
    path: '/trim-video',
    apiPath: '**/api/videos/trim',
    submitName: 'Couper',
    files: [[video()]],
    response: blobResponse('video/mp4'),
    verify: expectDownloadButton,
  },
  {
    name: 'VideoToGif',
    path: '/video-to-gif',
    apiPath: '**/api/videos/to-gif',
    submitName: 'Générer le GIF',
    files: [[video()]],
    response: blobResponse('image/gif'),
    verify: expectDownloadButton,
  },
  {
    name: 'ConvertVideo',
    path: '/convert-video',
    apiPath: '**/api/videos/convert',
    submitName: 'Convertir',
    files: [[video()]],
    response: blobResponse('video/webm'),
    verify: expectDownloadButton,
  },
  {
    name: 'CompressVideo',
    path: '/compress-video',
    apiPath: '**/api/videos/compress',
    submitName: 'Compresser',
    files: [[video()]],
    response: blobResponse('video/mp4'),
    verify: expectDownloadButton,
  },
  {
    name: 'ExtractFrame',
    path: '/extract-frame',
    apiPath: '**/api/videos/extract-frame',
    submitName: 'Extraire',
    files: [[video()]],
    response: blobResponse('image/png'),
    verify: expectDownloadButton,
  },
  {
    name: 'ConcatVideos',
    path: '/concat-videos',
    apiPath: '**/api/videos/concat',
    submitName: 'Concaténer',
    files: [[video('a.mp4'), video('b.mp4')]],
    response: blobResponse('video/mp4'),
    verify: expectDownloadButton,
  },
  {
    name: 'AudioTrack',
    path: '/audio-track',
    apiPath: '**/api/videos/audio-track',
    submitName: 'Appliquer',
    files: [[video()]],
    response: blobResponse('video/mp4'),
    verify: expectDownloadButton,
  },
  {
    name: 'ExtractAudio',
    path: '/extract-audio',
    apiPath: '**/api/videos/extract-audio',
    submitName: 'Extraire',
    files: [[video()]],
    response: blobResponse('audio/mpeg'),
    verify: expectDownloadButton,
  },
  {
    name: 'VideoSpeed',
    path: '/video-speed',
    apiPath: '**/api/videos/speed',
    submitName: 'Appliquer',
    files: [[video()]],
    response: blobResponse('video/mp4'),
    verify: expectDownloadButton,
  },
  {
    name: 'Subtitles',
    path: '/subtitles',
    apiPath: '**/api/videos/subtitles',
    submitName: 'Incruster',
    files: [[video()], [srt()]],
    response: blobResponse('video/mp4'),
    verify: expectDownloadButton,
  },
  {
    name: 'VideoLoop',
    path: '/video-loop',
    apiPath: '**/api/videos/loop',
    submitName: 'Générer',
    files: [[video()]],
    response: blobResponse('video/mp4'),
    verify: expectDownloadButton,
  },
  {
    name: 'Waveform',
    path: '/waveform',
    apiPath: '**/api/videos/waveform',
    submitName: 'Générer',
    files: [[video()]],
    response: blobResponse('image/png'),
    verify: expectDownloadButton,
  },
  // --- Documents & utilitaires ---
  {
    name: 'ImagesToPdf',
    path: '/images-to-pdf',
    apiPath: '**/api/misc/images-to-pdf',
    submitName: 'Convertir',
    files: [[img()]],
    response: blobResponse('application/pdf'),
    verify: expectDownloadButton,
  },
  {
    name: 'PdfToImages',
    path: '/pdf-to-images',
    apiPath: '**/api/misc/pdf-to-images',
    submitName: 'Extraire',
    files: [[pdf()]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'MergePdf',
    path: '/merge-pdf',
    apiPath: '**/api/misc/merge-pdf',
    submitName: 'Fusionner',
    files: [[pdf('a.pdf'), pdf('b.pdf')]],
    response: blobResponse('application/pdf'),
    verify: expectDownloadButton,
  },
  {
    name: 'CompressPdf',
    path: '/compress-pdf',
    apiPath: '**/api/misc/compress-pdf',
    submitName: 'Compresser',
    files: [[pdf()]],
    response: blobResponse('application/pdf'),
    verify: expectDownloadButton,
  },
  {
    name: 'RenameFiles',
    path: '/rename-files',
    apiPath: '**/api/misc/rename',
    submitName: 'Renommer',
    files: [[img()]],
    response: blobResponse('application/zip'),
    verify: expectDownloadButton,
  },
  {
    name: 'FileHash',
    path: '/file-hash',
    apiPath: '**/api/misc/hash',
    submitName: 'Calculer',
    files: [[img()]],
    response: jsonResponse({ md5: 'abc123', sha256: 'def456' }),
    verify: async (page) => {
      await expect(page.getByText('abc123')).toBeVisible()
    },
  },
]

for (const tc of cases) {
  test(`${tc.name}: real-browser happy path`, async ({ page }) => {
    await page.route(tc.apiPath, async (route) => {
      await route.fulfill({ status: 200, contentType: tc.response.contentType, body: tc.response.body })
    })

    await page.goto(tc.path)

    const fileInputs = page.locator('input[type="file"]')
    for (let i = 0; i < tc.files.length; i++) {
      await fileInputs
        .nth(i)
        .setInputFiles(tc.files[i].map((s) => ({ name: s.name, mimeType: s.mimeType, buffer: Buffer.from('fake-data') })))
    }

    if (tc.fillText) {
      await page.getByLabel(tc.fillText.label).fill(tc.fillText.value)
    }

    await page.getByRole('button', { name: tc.submitName }).click()
    await tc.verify(page)
  })
}

// --- Pages with no file-based happy path above, tested individually ---

test('QrCode: real-browser happy path', async ({ page }) => {
  await page.route('**/api/misc/qrcode', async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('fake-bytes') })
  })
  await page.goto('/qrcode')
  await page.getByLabel('Texte ou URL').fill('https://example.com')
  await page.getByRole('button', { name: 'Générer' }).click()
  await expectDownloadButton(page)
})

test('ContrastChecker: real-browser happy path', async ({ page }) => {
  await page.route('**/api/misc/contrast', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ratio: 21,
        aa_normal_text: true,
        aa_large_text: true,
        aaa_normal_text: true,
        aaa_large_text: true,
      }),
    })
  })
  await page.goto('/contrast-checker')
  await page.getByRole('button', { name: 'Vérifier' }).click()
  await expect(page.getByText('21:1', { exact: false })).toBeVisible()
})

test('IconPack: generates the favicon end-to-end', async ({ page }) => {
  await page.route('**/api/assets/favicon', async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/x-icon', body: Buffer.from('fake-bytes') })
  })
  await page.goto('/icon-pack')
  await page.locator('input[type="file"]').nth(0).setInputFiles({
    name: 'a.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-data'),
  })
  await page.getByRole('button', { name: 'Générer favicon.ico' }).click()
  await expectDownloadButton(page)
})

test('IconPack: generates the full pack end-to-end (the original bug report scenario)', async ({ page }) => {
  await page.route('**/api/assets/icon-pack', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/zip', body: Buffer.from('fake-bytes') })
  })
  await page.goto('/icon-pack')
  await page.locator('input[type="file"]').nth(0).setInputFiles({
    name: 'a.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-data'),
  })
  await page.getByRole('button', { name: /Générer le pack complet/ }).click()
  await expectDownloadButton(page)
})
