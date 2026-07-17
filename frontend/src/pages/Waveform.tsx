import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Waveform() {
  const [file, setFile] = useState<File | null>(null)
  const [width, setWidth] = useState(1280)
  const [height, setHeight] = useState(240)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.waveform(file, width, height)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer une visualisation waveform</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*,audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Largeur (px)
          <input type="number" min={100} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        </label>
        <label>
          Hauteur (px)
          <input type="number" min={50} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Générer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="waveform.png" previewType="image" />
    </section>
  )
}
