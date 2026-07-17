import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function FileHash() {
  const [file, setFile] = useState<File | null>(null)
  const [hashes, setHashes] = useState<{ md5: string; sha256: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.computeHash(file)
      setHashes(result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Calculer le hash d'un fichier</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Calcul...' : 'Calculer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {hashes && (
        <div className="result-panel">
          <label>
            MD5
            <input type="text" readOnly value={hashes.md5} />
          </label>
          <label>
            SHA-256
            <input type="text" readOnly value={hashes.sha256} />
          </label>
        </div>
      )}
    </section>
  )
}
