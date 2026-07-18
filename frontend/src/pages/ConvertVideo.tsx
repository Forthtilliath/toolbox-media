import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forthtilliath/shadcn-ui/components/select'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

const FORMATS = ['mp4', 'webm', 'mov', 'mkv', 'avi']

export default function ConvertVideo() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState('webm')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.convertVideo(file, format)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Convertir le format d'une vidéo</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Vidéo">
          <Dropzone
            value={file ? [file] : []}
            onValueChange={(files) => setFile(files[0] ?? null)}
            accept="video/*"
            multiple={false}
          />
        </Field>
        <Field label="Format cible">
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button type="submit" disabled={!file || loading} loading={loading} className="self-start">
          Convertir
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename={`converted.${format}`} previewType="video" />
    </section>
  )
}
