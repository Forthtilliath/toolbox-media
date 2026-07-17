import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import RemoveBackground from './pages/RemoveBackground'
import ColorMatch from './pages/ColorMatch'
import CompressImage from './pages/CompressImage'
import ConvertImage from './pages/ConvertImage'
import TrimVideo from './pages/TrimVideo'
import VideoToGif from './pages/VideoToGif'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/remove-background" element={<RemoveBackground />} />
        <Route path="/color-match" element={<ColorMatch />} />
        <Route path="/compress-image" element={<CompressImage />} />
        <Route path="/convert-image" element={<ConvertImage />} />
        <Route path="/trim-video" element={<TrimVideo />} />
        <Route path="/video-to-gif" element={<VideoToGif />} />
      </Routes>
    </Layout>
  )
}

export default App
