import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Documentation from './pages/Documentation'
import RemoveBackground from './pages/RemoveBackground'
import ColorMatch from './pages/ColorMatch'
import BrightnessMatch from './pages/BrightnessMatch'
import CompressImage from './pages/CompressImage'
import ConvertImage from './pages/ConvertImage'
import CropImage from './pages/CropImage'
import ResizeImage from './pages/ResizeImage'
import RotateFlipImage from './pages/RotateFlipImage'
import Watermark from './pages/Watermark'
import AdjustImages from './pages/AdjustImages'
import StripExif from './pages/StripExif'
import ExtractExif from './pages/ExtractExif'
import Deskew from './pages/Deskew'
import Denoise from './pages/Denoise'
import ContactSheet from './pages/ContactSheet'
import IconPack from './pages/IconPack'
import Srcset from './pages/Srcset'
import Lqip from './pages/Lqip'
import Base64Encode from './pages/Base64Encode'
import Spritesheet from './pages/Spritesheet'
import SvgOptimize from './pages/SvgOptimize'
import SvgConvert from './pages/SvgConvert'
import SocialFormats from './pages/SocialFormats'
import Placeholder from './pages/Placeholder'
import ColorPalette from './pages/ColorPalette'
import CompareImages from './pages/CompareImages'
import TrimVideo from './pages/TrimVideo'
import VideoToGif from './pages/VideoToGif'
import ConvertVideo from './pages/ConvertVideo'
import CompressVideo from './pages/CompressVideo'
import ExtractFrame from './pages/ExtractFrame'
import ConcatVideos from './pages/ConcatVideos'
import AudioTrack from './pages/AudioTrack'
import ExtractAudio from './pages/ExtractAudio'
import VideoSpeed from './pages/VideoSpeed'
import Subtitles from './pages/Subtitles'
import VideoLoop from './pages/VideoLoop'
import Waveform from './pages/Waveform'
import QrCode from './pages/QrCode'
import ImagesToPdf from './pages/ImagesToPdf'
import PdfToImages from './pages/PdfToImages'
import RenameFiles from './pages/RenameFiles'

function App() {
  return (
    <Layout>
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
        <Route path="/rename-files" element={<RenameFiles />} />
      </Routes>
    </Layout>
  )
}

export default App
