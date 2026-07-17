import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

type ContrastResult = {
  ratio: number
  aa_normal_text: boolean
  aa_large_text: boolean
  aaa_normal_text: boolean
  aaa_large_text: boolean
}

export default function ContrastChecker() {
  const [colorA, setColorA] = useState('000000')
  const [colorB, setColorB] = useState('ffffff')
  const [result, setResult] = useState<ContrastResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await api.contrastRatio(colorA, colorB)
      setResult(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Vérifier le contraste de deux couleurs</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Couleur 1
          <input type="color" value={`#${colorA}`} onChange={(e) => setColorA(e.target.value.slice(1))} />
        </label>
        <label>
          Couleur 2
          <input type="color" value={`#${colorB}`} onChange={(e) => setColorB(e.target.value.slice(1))} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Calcul...' : 'Vérifier'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div
          className="result-panel"
          style={{ padding: '1rem', background: `#${colorB}`, color: `#${colorA}`, borderRadius: 8 }}
        >
          <p>Ratio de contraste : {result.ratio}:1</p>
          <ul>
            <li>AA texte normal (4.5:1) : {result.aa_normal_text ? '✅' : '❌'}</li>
            <li>AA texte large (3:1) : {result.aa_large_text ? '✅' : '❌'}</li>
            <li>AAA texte normal (7:1) : {result.aaa_normal_text ? '✅' : '❌'}</li>
            <li>AAA texte large (4.5:1) : {result.aaa_large_text ? '✅' : '❌'}</li>
          </ul>
        </div>
      )}
    </section>
  )
}
