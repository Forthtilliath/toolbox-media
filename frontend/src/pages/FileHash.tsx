import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { CodeBlock } from '@forthtilliath/forth-ui/components/code-block'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

export default function FileHash() {
  const [file, setFile] = useState<File | null>(null)
  const [hashes, setHashes] = useState<{ md5: string; sha256: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.computeHash(file)
      setHashes(result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Calculer le hash d'un fichier</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Fichier">
          <Dropzone
            value={file ? [file] : []}
            onValueChange={(files) => setFile(files[0] ?? null)}
            multiple={false}
          />
        </Field>
        <Button type="submit" disabled={!file} loading={loading} className="self-start">
          Calculer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      {hashes && (
        <div className="mt-4 flex flex-col gap-3">
          <CodeBlock code={hashes.md5} language="text" filename="MD5" />
          <CodeBlock code={hashes.sha256} language="text" filename="SHA-256" />
        </div>
      )}
    </section>
  )
}
