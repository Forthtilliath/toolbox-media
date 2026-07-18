import { Spinner } from '@forthtilliath/forth-ui/components/spinner'
import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Documentation from './pages/Documentation'

const RemoveBackground = lazy(() => import('./pages/RemoveBackground'))
const ColorMatch = lazy(() => import('./pages/ColorMatch'))
const BrightnessMatch = lazy(() => import('./pages/BrightnessMatch'))
const CompressImage = lazy(() => import('./pages/CompressImage'))
const ConvertImage = lazy(() => import('./pages/ConvertImage'))
const CropImage = lazy(() => import('./pages/CropImage'))
const ResizeImage = lazy(() => import('./pages/ResizeImage'))
const RotateFlipImage = lazy(() => import('./pages/RotateFlipImage'))
const Watermark = lazy(() => import('./pages/Watermark'))
const AdjustImages = lazy(() => import('./pages/AdjustImages'))
const StripExif = lazy(() => import('./pages/StripExif'))
const ExtractExif = lazy(() => import('./pages/ExtractExif'))
const Deskew = lazy(() => import('./pages/Deskew'))
const Denoise = lazy(() => import('./pages/Denoise'))
const ContactSheet = lazy(() => import('./pages/ContactSheet'))
const IconPack = lazy(() => import('./pages/IconPack'))
const Srcset = lazy(() => import('./pages/Srcset'))
const Lqip = lazy(() => import('./pages/Lqip'))
const Base64Encode = lazy(() => import('./pages/Base64Encode'))
const Spritesheet = lazy(() => import('./pages/Spritesheet'))
const SvgOptimize = lazy(() => import('./pages/SvgOptimize'))
const SvgConvert = lazy(() => import('./pages/SvgConvert'))
const SocialFormats = lazy(() => import('./pages/SocialFormats'))
const Placeholder = lazy(() => import('./pages/Placeholder'))
const ColorPalette = lazy(() => import('./pages/ColorPalette'))
const CompareImages = lazy(() => import('./pages/CompareImages'))
const TrimVideo = lazy(() => import('./pages/TrimVideo'))
const VideoToGif = lazy(() => import('./pages/VideoToGif'))
const ConvertVideo = lazy(() => import('./pages/ConvertVideo'))
const CompressVideo = lazy(() => import('./pages/CompressVideo'))
const ExtractFrame = lazy(() => import('./pages/ExtractFrame'))
const ConcatVideos = lazy(() => import('./pages/ConcatVideos'))
const AudioTrack = lazy(() => import('./pages/AudioTrack'))
const ExtractAudio = lazy(() => import('./pages/ExtractAudio'))
const VideoSpeed = lazy(() => import('./pages/VideoSpeed'))
const Subtitles = lazy(() => import('./pages/Subtitles'))
const VideoLoop = lazy(() => import('./pages/VideoLoop'))
const Waveform = lazy(() => import('./pages/Waveform'))
const QrCode = lazy(() => import('./pages/QrCode'))
const ImagesToPdf = lazy(() => import('./pages/ImagesToPdf'))
const PdfToImages = lazy(() => import('./pages/PdfToImages'))
const MergePdf = lazy(() => import('./pages/MergePdf'))
const CompressPdf = lazy(() => import('./pages/CompressPdf'))
const RenameFiles = lazy(() => import('./pages/RenameFiles'))
const FileHash = lazy(() => import('./pages/FileHash'))
const ContrastChecker = lazy(() => import('./pages/ContrastChecker'))

function RouteFallback() {
  return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  )
}

function App() {
  const { pathname } = useLocation()
  return (
    <Layout>
      <ErrorBoundary key={pathname}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/remove-background" element={<RemoveBackground />} />
            <Route path="/color-match" element={<ColorMatch />} />
            <Route path="/brightness-match" element={<BrightnessMatch />} />
            <Route path="/compress-image" element={<CompressImage />} />
            <Route path="/convert-image" element={<ConvertImage />} />
            <Route path="/crop-image" element={<CropImage />} />
            <Route path="/resize-image" element={<ResizeImage />} />
            <Route path="/rotate-flip-image" element={<RotateFlipImage />} />
            <Route path="/watermark" element={<Watermark />} />
            <Route path="/adjust-images" element={<AdjustImages />} />
            <Route path="/strip-exif" element={<StripExif />} />
            <Route path="/extract-exif" element={<ExtractExif />} />
            <Route path="/deskew" element={<Deskew />} />
            <Route path="/denoise" element={<Denoise />} />
            <Route path="/contact-sheet" element={<ContactSheet />} />
            <Route path="/icon-pack" element={<IconPack />} />
            <Route path="/srcset" element={<Srcset />} />
            <Route path="/lqip" element={<Lqip />} />
            <Route path="/base64-encode" element={<Base64Encode />} />
            <Route path="/spritesheet" element={<Spritesheet />} />
            <Route path="/svg-optimize" element={<SvgOptimize />} />
            <Route path="/svg-convert" element={<SvgConvert />} />
            <Route path="/social-formats" element={<SocialFormats />} />
            <Route path="/placeholder" element={<Placeholder />} />
            <Route path="/color-palette" element={<ColorPalette />} />
            <Route path="/compare-images" element={<CompareImages />} />
            <Route path="/trim-video" element={<TrimVideo />} />
            <Route path="/video-to-gif" element={<VideoToGif />} />
            <Route path="/convert-video" element={<ConvertVideo />} />
            <Route path="/compress-video" element={<CompressVideo />} />
            <Route path="/extract-frame" element={<ExtractFrame />} />
            <Route path="/concat-videos" element={<ConcatVideos />} />
            <Route path="/audio-track" element={<AudioTrack />} />
            <Route path="/extract-audio" element={<ExtractAudio />} />
            <Route path="/video-speed" element={<VideoSpeed />} />
            <Route path="/subtitles" element={<Subtitles />} />
            <Route path="/video-loop" element={<VideoLoop />} />
            <Route path="/waveform" element={<Waveform />} />
            <Route path="/qrcode" element={<QrCode />} />
            <Route path="/images-to-pdf" element={<ImagesToPdf />} />
            <Route path="/pdf-to-images" element={<PdfToImages />} />
            <Route path="/merge-pdf" element={<MergePdf />} />
            <Route path="/compress-pdf" element={<CompressPdf />} />
            <Route path="/rename-files" element={<RenameFiles />} />
            <Route path="/file-hash" element={<FileHash />} />
            <Route path="/contrast-checker" element={<ContrastChecker />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}

export default App
