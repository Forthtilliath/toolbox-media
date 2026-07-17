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
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label>
          Action
          <select value={action} onChange={(e) => setAction(e.target.value as Action)}>
            <option value="remove">Retirer la piste audio</option>
            <option value="replace">Remplacer/ajouter une piste audio</option>
          </select>
        </label>
        {action === 'replace' && (
          <label>
            Fichier audio
            <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} />
          </label>
        )}
        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? 'Traitement...' : 'Appliquer'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ResultPanel blob={result} filename="audio_track.mp4" previewType="video" />
    </section>
  )
}
