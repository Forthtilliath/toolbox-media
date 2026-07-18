import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function ExtractFrame() {
  const [file, setFile] = useState<File | null>(null)
  const [timestamp, setTimestamp] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.extractFrame(file, timestamp)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Extraire une frame / thumbnail</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Vidéo">
          <Dropzone
            value={file ? [file] : []}
            onValueChange={(files) => setFile(files[0] ?? null)}
            accept="video/*"
            multiple={false}
          />
        </Field>
        <Field label="Timestamp (secondes)">
          <NumberInput min={0} step={0.1} value={timestamp} onValueChange={setTimestamp} />
        </Field>
        <Button type="submit" disabled={!file || loading} loading={loading} className="self-start">
          Extraire
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="frame.png" previewType="image" />
    </section>
  )
}
