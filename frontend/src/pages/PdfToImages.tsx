import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null)
  const [dpi, setDpi] = useState(150)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.pdfToImages(file, dpi)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Extraire les pages d'un PDF en images</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Fichier PDF">
          <Dropzone
            value={file ? [file] : []}
            onValueChange={(files) => setFile(files[0] ?? null)}
            accept="application/pdf"
            multiple={false}
          />
        </Field>
        <Field label="Résolution (DPI)">
          <NumberInput min={50} max={600} value={dpi} onValueChange={setDpi} />
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
      <ResultPanel blob={result} filename="pdf_pages.zip" previewType="none" />
    </section>
  )
}
