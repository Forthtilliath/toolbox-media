import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { api } from '../api/client'
import AdjustImages from './AdjustImages'
import AudioTrack from './AudioTrack'
import Base64Encode from './Base64Encode'
import BrightnessMatch from './BrightnessMatch'
import ColorMatch from './ColorMatch'
import ColorPalette from './ColorPalette'
import CompareImages from './CompareImages'
import CompressImage from './CompressImage'
import CompressPdf from './CompressPdf'
import CompressVideo from './CompressVideo'
import ConcatVideos from './ConcatVideos'
import ContactSheet from './ContactSheet'
import ContrastChecker from './ContrastChecker'
import ConvertImage from './ConvertImage'
import ConvertVideo from './ConvertVideo'
import CropImage from './CropImage'
import Denoise from './Denoise'
import Deskew from './Deskew'
import ExtractAudio from './ExtractAudio'
import ExtractExif from './ExtractExif'
import ExtractFrame from './ExtractFrame'
import FileHash from './FileHash'
import IconPack from './IconPack'
import ImagesToPdf from './ImagesToPdf'
import Lqip from './Lqip'
import MergePdf from './MergePdf'
import PdfToImages from './PdfToImages'
import Placeholder from './Placeholder'
import QrCode from './QrCode'
import RemoveBackground from './RemoveBackground'
import RenameFiles from './RenameFiles'
import ResizeImage from './ResizeImage'
import RotateFlipImage from './RotateFlipImage'
import SocialFormats from './SocialFormats'
import Spritesheet from './Spritesheet'
import Srcset from './Srcset'
import StripExif from './StripExif'
import Subtitles from './Subtitles'
import SvgConvert from './SvgConvert'
import SvgOptimize from './SvgOptimize'
import TrimVideo from './TrimVideo'
import VideoLoop from './VideoLoop'
import VideoSpeed from './VideoSpeed'
import VideoToGif from './VideoToGif'
import Watermark from './Watermark'
import Waveform from './Waveform'

vi.mock('../api/client', () => ({
  api: {
    removeBackground: vi.fn(),
    compressImage: vi.fn(),
    convertImage: vi.fn(),
    colorMatch: vi.fn(),
    normalizeBrightness: vi.fn(),
    cropImage: vi.fn(),
    resizeImage: vi.fn(),
    rotateFlipImage: vi.fn(),
    watermarkImages: vi.fn(),
    adjustImages: vi.fn(),
    favicon: vi.fn(),
    iconPack: vi.fn(),
    srcset: vi.fn(),
    lqip: vi.fn(),
    base64Encode: vi.fn(),
    spritesheet: vi.fn(),
    socialFormats: vi.fn(),
    placeholder: vi.fn(),
    svgOptimize: vi.fn(),
    svgConvert: vi.fn(),
    colorPalette: vi.fn(),
    compareImages: vi.fn(),
    stripExif: vi.fn(),
    extractExif: vi.fn(),
    deskewImage: vi.fn(),
    denoiseImage: vi.fn(),
    contactSheet: vi.fn(),
    trimVideo: vi.fn(),
    videoToGif: vi.fn(),
    convertVideo: vi.fn(),
    compressVideo: vi.fn(),
    extractFrame: vi.fn(),
    concatVideos: vi.fn(),
    audioTrack: vi.fn(),
    extractAudio: vi.fn(),
    changeSpeed: vi.fn(),
    burnSubtitles: vi.fn(),
    createLoop: vi.fn(),
    waveform: vi.fn(),
    qrcode: vi.fn(),
    imagesToPdf: vi.fn(),
    pdfToImages: vi.fn(),
    renameFiles: vi.fn(),
    mergePdf: vi.fn(),
    compressPdf: vi.fn(),
    computeHash: vi.fn(),
    contrastRatio: vi.fn(),
  },
}))

const mockApi = api as unknown as Record<string, Mock>

beforeEach(() => {
  vi.clearAllMocks()
})

function renderPage(Component: React.ComponentType) {
  return render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>,
  )
}

function makeFile(name = 'test.png', type = 'image/png') {
  return new File(['fake-content'], name, { type })
}

function fileInputs(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="file"]'))
}

function selects(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLSelectElement>('select'))
}

function selectFiles(input: HTMLInputElement, files: File[] = [makeFile()]) {
  fireEvent.change(input, { target: { files } })
}

/** Radix Select renders a hidden native <select> synced to its value — changing it drives onValueChange. */
function chooseOption(select: HTMLSelectElement, value: string) {
  fireEvent.change(select, { target: { value } })
}

function blob() {
  return new Blob(['fake-result'])
}

const F = expect.any(File) as unknown as File

interface Case {
  name: string
  Component: React.ComponentType
  apiMethod: string
  resolvedValue: unknown
  submitName: string | RegExp
  selectInputs: (container: HTMLElement) => void
  expectedArgs: unknown[]
  successCheck: (container: HTMLElement) => Promise<unknown>
}

function expectDownloadButton(_container: HTMLElement) {
  return screen.findByRole('button', { name: /Télécharger/i })
}

const cases: Case[] = [
  // --- Retouche d'image ---
  {
    name: 'RemoveBackground',
    Component: RemoveBackground,
    apiMethod: 'removeBackground',
    resolvedValue: blob(),
    submitName: 'Supprimer le fond',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, false],
    successCheck: expectDownloadButton,
  },
  {
    name: 'CropImage (ratio mode, default)',
    Component: CropImage,
    apiMethod: 'cropImage',
    resolvedValue: blob(),
    submitName: 'Rogner',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, { ratio: '1:1' }],
    successCheck: expectDownloadButton,
  },
  {
    name: 'CropImage (manual mode)',
    Component: CropImage,
    apiMethod: 'cropImage',
    resolvedValue: blob(),
    submitName: 'Rogner',
    selectInputs: (c) => {
      selectFiles(fileInputs(c)[0])
      chooseOption(selects(c)[0], 'manual')
    },
    expectedArgs: [F, { x: 0, y: 0, width: 200, height: 200 }],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ResizeImage (percent mode, default)',
    Component: ResizeImage,
    apiMethod: 'resizeImage',
    resolvedValue: blob(),
    submitName: 'Redimensionner',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, { percent: 50, keepRatio: true }],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ResizeImage (dimensions mode)',
    Component: ResizeImage,
    apiMethod: 'resizeImage',
    resolvedValue: blob(),
    submitName: 'Redimensionner',
    selectInputs: (c) => {
      selectFiles(fileInputs(c)[0])
      chooseOption(selects(c)[0], 'dimensions')
      fireEvent.change(screen.getByLabelText('Largeur (px)'), { target: { value: '300' } })
    },
    expectedArgs: [F, { width: 300, height: undefined, keepRatio: true }],
    successCheck: expectDownloadButton,
  },
  {
    name: 'RotateFlipImage',
    Component: RotateFlipImage,
    apiMethod: 'rotateFlipImage',
    resolvedValue: blob(),
    submitName: 'Appliquer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, 0, false, false],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Deskew',
    Component: Deskew,
    apiMethod: 'deskewImage',
    resolvedValue: blob(),
    submitName: 'Redresser',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Denoise',
    Component: Denoise,
    apiMethod: 'denoiseImage',
    resolvedValue: blob(),
    submitName: 'Réduire le bruit',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, 10],
    successCheck: expectDownloadButton,
  },
  {
    name: 'CompressImage',
    Component: CompressImage,
    apiMethod: 'compressImage',
    resolvedValue: blob(),
    submitName: 'Compresser',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, 80],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ConvertImage',
    Component: ConvertImage,
    apiMethod: 'convertImage',
    resolvedValue: blob(),
    submitName: 'Convertir',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, 'png'],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Watermark (text mode, default)',
    Component: Watermark,
    apiMethod: 'watermarkImages',
    resolvedValue: blob(),
    submitName: 'Appliquer',
    selectInputs: (c) => {
      selectFiles(fileInputs(c)[0], [makeFile('a.png'), makeFile('b.png')])
      fireEvent.change(screen.getByLabelText('Texte'), { target: { value: 'Copyright' } })
    },
    expectedArgs: [[F, F], { text: 'Copyright', logo: undefined, opacity: 70, position: 'bottom-right' }],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Watermark (logo mode)',
    Component: Watermark,
    apiMethod: 'watermarkImages',
    resolvedValue: blob(),
    submitName: 'Appliquer',
    selectInputs: (c) => {
      selectFiles(fileInputs(c)[0], [makeFile('a.png'), makeFile('b.png')])
      chooseOption(selects(c)[0], 'logo')
      selectFiles(fileInputs(c)[1])
    },
    expectedArgs: [[F, F], { text: undefined, logo: F, opacity: 70, position: 'bottom-right' }],
    successCheck: expectDownloadButton,
  },
  {
    name: 'AdjustImages',
    Component: AdjustImages,
    apiMethod: 'adjustImages',
    resolvedValue: blob(),
    submitName: 'Appliquer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('a.png'), makeFile('b.png')]),
    expectedArgs: [[F, F], 1, 1, 1],
    successCheck: expectDownloadButton,
  },
  {
    name: 'StripExif',
    Component: StripExif,
    apiMethod: 'stripExif',
    resolvedValue: blob(),
    submitName: 'Supprimer les métadonnées',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ExtractExif',
    Component: ExtractExif,
    apiMethod: 'extractExif',
    resolvedValue: { metadata: { Make: 'Test Camera' } },
    submitName: 'Extraire',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F],
    successCheck: async (c) => {
      await waitFor(() => expect(c.textContent).toContain('Test Camera'))
    },
  },
  {
    name: 'ContactSheet',
    Component: ContactSheet,
    apiMethod: 'contactSheet',
    resolvedValue: blob(),
    submitName: 'Générer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('a.png'), makeFile('b.png')]),
    expectedArgs: [[F, F], 4, 200],
    successCheck: expectDownloadButton,
  },
  // --- Uniformisation par lot ---
  {
    name: 'ColorMatch',
    Component: ColorMatch,
    apiMethod: 'colorMatch',
    resolvedValue: blob(),
    submitName: 'Uniformiser',
    selectInputs: (c) => {
      selectFiles(fileInputs(c)[0])
      selectFiles(fileInputs(c)[1], [makeFile('a.png'), makeFile('b.png')])
    },
    expectedArgs: [F, [F, F]],
    successCheck: expectDownloadButton,
  },
  {
    name: 'BrightnessMatch (average mode, default)',
    Component: BrightnessMatch,
    apiMethod: 'normalizeBrightness',
    resolvedValue: blob(),
    submitName: 'Uniformiser',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('a.png'), makeFile('b.png')]),
    expectedArgs: [[F, F], null],
    successCheck: expectDownloadButton,
  },
  {
    name: 'BrightnessMatch (reference mode)',
    Component: BrightnessMatch,
    apiMethod: 'normalizeBrightness',
    resolvedValue: blob(),
    submitName: 'Uniformiser',
    selectInputs: (c) => {
      chooseOption(selects(c)[0], 'reference')
      selectFiles(fileInputs(c)[0])
      selectFiles(fileInputs(c)[1], [makeFile('a.png'), makeFile('b.png')])
    },
    expectedArgs: [[F, F], F],
    successCheck: expectDownloadButton,
  },
  // --- Assets pour le développement web ---
  {
    name: 'Srcset',
    Component: Srcset,
    apiMethod: 'srcset',
    resolvedValue: blob(),
    submitName: 'Générer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, [320, 640, 960, 1280, 1920]],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Lqip',
    Component: Lqip,
    apiMethod: 'lqip',
    resolvedValue: { data_uri: 'data:image/png;base64,fake' },
    submitName: 'Générer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F],
    successCheck: async () => {
      await screen.findByAltText('Placeholder flou')
    },
  },
  {
    name: 'Base64Encode',
    Component: Base64Encode,
    apiMethod: 'base64Encode',
    resolvedValue: { data_uri: 'data:image/png;base64,fake' },
    submitName: 'Encoder',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F],
    successCheck: async () => {
      await screen.findByAltText('Aperçu')
    },
  },
  {
    name: 'Spritesheet',
    Component: Spritesheet,
    apiMethod: 'spritesheet',
    resolvedValue: blob(),
    submitName: 'Assembler',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('a.png'), makeFile('b.png')]),
    expectedArgs: [[F, F]],
    successCheck: expectDownloadButton,
  },
  {
    name: 'SvgOptimize',
    Component: SvgOptimize,
    apiMethod: 'svgOptimize',
    resolvedValue: blob(),
    submitName: 'Optimiser',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('a.svg', 'image/svg+xml')]),
    expectedArgs: [F],
    successCheck: expectDownloadButton,
  },
  {
    name: 'SvgConvert (svg-to-png, default)',
    Component: SvgConvert,
    apiMethod: 'svgConvert',
    resolvedValue: blob(),
    submitName: 'Convertir',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('a.svg', 'image/svg+xml')]),
    expectedArgs: [F, 'svg-to-png', undefined],
    successCheck: expectDownloadButton,
  },
  {
    name: 'SvgConvert (png-to-svg)',
    Component: SvgConvert,
    apiMethod: 'svgConvert',
    resolvedValue: blob(),
    submitName: 'Convertir',
    selectInputs: (c) => {
      chooseOption(selects(c)[0], 'png-to-svg')
      selectFiles(fileInputs(c)[0])
    },
    expectedArgs: [F, 'png-to-svg', undefined],
    successCheck: expectDownloadButton,
  },
  {
    name: 'SocialFormats',
    Component: SocialFormats,
    apiMethod: 'socialFormats',
    resolvedValue: blob(),
    submitName: 'Générer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Placeholder',
    Component: Placeholder,
    apiMethod: 'placeholder',
    resolvedValue: blob(),
    submitName: 'Générer',
    selectInputs: () => {
      // No file required — every field already has a usable default.
    },
    expectedArgs: [{ width: 800, height: 600, bgColor: 'cccccc', textColor: '969696', text: undefined }],
    successCheck: expectDownloadButton,
  },
  // --- Analyse d'image ---
  {
    name: 'ColorPalette',
    Component: ColorPalette,
    apiMethod: 'colorPalette',
    resolvedValue: { colors: [{ hex: '#ff0000', rgb: [255, 0, 0], percentage: 42 }] },
    submitName: 'Extraire',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F, 5],
    successCheck: async (c) => {
      await waitFor(() => expect(c.textContent).toContain('#ff0000'))
    },
  },
  {
    name: 'CompareImages',
    Component: CompareImages,
    apiMethod: 'compareImages',
    resolvedValue: { data_uri: 'data:image/png;base64,fake', similarity: 0.87 },
    submitName: 'Comparer',
    selectInputs: (c) => {
      const inputs = fileInputs(c)
      selectFiles(inputs[0])
      selectFiles(inputs[1])
    },
    expectedArgs: [F, F],
    successCheck: async (c) => {
      await waitFor(() => expect(c.textContent).toContain('87.0%'))
    },
  },
  // --- Vidéo ---
  {
    name: 'TrimVideo',
    Component: TrimVideo,
    apiMethod: 'trimVideo',
    resolvedValue: blob(),
    submitName: 'Couper',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 0, 5],
    successCheck: expectDownloadButton,
  },
  {
    name: 'VideoToGif',
    Component: VideoToGif,
    apiMethod: 'videoToGif',
    resolvedValue: blob(),
    submitName: 'Générer le GIF',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 0, 3, 12, 480],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ConvertVideo',
    Component: ConvertVideo,
    apiMethod: 'convertVideo',
    resolvedValue: blob(),
    submitName: 'Convertir',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 'webm'],
    successCheck: expectDownloadButton,
  },
  {
    name: 'CompressVideo',
    Component: CompressVideo,
    apiMethod: 'compressVideo',
    resolvedValue: blob(),
    submitName: 'Compresser',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 1000, undefined],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ExtractFrame',
    Component: ExtractFrame,
    apiMethod: 'extractFrame',
    resolvedValue: blob(),
    submitName: 'Extraire',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 0],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ConcatVideos',
    Component: ConcatVideos,
    apiMethod: 'concatVideos',
    resolvedValue: blob(),
    submitName: 'Concaténer',
    selectInputs: (c) =>
      selectFiles(fileInputs(c)[0], [makeFile('a.mp4', 'video/mp4'), makeFile('b.mp4', 'video/mp4')]),
    expectedArgs: [[F, F]],
    successCheck: expectDownloadButton,
  },
  {
    name: 'AudioTrack (remove mode, default)',
    Component: AudioTrack,
    apiMethod: 'audioTrack',
    resolvedValue: blob(),
    submitName: 'Appliquer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 'remove', undefined],
    successCheck: expectDownloadButton,
  },
  {
    name: 'AudioTrack (replace mode)',
    Component: AudioTrack,
    apiMethod: 'audioTrack',
    resolvedValue: blob(),
    submitName: 'Appliquer',
    selectInputs: (c) => {
      selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')])
      chooseOption(selects(c)[0], 'replace')
      selectFiles(fileInputs(c)[1], [makeFile('a.aac', 'audio/aac')])
    },
    expectedArgs: [F, 'replace', F],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ExtractAudio',
    Component: ExtractAudio,
    apiMethod: 'extractAudio',
    resolvedValue: blob(),
    submitName: 'Extraire',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 'mp3'],
    successCheck: expectDownloadButton,
  },
  {
    name: 'VideoSpeed',
    Component: VideoSpeed,
    apiMethod: 'changeSpeed',
    resolvedValue: blob(),
    submitName: 'Appliquer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 1],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Subtitles',
    Component: Subtitles,
    apiMethod: 'burnSubtitles',
    resolvedValue: blob(),
    submitName: 'Incruster',
    selectInputs: (c) => {
      const inputs = fileInputs(c)
      selectFiles(inputs[0], [makeFile('v.mp4', 'video/mp4')])
      selectFiles(inputs[1], [makeFile('s.srt', 'text/plain')])
    },
    expectedArgs: [F, F],
    successCheck: expectDownloadButton,
  },
  {
    name: 'VideoLoop',
    Component: VideoLoop,
    apiMethod: 'createLoop',
    resolvedValue: blob(),
    submitName: 'Générer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 1],
    successCheck: expectDownloadButton,
  },
  {
    name: 'Waveform',
    Component: Waveform,
    apiMethod: 'waveform',
    resolvedValue: blob(),
    submitName: 'Générer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('v.mp4', 'video/mp4')]),
    expectedArgs: [F, 1280, 240],
    successCheck: expectDownloadButton,
  },
  // --- Documents & utilitaires ---
  {
    name: 'QrCode',
    Component: QrCode,
    apiMethod: 'qrcode',
    resolvedValue: blob(),
    submitName: 'Générer',
    selectInputs: () => {
      fireEvent.change(screen.getByLabelText('Texte ou URL'), { target: { value: 'https://example.com' } })
    },
    expectedArgs: ['https://example.com', 10],
    successCheck: expectDownloadButton,
  },
  {
    name: 'ImagesToPdf',
    Component: ImagesToPdf,
    apiMethod: 'imagesToPdf',
    resolvedValue: blob(),
    submitName: 'Convertir',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [[F]],
    successCheck: expectDownloadButton,
  },
  {
    name: 'PdfToImages',
    Component: PdfToImages,
    apiMethod: 'pdfToImages',
    resolvedValue: blob(),
    submitName: 'Extraire',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('doc.pdf', 'application/pdf')]),
    expectedArgs: [F, 150],
    successCheck: expectDownloadButton,
  },
  {
    name: 'MergePdf',
    Component: MergePdf,
    apiMethod: 'mergePdf',
    resolvedValue: blob(),
    submitName: 'Fusionner',
    selectInputs: (c) =>
      selectFiles(fileInputs(c)[0], [
        makeFile('a.pdf', 'application/pdf'),
        makeFile('b.pdf', 'application/pdf'),
      ]),
    expectedArgs: [[F, F]],
    successCheck: expectDownloadButton,
  },
  {
    name: 'CompressPdf',
    Component: CompressPdf,
    apiMethod: 'compressPdf',
    resolvedValue: blob(),
    submitName: 'Compresser',
    selectInputs: (c) => selectFiles(fileInputs(c)[0], [makeFile('doc.pdf', 'application/pdf')]),
    expectedArgs: [F],
    successCheck: expectDownloadButton,
  },
  {
    name: 'RenameFiles',
    Component: RenameFiles,
    apiMethod: 'renameFiles',
    resolvedValue: blob(),
    submitName: 'Renommer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [[F], 'fichier-{n:03d}', 1],
    successCheck: expectDownloadButton,
  },
  {
    name: 'FileHash',
    Component: FileHash,
    apiMethod: 'computeHash',
    resolvedValue: { md5: 'abc123', sha256: 'def456' },
    submitName: 'Calculer',
    selectInputs: (c) => selectFiles(fileInputs(c)[0]),
    expectedArgs: [F],
    successCheck: async (c) => {
      await waitFor(() => expect(c.textContent).toContain('abc123'))
    },
  },
  {
    name: 'ContrastChecker',
    Component: ContrastChecker,
    apiMethod: 'contrastRatio',
    resolvedValue: {
      ratio: 21,
      aa_normal_text: true,
      aa_large_text: true,
      aaa_normal_text: true,
      aaa_large_text: true,
    },
    submitName: 'Vérifier',
    selectInputs: () => {
      // No file required — default colors are valid.
    },
    expectedArgs: ['000000', 'ffffff'],
    successCheck: async (c) => {
      await waitFor(() => expect(c.textContent).toContain('21:1'))
    },
  },
]

describe.each(cases)(
  '$name',
  ({ Component, apiMethod, resolvedValue, submitName, selectInputs, expectedArgs, successCheck }) => {
    it('calls the API with the expected arguments and shows the result on success', async () => {
      mockApi[apiMethod].mockResolvedValueOnce(resolvedValue)
      const { container } = renderPage(Component)
      selectInputs(container)
      fireEvent.click(screen.getByRole('button', { name: submitName }))
      await successCheck(container)
      expect(mockApi[apiMethod]).toHaveBeenCalledTimes(1)
      expect(mockApi[apiMethod]).toHaveBeenCalledWith(...expectedArgs)
    })

    it('shows an error message when the API call fails', async () => {
      mockApi[apiMethod].mockRejectedValueOnce(new Error('Erreur de test'))
      const { container } = renderPage(Component)
      selectInputs(container)
      fireEvent.click(screen.getByRole('button', { name: submitName }))
      const alert = await screen.findByRole('alert')
      expect(alert.textContent).toContain('Erreur de test')
    })
  },
)

describe('IconPack', () => {
  it('generates the favicon on demand', async () => {
    mockApi.favicon.mockResolvedValueOnce(blob())
    const { container } = renderPage(IconPack)
    selectFiles(fileInputs(container)[0])
    fireEvent.click(screen.getByRole('button', { name: /Générer favicon\.ico/ }))
    await expectDownloadButton(container)
    expect(mockApi.favicon).toHaveBeenCalledTimes(1)
    expect(mockApi.favicon).toHaveBeenCalledWith(F)
  })

  it('generates the full pack on demand', async () => {
    mockApi.iconPack.mockResolvedValueOnce(blob())
    const { container } = renderPage(IconPack)
    selectFiles(fileInputs(container)[0])
    fireEvent.click(screen.getByRole('button', { name: /Générer le pack complet/ }))
    await expectDownloadButton(container)
    expect(mockApi.iconPack).toHaveBeenCalledTimes(1)
    expect(mockApi.iconPack).toHaveBeenCalledWith(F)
  })

  it('shows an error message when generation fails', async () => {
    mockApi.iconPack.mockRejectedValueOnce(new Error('Erreur de test'))
    const { container } = renderPage(IconPack)
    selectFiles(fileInputs(container)[0])
    fireEvent.click(screen.getByRole('button', { name: /Générer le pack complet/ }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Erreur de test')
  })
})

describe('double-submit protection', () => {
  // A representative sample covering both button flavors used across the app:
  // a form's type="submit" button, and IconPack's type="button" onClick actions.
  it('disables the submit button while a request is in flight, preventing duplicate calls', async () => {
    let resolveCall: (blob: Blob) => void = () => {}
    mockApi.compressImage.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCall = resolve
      }),
    )
    const { container } = renderPage(CompressImage)
    selectFiles(fileInputs(container)[0])
    const button = screen.getByRole('button', { name: 'Compresser' })
    fireEvent.click(button)
    expect(button).toBeDisabled()
    fireEvent.click(button)
    resolveCall(blob())
    await expectDownloadButton(container)
    expect(mockApi.compressImage).toHaveBeenCalledTimes(1)
  })

  it('disables IconPack action buttons while a request is in flight', async () => {
    let resolveCall: (blob: Blob) => void = () => {}
    mockApi.iconPack.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCall = resolve
      }),
    )
    const { container } = renderPage(IconPack)
    selectFiles(fileInputs(container)[0])
    const button = screen.getByRole('button', { name: /Générer le pack complet/ })
    fireEvent.click(button)
    expect(button).toBeDisabled()
    fireEvent.click(button)
    resolveCall(blob())
    await expectDownloadButton(container)
    expect(mockApi.iconPack).toHaveBeenCalledTimes(1)
  })
})
