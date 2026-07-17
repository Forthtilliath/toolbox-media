import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
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
import IconPack from './pages/IconPack'
import Srcset from './pages/Srcset'
import Lqip from './pages/Lqip'
import Base64Encode from './pages/Base64Encode'
import Spritesheet from './pages/Spritesheet'
import SvgOptimize from './pages/SvgOptimize'
import SvgConvert from './pages/SvgConvert'
import ColorPalette from './pages/ColorPalette'
import CompareImages from './pages/CompareImages'
import TrimVideo from './pages/TrimVideo'
import VideoToGif from './pages/VideoToGif'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
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
        <Route path="/icon-pack" element={<IconPack />} />
        <Route path="/srcset" element={<Srcset />} />
        <Route path="/lqip" element={<Lqip />} />
        <Route path="/base64-encode" element={<Base64Encode />} />
        <Route path="/spritesheet" element={<Spritesheet />} />
        <Route path="/svg-optimize" element={<SvgOptimize />} />
        <Route path="/svg-convert" element={<SvgConvert />} />
        <Route path="/color-palette" element={<ColorPalette />} />
        <Route path="/compare-images" element={<CompareImages />} />
        <Route path="/trim-video" element={<TrimVideo />} />
        <Route path="/video-to-gif" element={<VideoToGif />} />
      </Routes>
    </Layout>
  )
}

export default App
