import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function CompressVideo() {
  const [file, setFile] = useState<File | null>(null)
  const [bitrate, setBitrate] = useState<number | undefined>(1000)
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = file !== null && (bitrate !== undefined || width !== undefined)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file || !canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.compressVideo(file, bitrate, width)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Compresser une vidéo</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Vidéo">
          <Dropzone
            value={file ? [file] : []}
            onValueChange={(files) => setFile(files[0] ?? null)}
            accept="video/*"
            multiple={false}
          />
        </Field>
        <Field label="Bitrate vidéo cible (kbps)">
          <NumberInput min={100} value={bitrate} onValueChange={setBitrate} />
        </Field>
        <Field label="Largeur max (px, optionnel)">
          <NumberInput min={100} value={width ?? 100} onValueChange={setWidth} />
        </Field>
        <Button type="submit" disabled={!canSubmit} loading={loading} className="self-start">
          Compresser
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="compressed.mp4" previewType="video" />
    </section>
  )
}
