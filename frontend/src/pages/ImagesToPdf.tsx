import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function ImagesToPdf() {
  const [images, setImages] = useState<File[]>([])
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (images.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.imagesToPdf(images)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Convertir des images en PDF</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Images (dans l'ordre des pages)">
          <Dropzone value={images} onValueChange={setImages} accept="image/*" multiple />
        </Field>
        <Button type="submit" disabled={images.length === 0} loading={loading} className="self-start">
          Convertir
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="images.pdf" previewType="none" />
    </section>
  )
}
