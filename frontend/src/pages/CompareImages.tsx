import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function CompareImages() {
  const [imageA, setImageA] = useState<File | null>(null)
  const [imageB, setImageB] = useState<File | null>(null)
  const [dataUri, setDataUri] = useState<string | null>(null)
  const [similarity, setSimilarity] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!imageA || !imageB) return
    setLoading(true)
    setError(null)
    try {
      const { data_uri, similarity } = await api.compareImages(imageA, imageB)
      setDataUri(data_uri)
      setSimilarity(similarity)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Comparer deux images</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image A">
          <ImageInput onFileChange={setImageA} />
        </Field>
        <Field label="Image B">
          <ImageInput onFileChange={setImageB} />
        </Field>
        <Button type="submit" disabled={!imageA || !imageB || loading} loading={loading} className="self-start">
          Comparer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      {dataUri && similarity !== null && (
        <div className="mt-4 flex flex-col items-start gap-3">
          <p>Similarité : {(similarity * 100).toFixed(1)}%</p>
          <img src={dataUri} alt="Différences (zones rouges = différentes)" className="rounded-lg border" />
        </div>
      )}
    </section>
  )
}
