import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Subtitles() {
  const [video, setVideo] = useState<File | null>(null)
  const [srt, setSrt] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!video || !srt) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.burnSubtitles(video, srt)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Incruster des sous-titres</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Vidéo
          <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
        </label>
        <label>
          Fichier de sous-titres (.srt)
          <input type="file" accept=".srt" onChange={(e) => setSrt(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" disabled={!video || !srt || loading}>
          {loading ? 'Traitement...' : 'Incruster'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="sous-titres.mp4" previewType="video" />
    </section>
  )
}
