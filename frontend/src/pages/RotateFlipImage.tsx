import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function RotateFlipImage() {
  const [file, setFile] = useState<File | null>(null)
  const [angle, setAngle] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.rotateFlipImage(file, angle, flipHorizontal, flipVertical)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Pivoter / retourner une image</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Rotation (degrés, sens horaire)
          <input type="number" step={1} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
        </label>
        <label>
          <input
            type="checkbox"
            checked={flipHorizontal}
            onChange={(e) => setFlipHorizontal(e.target.checked)}
          />
          Retourner horizontalement
        </label>
        <label>
          <input type="checkbox" checked={flipVertical} onChange={(e) => setFlipVertical(e.target.checked)} />
          Retourner verticalement
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Appliquer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="rotated.jpg" previewType="image" />
    </section>
  )
}
