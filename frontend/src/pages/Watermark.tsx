import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'text' | 'logo'

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center']

export default function Watermark() {
  const [images, setImages] = useState<File[]>([])
  const [mode, setMode] = useState<Mode>('text')
  const [text, setText] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [opacity, setOpacity] = useState(70)
  const [position, setPosition] = useState('bottom-right')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = images.length > 0 && (mode === 'text' ? text.trim() !== '' : logo !== null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.watermarkImages(images, {
        text: mode === 'text' ? text : undefined,
        logo: mode === 'logo' ? (logo ?? undefined) : undefined,
        opacity,
        position,
      })
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Ajouter un filigrane</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Photos à filigraner
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
        </label>
        <label>
          Type
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="text">Texte</option>
            <option value="logo">Logo (image)</option>
          </select>
        </label>
        {mode === 'text' ? (
          <label>
            Texte
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
        ) : (
          <label>
            Logo
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
          </label>
        )}
        <label>
          Position
          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Opacité : {opacity}%
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Traitement...' : 'Appliquer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="watermarked_images.zip" previewType="none" />
    </section>
  )
}
