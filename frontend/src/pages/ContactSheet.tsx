import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function ContactSheet() {
  const [images, setImages] = useState<File[]>([])
  const [columns, setColumns] = useState(4)
  const [thumbSize, setThumbSize] = useState(200)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (images.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.contactSheet(images, columns, thumbSize)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer une planche contact</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
        </label>
        <label>
          Colonnes
          <input
            type="number"
            min={1}
            max={10}
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
          />
        </label>
        <label>
          Taille des miniatures (px)
          <input
            type="number"
            min={50}
            max={500}
            value={thumbSize}
            onChange={(e) => setThumbSize(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={images.length === 0 || loading}>
          {loading ? 'Traitement...' : 'Générer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="planche-contact.jpg" previewType="image" />
    </section>
  )
}
