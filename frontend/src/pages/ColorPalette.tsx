import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

interface Color {
  hex: string
  rgb: number[]
  percentage: number
}

export default function ColorPalette() {
  const [file, setFile] = useState<File | null>(null)
  const [numColors, setNumColors] = useState(5)
  const [colors, setColors] = useState<Color[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { colors } = await api.colorPalette(file, numColors)
      setColors(colors)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Extraire la palette de couleurs dominante</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Nombre de couleurs : {numColors}
          <input
            type="range"
            min={2}
            max={10}
            value={numColors}
            onChange={(e) => setNumColors(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Traitement...' : 'Extraire'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {colors && (
        <div className="result-panel">
          {colors.map((color) => (
            <div key={color.hex} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: color.hex,
                  border: '1px solid rgba(128,128,128,0.4)',
                }}
              />
              <span>
                {color.hex} — {color.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
