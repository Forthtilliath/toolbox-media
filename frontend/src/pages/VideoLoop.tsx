import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function VideoLoop() {
  const [file, setFile] = useState<File | null>(null)
  const [fadeDuration, setFadeDuration] = useState(1)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.createLoop(file, fadeDuration)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer une boucle vidéo parfaite</h2>
      <p>
        Fondu enchaîné entre la fin et le début de la vidéo pour une lecture en boucle sans coupure.
        La piste audio n'est pas conservée.
      </p>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Durée du fondu (s)
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={fadeDuration}
            onChange={(e) => setFadeDuration(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Générer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="loop.mp4" previewType="video" />
    </section>
  )
}
