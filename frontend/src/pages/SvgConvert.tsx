import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Direction = 'svg-to-png' | 'png-to-svg'

export default function SvgConvert() {
  const [file, setFile] = useState<File | null>(null)
  const [direction, setDirection] = useState<Direction>('svg-to-png')
  const [width, setWidth] = useState<number | ''>('')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.svgConvert(file, direction, width === '' ? undefined : width)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Convertir SVG ↔ PNG</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Sens
          <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
            <option value="svg-to-png">SVG → PNG (rasteriser)</option>
            <option value="png-to-svg">PNG → SVG (encapsuler)</option>
          </select>
        </label>
        <input
          type="file"
          accept={direction === 'svg-to-png' ? '.svg,image/svg+xml' : 'image/*'}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {direction === 'svg-to-png' && (
          <label>
            Largeur cible (px, optionnel)
            <input
              type="number"
              min={1}
              value={width}
              onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </label>
        )}
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Convertir'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel
        blob={result}
        filename={direction === 'svg-to-png' ? 'converted.png' : 'converted.svg'}
        previewType="image"
      />
    </section>
  )
}
