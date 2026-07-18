import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function ConcatVideos() {
  const [videos, setVideos] = useState<File[]>([])
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (videos.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.concatVideos(videos)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Concaténer plusieurs extraits vidéo</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Extraits (dans l'ordre, au moins 2, tous avec une piste audio)">
          <Dropzone value={videos} onValueChange={setVideos} accept="video/*" multiple />
        </Field>
        <Button type="submit" disabled={videos.length < 2} loading={loading} className="self-start">
          Concaténer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="concatenated.mp4" previewType="video" />
    </section>
  )
}
