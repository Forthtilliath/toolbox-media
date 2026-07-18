import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { Input } from '@forthtilliath/shadcn-ui/components/input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Srcset() {
  const [file, setFile] = useState<File | null>(null)
  const [widths, setWidths] = useState('320,640,960,1280,1920')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const widthList = widths
        .split(',')
        .map((w) => Number(w.trim()))
        .filter((w) => Number.isFinite(w) && w > 0)
      const blob = await api.srcset(file, widthList)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer un jeu d'images responsive (srcset)</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <Field label="Largeurs (px, séparées par des virgules)">
          <Input type="text" value={widths} onChange={(e) => setWidths(e.target.value)} />
        </Field>
        <Button type="submit" disabled={!file || loading} loading={loading} className="self-start">
          Générer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="srcset_images.zip" previewType="none" />
    </section>
  )
}
