import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Srcset() {
  const [file, setFile] = useState<File | null>(null)
  const [widths, setWidths] = useState('320,640,960,1280,1920')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const widthList = widths
        .split(',')
        .map((w) => Number(w.trim()))
        .filter((w) => Number.isFinite(w) && w > 0)
      const blob = await api.srcset(file, widthList)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer un jeu d'images responsive (srcset)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Largeurs (px, séparées par des virgules)
          <input type="text" value={widths} onChange={(e) => setWidths(e.target.value)} />
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Générer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="srcset_images.zip" previewType="none" />
    </section>
  )
}
