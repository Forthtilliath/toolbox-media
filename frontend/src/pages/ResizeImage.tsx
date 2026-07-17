import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'dimensions' | 'percent'

export default function ResizeImage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>('percent')
  const [percent, setPercent] = useState(50)
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')
  const [keepRatio, setKeepRatio] = useState(true)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = file !== null && (mode === 'percent' || width !== '' || height !== '')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file || !canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.resizeImage(
        file,
        mode === 'percent'
          ? { percent, keepRatio: true }
          : {
              width: width === '' ? undefined : width,
              height: height === '' ? undefined : height,
              keepRatio,
            },
      )
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Redimensionner une image</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="percent">Pourcentage</option>
            <option value="dimensions">Dimensions</option>
          </select>
        </label>
        {mode === 'percent' ? (
          <label>
            Échelle : {percent}%
            <input
              type="range"
              min={5}
              max={200}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
            />
          </label>
        ) : (
          <>
            <label>
              Largeur (px)
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
            <label>
              Hauteur (px)
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
            <label>
              <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} />
              Conserver le ratio
            </label>
          </>
        )}
        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Traitement...' : 'Redimensionner'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="resized.jpg" previewType="image" />
    </section>
  )
}
