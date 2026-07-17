import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

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
import Home from './Home'
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

// One entry per tool page: renders it and asserts its <h2> heading, so a typo or a
// broken import in any of the 30 pages fails fast instead of only showing up in the browser.
const pages = [
  { Component: RemoveBackground, heading: 'Remove background' },
  { Component: ColorMatch, heading: "Uniformiser les teintes d'un groupe de photos" },
  { Component: BrightnessMatch, heading: "Uniformiser la luminosité d'un groupe de photos" },
  { Component: CompressImage, heading: 'Compresser une image' },
  { Component: ConvertImage, heading: "Convertir le format d'une image" },
  { Component: CropImage, heading: 'Rogner une image' },
  { Component: ResizeImage, heading: 'Redimensionner une image' },
  { Component: RotateFlipImage, heading: 'Pivoter / retourner une image' },
  { Component: Watermark, heading: 'Ajouter un filigrane' },
  { Component: AdjustImages, heading: 'Ajuster luminosité / contraste / saturation en lot' },
  { Component: StripExif, heading: 'Supprimer les métadonnées EXIF' },
  { Component: ExtractExif, heading: 'Extraire les métadonnées EXIF' },
  { Component: Deskew, heading: 'Redresser une image' },
  { Component: Denoise, heading: "Réduire le bruit d'une image" },
  { Component: ContactSheet, heading: 'Générer une planche contact' },
  { Component: IconPack, heading: "Favicon et pack d'icônes" },
  { Component: Srcset, heading: "Générer un jeu d'images responsive (srcset)" },
  { Component: Lqip, heading: 'Générer un placeholder flou (LQIP)' },
  { Component: Base64Encode, heading: 'Encoder une image en base64 (data URI)' },
  { Component: Spritesheet, heading: 'Assembler un spritesheet CSS' },
  { Component: SvgOptimize, heading: 'Optimiser un SVG' },
  { Component: SvgConvert, heading: 'Convertir SVG ↔ PNG' },
  { Component: SocialFormats, heading: 'Générer les formats réseaux sociaux' },
  { Component: Placeholder, heading: 'Générer une image placeholder' },
  { Component: ColorPalette, heading: 'Extraire la palette de couleurs dominante' },
  { Component: CompareImages, heading: 'Comparer deux images' },
  { Component: TrimVideo, heading: 'Couper un extrait vidéo' },
  { Component: VideoToGif, heading: 'Convertir un extrait vidéo en GIF' },
  { Component: ConvertVideo, heading: "Convertir le format d'une vidéo" },
  { Component: CompressVideo, heading: 'Compresser une vidéo' },
  { Component: ExtractFrame, heading: 'Extraire une frame / thumbnail' },
  { Component: ConcatVideos, heading: 'Concaténer plusieurs extraits vidéo' },
  { Component: AudioTrack, heading: 'Ajouter / retirer la piste audio' },
  { Component: ExtractAudio, heading: 'Extraire la piste audio' },
  { Component: VideoSpeed, heading: 'Accélérer / ralentir une vidéo' },
  { Component: Subtitles, heading: 'Incruster des sous-titres' },
  { Component: VideoLoop, heading: 'Générer une boucle vidéo parfaite' },
  { Component: Waveform, heading: 'Générer une visualisation waveform' },
  { Component: QrCode, heading: 'Générer un QR code' },
  { Component: ImagesToPdf, heading: 'Convertir des images en PDF' },
  { Component: PdfToImages, heading: "Extraire les pages d'un PDF en images" },
  { Component: MergePdf, heading: 'Fusionner plusieurs PDF' },
  { Component: CompressPdf, heading: 'Compresser un PDF' },
  { Component: RenameFiles, heading: 'Renommer un lot de fichiers' },
  { Component: FileHash, heading: "Calculer le hash d'un fichier" },
  { Component: ContrastChecker, heading: 'Vérifier le contraste de deux couleurs' },
]

describe('tool pages', () => {
  it.each(pages)('$heading renders its heading and a submit control', ({ Component, heading }) => {
    render(
      <MemoryRouter>
        <Component />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument()
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})

describe('Home page', () => {
  it('renders a link to every tool page', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Outils disponibles' })).toBeInTheDocument()
    // One card per tool, plus the "documentation" link in the intro paragraph.
    expect(screen.getAllByRole('link').length).toBe(pages.length + 1)
  })
})

describe('Documentation page', () => {
  it('renders a heading, every category, and a link per tool', async () => {
    const Documentation = (await import('./Documentation')).default
    render(
      <MemoryRouter>
        <Documentation />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Guide complet des outils' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(5)
    expect(screen.getAllByRole('link').length).toBe(pages.length)
  })
})
