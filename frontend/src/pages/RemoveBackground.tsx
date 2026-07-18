import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { Checkbox } from '@forthtilliath/shadcn-ui/components/checkbox'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function RemoveBackground() {
  const [file, setFile] = useState<File | null>(null)
  const [alphaMatting, setAlphaMatting] = useState(false)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.removeBackground(file, alphaMatting)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Remove background</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <Field orientation="horizontal" label="Détourage précis (cheveux, fourrure) — plus lent">
          <Checkbox checked={alphaMatting} onCheckedChange={(checked) => setAlphaMatting(checked === true)} />
        </Field>
        <Button type="submit" disabled={!file} loading={loading} className="self-start">
          Supprimer le fond
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="remove-bg.png" previewType="image" />
    </section>
  )
}
