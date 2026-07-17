import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (files.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.mergePdf(files)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Fusionner plusieurs PDF</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Fichiers PDF (au moins 2, dans l'ordre voulu)
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        <button type="submit" disabled={files.length < 2 || loading}>
          {loading ? 'Traitement...' : 'Fusionner'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="merged.pdf" previewType="none" />
    </section>
  )
}
