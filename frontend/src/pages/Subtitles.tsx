import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function Subtitles() {
  const [video, setVideo] = useState<File | null>(null)
  const [srt, setSrt] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!video || !srt) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.burnSubtitles(video, srt)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Incruster des sous-titres</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Vidéo">
          <Dropzone
            value={video ? [video] : []}
            onValueChange={(files) => setVideo(files[0] ?? null)}
            accept="video/*"
            multiple={false}
          />
        </Field>
        <Field label="Fichier de sous-titres (.srt)">
          <Dropzone
            value={srt ? [srt] : []}
            onValueChange={(files) => setSrt(files[0] ?? null)}
            accept=".srt"
            multiple={false}
          />
        </Field>
        <Button type="submit" disabled={!video || !srt || loading} loading={loading} className="self-start">
          Incruster
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="sous-titres.mp4" previewType="video" />
    </section>
  )
}
