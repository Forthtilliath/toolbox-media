import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function RenameFiles() {
  const [files, setFiles] = useState<File[]>([])
  const [pattern, setPattern] = useState('fichier-{n:03d}')
  const [start, setStart] = useState(1)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.renameFiles(files, pattern, start)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Renommer un lot de fichiers</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Fichiers
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </label>
        <label>
          Pattern ({'{n}'} = numéro, {'{n:03d}'} = numéro sur 3 chiffres, {'{name}'} = nom original,{' '}
          {'{ext}'} = extension)
          <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} />
        </label>
        <label>
          Numéro de départ
          <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} />
        </label>
        <button type="submit" disabled={files.length === 0 || loading}>
          {loading ? 'Traitement...' : 'Renommer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="renamed_files.zip" previewType="none" />
    </section>
  )
}
