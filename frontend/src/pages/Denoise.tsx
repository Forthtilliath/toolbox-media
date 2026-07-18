import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { Slider } from '@forthtilliath/shadcn-ui/components/slider'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Denoise() {
  const [file, setFile] = useState<File | null>(null)
  const [strength, setStrength] = useState(10)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.denoiseImage(file, strength)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Réduire le bruit d'une image</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <Field label={`Intensité : ${strength}`}>
          <Slider min={1} max={30} value={[strength]} onValueChange={([value]) => setStrength(value)} />
        </Field>
        <Button type="submit" disabled={!file || loading} loading={loading} className="self-start">
          Réduire le bruit
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="debruitee.jpg" previewType="image" />
    </section>
  )
}
