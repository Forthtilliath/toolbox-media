import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

const FORMATS = ['jpeg', 'png', 'webp']

export default function ConvertImage() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState('png')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.convertImage(file, format)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Convertir le format d'une image</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Convertir'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename={`converted.${format}`} previewType="image" />
    </section>
  )
}
