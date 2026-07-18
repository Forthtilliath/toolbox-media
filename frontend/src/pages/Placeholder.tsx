import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { ColorPicker } from '@forthtilliath/forth-ui/components/color-picker'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { Input } from '@forthtilliath/shadcn-ui/components/input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Placeholder() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('cccccc')
  const [textColor, setTextColor] = useState('969696')
  const [text, setText] = useState('')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const blob = await api.placeholder({
        width,
        height,
        bgColor,
        textColor,
        text: text || undefined,
      })
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer une image placeholder</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Largeur (px)">
          <NumberInput min={1} value={width} onValueChange={setWidth} />
        </Field>
        <Field label="Hauteur (px)">
          <NumberInput min={1} value={height} onValueChange={setHeight} />
        </Field>
        <Field label="Couleur de fond">
          <ColorPicker value={`#${bgColor}`} onValueChange={(value) => setBgColor(value.slice(1))} />
        </Field>
        <Field label="Couleur du texte">
          <ColorPicker value={`#${textColor}`} onValueChange={(value) => setTextColor(value.slice(1))} />
        </Field>
        <Field label={`Texte (optionnel, sinon "${width}x${height}")`}>
          <Input type="text" value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Button type="submit" loading={loading} className="self-start">
          Générer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="placeholder.png" previewType="image" />
    </section>
  )
}
