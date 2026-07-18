import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { useState } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function IconPack() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [resultName, setResultName] = useState('favicon.ico')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate(kind: 'favicon' | 'pack') {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = kind === 'favicon' ? await api.favicon(file) : await api.iconPack(file)
      setResult(blob)
      setResultName(kind === 'favicon' ? 'favicon.ico' : 'icon_pack.zip')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Favicon et pack d'icônes</h2>
      <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={!file} loading={loading} onClick={() => generate('favicon')}>
            Générer favicon.ico
          </Button>
          <Button type="button" disabled={!file} loading={loading} onClick={() => generate('pack')}>
            Générer le pack complet (apple-touch-icon, PWA, manifest.json)
          </Button>
        </div>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename={resultName} previewType="none" />
    </section>
  )
}
