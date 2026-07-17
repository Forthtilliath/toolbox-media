import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function AdjustImages() {
  const [images, setImages] = useState<File[]>([])
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (images.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.adjustImages(images, brightness / 100, contrast / 100, saturation / 100)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Ajuster luminosité / contraste / saturation en lot</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Photos à ajuster
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
        </label>
        <label>
          Luminosité : {brightness}%
          <input
            type="range"
            min={0}
            max={200}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </label>
        <label>
          Contraste : {contrast}%
          <input
            type="range"
            min={0}
            max={200}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
        </label>
        <label>
          Saturation : {saturation}%
          <input
            type="range"
            min={0}
            max={200}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={images.length === 0 || loading}>
          {loading ? 'Traitement...' : 'Appliquer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="adjusted_images.zip" previewType="none" />
    </section>
  )
}
