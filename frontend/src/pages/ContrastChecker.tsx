import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { ColorPicker } from '@forthtilliath/forth-ui/components/color-picker'
import { Field } from '@forthtilliath/forth-ui/components/field'
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
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Couleur 1">
          <ColorPicker value={`#${colorA}`} onValueChange={(value) => setColorA(value.slice(1))} />
        </Field>
        <Field label="Couleur 2">
          <ColorPicker value={`#${colorB}`} onValueChange={(value) => setColorB(value.slice(1))} />
        </Field>
        <Button type="submit" loading={loading} className="self-start">
          Vérifier
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      {result && (
        <div
          className="mt-4 max-w-md rounded-lg p-4"
          style={{ background: `#${colorB}`, color: `#${colorA}` }}
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
