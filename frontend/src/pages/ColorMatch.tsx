import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function ColorMatch() {
  const [reference, setReference] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!reference || images.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.colorMatch(reference, images)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Uniformiser les teintes d'un groupe de photos</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Photo de référence
          <input type="file" accept="image/*" onChange={(e) => setReference(e.target.files?.[0] ?? null)} />
        </label>
        <label>
          Photos à ajuster
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
        </label>
        <button type="submit" disabled={!reference || images.length === 0 || loading}>
          {loading ? 'Traitement...' : 'Uniformiser'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="matched_images.zip" previewType="none" />
    </section>
  )
}
