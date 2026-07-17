import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function CompressVideo() {
  const [file, setFile] = useState<File | null>(null)
  const [bitrate, setBitrate] = useState<number | ''>(1000)
  const [width, setWidth] = useState<number | ''>('')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = file !== null && (bitrate !== '' || width !== '')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file || !canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.compressVideo(file, bitrate === '' ? undefined : bitrate, width === '' ? undefined : width)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Compresser une vidéo</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Bitrate vidéo cible (kbps)
          <input
            type="number"
            min={100}
            value={bitrate}
            onChange={(e) => setBitrate(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </label>
        <label>
          Largeur max (px, optionnel)
          <input
            type="number"
            min={100}
            value={width}
            onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Traitement...' : 'Compresser'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="compressed.mp4" previewType="video" />
    </section>
  )
}
