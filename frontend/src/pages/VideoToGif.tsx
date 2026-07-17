import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null)
  const [start, setStart] = useState(0)
  const [duration, setDuration] = useState(3)
  const [fps, setFps] = useState(12)
  const [width, setWidth] = useState(480)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.videoToGif(file, start, duration, fps, width)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Convertir un extrait vidéo en GIF</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Début (s)
          <input type="number" min={0} value={start} onChange={(e) => setStart(Number(e.target.value))} />
        </label>
        <label>
          Durée (s)
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>
        <label>
          FPS
          <input type="number" min={1} max={30} value={fps} onChange={(e) => setFps(Number(e.target.value))} />
        </label>
        <label>
          Largeur (px)
          <input
            type="number"
            min={100}
            max={1920}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Générer le GIF'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="output.gif" previewType="image" />
    </section>
  )
}
