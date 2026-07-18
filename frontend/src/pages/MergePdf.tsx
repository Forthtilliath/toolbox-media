import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (files.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.mergePdf(files)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Fusionner plusieurs PDF</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Fichiers PDF (au moins 2, dans l'ordre voulu)">
          <Dropzone value={files} onValueChange={setFiles} accept="application/pdf" multiple />
        </Field>
        <Button type="submit" disabled={files.length < 2 || loading} loading={loading} className="self-start">
          Fusionner
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="merged.pdf" previewType="none" />
    </section>
  )
}
