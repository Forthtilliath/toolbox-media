import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { Slider } from '@forthtilliath/shadcn-ui/components/slider'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function AdjustImages() {
  const [images, setImages] = useState<File[]>([])
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (images.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.adjustImages(images, brightness / 100, contrast / 100, saturation / 100)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Ajuster luminosité / contraste / saturation en lot</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Photos à ajuster">
          <Dropzone value={images} onValueChange={setImages} accept="image/*" multiple />
        </Field>
        <Field label={`Luminosité : ${brightness}%`}>
          <Slider min={0} max={200} value={[brightness]} onValueChange={([value]) => setBrightness(value)} />
        </Field>
        <Field label={`Contraste : ${contrast}%`}>
          <Slider min={0} max={200} value={[contrast]} onValueChange={([value]) => setContrast(value)} />
        </Field>
        <Field label={`Saturation : ${saturation}%`}>
          <Slider min={0} max={200} value={[saturation]} onValueChange={([value]) => setSaturation(value)} />
        </Field>
        <Button type="submit" disabled={images.length === 0 || loading} loading={loading} className="self-start">
          Appliquer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="adjusted_images.zip" previewType="none" />
    </section>
  )
}
