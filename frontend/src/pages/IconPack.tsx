import { useState } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function IconPack() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [resultName, setResultName] = useState('favicon.ico')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate(kind: 'favicon' | 'pack') {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = kind === 'favicon' ? await api.favicon(file) : await api.iconPack(file)
      setResult(blob)
      setResultName(kind === 'favicon' ? 'favicon.ico' : 'icon_pack.zip')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Favicon et pack d'icônes</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="button" disabled={!file || loading} onClick={() => generate('favicon')}>
          {loading ? 'Traitement...' : 'Générer favicon.ico'}
        </button>
        <button type="button" disabled={!file || loading} onClick={() => generate('pack')}>
          {loading ? 'Traitement...' : "Générer le pack complet (apple-touch-icon, PWA, manifest.json)"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename={resultName} previewType="none" />
    </section>
  )
}
