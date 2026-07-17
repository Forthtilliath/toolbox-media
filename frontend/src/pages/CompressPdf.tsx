import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.compressPdf(file)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Compresser un PDF</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Compresser'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="compressed.pdf" previewType="none" />
    </section>
  )
}
