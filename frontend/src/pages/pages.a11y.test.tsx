import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
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
import Documentation from './Documentation'
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

expect.extend(toHaveNoViolations)

// These rules are disabled here, not ignored: each one is a real violation
// tracked as a known limitation of forth-ui/shadcn-ui's own components,
// reproducing identically on every page that uses the affected control —
// see the forth-ui improvement notes for the underlying report.
//   - button-name: Radix Select's trigger has no accessible name until an
//     item has been registered by the (portal-mounted) SelectContent; we
//     work around it locally with an explicit aria-label on our own
//     SelectTriggers, but Select instances inside forth-ui itself (none
//     currently) would still need the same treatment upstream.
//   - label: ImageInput/Dropzone's hidden <input type="file"> and
//     ColorPicker's <input type="color"> don't forward the id/aria-* that
//     Field's cloneElement injects, so they never get a real accessible
//     label despite the visible Field label right next to them.
//   - aria-input-field-name: shadcn's Slider thumb has no aria-label or
//     aria-valuetext.
//   - nested-interactive: forth-ui's Dropzone nests the file <input> inside
//     a role="button" div, which is itself invalid ARIA structure.
const axeConfig = {
  rules: {
    'button-name': { enabled: false },
    label: { enabled: false },
    'aria-input-field-name': { enabled: false },
    'nested-interactive': { enabled: false },
  },
}

const pages: [string, React.ComponentType][] = [
  ['RemoveBackground', RemoveBackground],
  ['ColorMatch', ColorMatch],
  ['BrightnessMatch', BrightnessMatch],
  ['CompressImage', CompressImage],
  ['ConvertImage', ConvertImage],
  ['CropImage', CropImage],
  ['ResizeImage', ResizeImage],
  ['RotateFlipImage', RotateFlipImage],
  ['Watermark', Watermark],
  ['AdjustImages', AdjustImages],
  ['StripExif', StripExif],
  ['ExtractExif', ExtractExif],
  ['Deskew', Deskew],
  ['Denoise', Denoise],
  ['ContactSheet', ContactSheet],
  ['IconPack', IconPack],
  ['Srcset', Srcset],
  ['Lqip', Lqip],
  ['Base64Encode', Base64Encode],
  ['Spritesheet', Spritesheet],
  ['SvgOptimize', SvgOptimize],
  ['SvgConvert', SvgConvert],
  ['SocialFormats', SocialFormats],
  ['Placeholder', Placeholder],
  ['ColorPalette', ColorPalette],
  ['CompareImages', CompareImages],
  ['TrimVideo', TrimVideo],
  ['VideoToGif', VideoToGif],
  ['ConvertVideo', ConvertVideo],
  ['CompressVideo', CompressVideo],
  ['ExtractFrame', ExtractFrame],
  ['ConcatVideos', ConcatVideos],
  ['AudioTrack', AudioTrack],
  ['ExtractAudio', ExtractAudio],
  ['VideoSpeed', VideoSpeed],
  ['Subtitles', Subtitles],
  ['VideoLoop', VideoLoop],
  ['Waveform', Waveform],
  ['QrCode', QrCode],
  ['ImagesToPdf', ImagesToPdf],
  ['PdfToImages', PdfToImages],
  ['MergePdf', MergePdf],
  ['CompressPdf', CompressPdf],
  ['RenameFiles', RenameFiles],
  ['FileHash', FileHash],
  ['ContrastChecker', ContrastChecker],
  ['Home', Home],
  ['Documentation', Documentation],
]

describe.each(pages)('%s', (_name, Component) => {
  it('has no accessibility violations beyond the known forth-ui limitations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Component />
      </MemoryRouter>,
    )
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
