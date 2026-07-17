import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'average' | 'reference'

export default function BrightnessMatch() {
  const [mode, setMode] = useState<Mode>('average')
  const [images, setImages] = useState<File[]>([])
  const [reference, setReference] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = images.length > 0 && (mode === 'average' || reference !== null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.normalizeBrightness(images, mode === 'reference' ? reference : null)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Uniformiser la luminosité d'un groupe de photos</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Cible de luminosité
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="average">Moyenne du lot</option>
            <option value="reference">Photo de référence</option>
          </select>
        </label>
        {mode === 'reference' && (
          <label>
            Photo de référence
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReference(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
        <label>
          Photos à ajuster
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
        </label>
        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Traitement...' : 'Uniformiser'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="normalized_images.zip" previewType="none" />
    </section>
  )
}
