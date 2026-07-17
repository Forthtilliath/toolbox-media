import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function QrCode() {
  const [data, setData] = useState('')
  const [boxSize, setBoxSize] = useState(10)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!data.trim()) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.qrcode(data, boxSize)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer un QR code</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Texte ou URL
          <input type="text" value={data} onChange={(e) => setData(e.target.value)} />
        </label>
        <label>
          Taille des modules : {boxSize}
          <input
            type="range"
            min={4}
            max={20}
            value={boxSize}
            onChange={(e) => setBoxSize(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={!data.trim() || loading}>
          {loading ? 'Traitement...' : 'Générer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="qrcode.png" previewType="image" />
    </section>
  )
}
