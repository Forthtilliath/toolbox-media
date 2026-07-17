import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function ExtractExif() {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { metadata } = await api.extractExif(file)
      setMetadata(metadata)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Extraire les métadonnées EXIF</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Extraire'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {metadata && (
        <div className="result-panel">
          {Object.keys(metadata).length === 0 ? (
            <p>Aucune métadonnée EXIF trouvée dans cette image.</p>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', width: '100%' }}>{JSON.stringify(metadata, null, 2)}</pre>
          )}
        </div>
      )}
    </section>
  )
}
