import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function CompareImages() {
  const [imageA, setImageA] = useState<File | null>(null)
  const [imageB, setImageB] = useState<File | null>(null)
  const [dataUri, setDataUri] = useState<string | null>(null)
  const [similarity, setSimilarity] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!imageA || !imageB) return
    setLoading(true)
    setError(null)
    try {
      const { data_uri, similarity } = await api.compareImages(imageA, imageB)
      setDataUri(data_uri)
      setSimilarity(similarity)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Comparer deux images</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Image A
          <input type="file" accept="image/*" onChange={(e) => setImageA(e.target.files?.[0] ?? null)} />
        </label>
        <label>
          Image B
          <input type="file" accept="image/*" onChange={(e) => setImageB(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" disabled={!imageA || !imageB || loading}>
          {loading ? 'Traitement...' : 'Comparer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {dataUri && similarity !== null && (
        <div className="result-panel">
          <p>Similarité : {(similarity * 100).toFixed(1)}%</p>
          <img src={dataUri} alt="Différences (zones rouges = différentes)" />
        </div>
      )}
    </section>
  )
}
