import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { CodeBlock } from '@forthtilliath/forth-ui/components/code-block'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function ExtractExif() {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { metadata } = await api.extractExif(file)
      setMetadata(metadata)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Extraire les métadonnées EXIF</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <Button type="submit" disabled={!file} loading={loading} className="self-start">
          Extraire
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      {metadata &&
        (Object.keys(metadata).length === 0 ? (
          <p className="mt-4">Aucune métadonnée EXIF trouvée dans cette image.</p>
        ) : (
          <CodeBlock className="mt-4" code={JSON.stringify(metadata, null, 2)} language="json" />
        ))}
    </section>
  )
}
