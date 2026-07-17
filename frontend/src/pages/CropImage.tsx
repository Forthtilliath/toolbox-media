import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'ratio' | 'manual'

export default function CropImage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('ratio')
  const [ratio, setRatio] = useState('1:1')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [width, setWidth] = useState(200)
  const [height, setHeight] = useState(200)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.cropImage(file, mode === 'ratio' ? { ratio } : { x, y, width, height })
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Rogner une image</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {previewUrl && <img src={previewUrl} alt="Aperçu" style={{ maxWidth: '100%', borderRadius: 8 }} />}
        <label>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="ratio">Ratio prédéfini (centré)</option>
            <option value="manual">Zone manuelle (pixels)</option>
          </select>
        </label>
        {mode === 'ratio' ? (
          <label>
            Ratio
            <select value={ratio} onChange={(e) => setRatio(e.target.value)}>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9</option>
            </select>
          </label>
        ) : (
          <>
            <label>
              X<input type="number" min={0} value={x} onChange={(e) => setX(Number(e.target.value))} />
            </label>
            <label>
              Y<input type="number" min={0} value={y} onChange={(e) => setY(Number(e.target.value))} />
            </label>
            <label>
              Largeur
              <input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            </label>
            <label>
              Hauteur
              <input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </label>
          </>
        )}
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Rogner'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="cropped.jpg" previewType="image" />
    </section>
  )
}
