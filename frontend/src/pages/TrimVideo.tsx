import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function TrimVideo() {
  const [file, setFile] = useState<File | null>(null)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(5)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.trimVideo(file, start, end)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Couper un extrait vidéo</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Début (s)
          <input type="number" min={0} value={start} onChange={(e) => setStart(Number(e.target.value))} />
        </label>
        <label>
          Fin (s)
          <input type="number" min={0} value={end} onChange={(e) => setEnd(Number(e.target.value))} />
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Couper'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="trimmed.mp4" previewType="video" />
    </section>
  )
}
