import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { CodeBlock } from '@forthtilliath/forth-ui/components/code-block'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function Lqip() {
  const [file, setFile] = useState<File | null>(null)
  const [dataUri, setDataUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { data_uri } = await api.lqip(file)
      setDataUri(data_uri)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer un placeholder flou (LQIP)</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
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
      {dataUri && (
        <div className="mt-4 flex flex-col items-start gap-3">
          <img src={dataUri} alt="Placeholder flou" className="w-50 rounded-lg border" />
          <CodeBlock code={dataUri} language="text" className="w-full" />
        </div>
      )}
    </section>
  )
}
