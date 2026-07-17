import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function Base64Encode() {
  const [file, setFile] = useState<File | null>(null)
  const [dataUri, setDataUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { data_uri } = await api.base64Encode(file)
      setDataUri(data_uri)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Encoder une image en base64 (data URI)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Encoder'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {dataUri && (
        <div className="result-panel">
          <img src={dataUri} alt="Aperçu" style={{ maxWidth: 200 }} />
          <textarea readOnly value={dataUri} rows={6} style={{ width: '100%' }} />
        </div>
      )}
    </section>
  )
}
