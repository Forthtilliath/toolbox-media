import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { Input } from '@forthtilliath/shadcn-ui/components/input'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function RenameFiles() {
  const [files, setFiles] = useState<File[]>([])
  const [pattern, setPattern] = useState('fichier-{n:03d}')
  const [start, setStart] = useState(1)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.renameFiles(files, pattern, start)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Renommer un lot de fichiers</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Fichiers">
          <Dropzone value={files} onValueChange={setFiles} multiple />
        </Field>
        <Field
          label="Pattern"
          description="{n} = numéro, {n:03d} = numéro sur 3 chiffres, {name} = nom original, {ext} = extension"
        >
          <Input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} />
        </Field>
        <Field label="Numéro de départ">
          <NumberInput value={start} onValueChange={setStart} />
        </Field>
        <Button type="submit" disabled={files.length === 0} loading={loading} className="self-start">
          Renommer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="renamed_files.zip" previewType="none" />
    </section>
  )
}
