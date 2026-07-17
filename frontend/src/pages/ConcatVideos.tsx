import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function ConcatVideos() {
  const [videos, setVideos] = useState<File[]>([])
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (videos.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.concatVideos(videos)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Concaténer plusieurs extraits vidéo</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Extraits (dans l'ordre, au moins 2, tous avec une piste audio)
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => setVideos(Array.from(e.target.files ?? []))}
          />
        </label>
        <button type="submit" disabled={videos.length < 2 || loading}>
          {loading ? 'Traitement...' : 'Concaténer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="concatenated.mp4" previewType="video" />
    </section>
  )
}
