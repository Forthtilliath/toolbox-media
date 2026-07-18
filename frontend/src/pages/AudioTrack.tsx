import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forthtilliath/shadcn-ui/components/select'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Action = 'remove' | 'replace'

export default function AudioTrack() {
  const [file, setFile] = useState<File | null>(null)
  const [action, setAction] = useState<Action>('remove')
  const [audio, setAudio] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = file !== null && (action === 'remove' || audio !== null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file || !canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.audioTrack(file, action, action === 'replace' ? (audio ?? undefined) : undefined)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Ajouter / retirer la piste audio</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Vidéo">
          <Dropzone
            value={file ? [file] : []}
            onValueChange={(files) => setFile(files[0] ?? null)}
            accept="video/*"
            multiple={false}
          />
        </Field>
        <Field label="Action">
          <Select value={action} onValueChange={(value) => setAction(value as Action)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remove">Retirer la piste audio</SelectItem>
              <SelectItem value="replace">Remplacer/ajouter une piste audio</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {action === 'replace' && (
          <Field label="Fichier audio">
            <Dropzone
              value={audio ? [audio] : []}
              onValueChange={(files) => setAudio(files[0] ?? null)}
              accept="audio/*"
              multiple={false}
            />
          </Field>
        )}
        <Button type="submit" disabled={!canSubmit} loading={loading} className="self-start">
          Appliquer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="audio_track.mp4" previewType="video" />
    </section>
  )
}
