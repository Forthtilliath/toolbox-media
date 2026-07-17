import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Placeholder() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('cccccc')
  const [textColor, setTextColor] = useState('969696')
  const [text, setText] = useState('')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const blob = await api.placeholder({
        width,
        height,
        bgColor,
        textColor,
        text: text || undefined,
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
      <h2>Générer une image placeholder</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Largeur (px)
          <input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        </label>
        <label>
          Hauteur (px)
          <input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
        </label>
        <label>
          Couleur de fond
          <input type="color" value={`#${bgColor}`} onChange={(e) => setBgColor(e.target.value.slice(1))} />
        </label>
        <label>
          Couleur du texte
          <input type="color" value={`#${textColor}`} onChange={(e) => setTextColor(e.target.value.slice(1))} />
        </label>
        <label>
          Texte (optionnel, sinon "{width}x{height}")
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Traitement...' : 'Générer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="placeholder.png" previewType="image" />
    </section>
  )
}
