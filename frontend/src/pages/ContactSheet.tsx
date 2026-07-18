import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function ContactSheet() {
  const [images, setImages] = useState<File[]>([])
  const [columns, setColumns] = useState(4)
  const [thumbSize, setThumbSize] = useState(200)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (images.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.contactSheet(images, columns, thumbSize)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer une planche contact</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Photos">
          <Dropzone value={images} onValueChange={setImages} accept="image/*" multiple />
        </Field>
        <Field label="Colonnes">
          <NumberInput min={1} max={10} value={columns} onValueChange={setColumns} />
        </Field>
        <Field label="Taille des miniatures (px)">
          <NumberInput min={50} max={500} value={thumbSize} onValueChange={setThumbSize} />
        </Field>
        <Button type="submit" disabled={images.length === 0} loading={loading} className="self-start">
          Générer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="planche-contact.jpg" previewType="image" />
    </section>
  )
}
