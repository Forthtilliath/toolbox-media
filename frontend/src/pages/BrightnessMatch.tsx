import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forthtilliath/shadcn-ui/components/select'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'average' | 'reference'

export default function BrightnessMatch() {
  const [mode, setMode] = useState<Mode>('average')
  const [images, setImages] = useState<File[]>([])
  const [reference, setReference] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = images.length > 0 && (mode === 'average' || reference !== null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.normalizeBrightness(images, mode === 'reference' ? reference : null)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Uniformiser la luminosité d'un groupe de photos</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Cible de luminosité">
          <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="average">Moyenne du lot</SelectItem>
              <SelectItem value="reference">Photo de référence</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {mode === 'reference' && (
          <Field label="Photo de référence">
            <ImageInput onFileChange={setReference} />
          </Field>
        )}
        <Field label="Photos à ajuster">
          <Dropzone value={images} onValueChange={setImages} accept="image/*" multiple />
        </Field>
        <Button type="submit" disabled={!canSubmit} loading={loading} className="self-start">
          Uniformiser
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="normalized_images.zip" previewType="none" />
    </section>
  )
}
