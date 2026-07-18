import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { Checkbox } from '@forthtilliath/shadcn-ui/components/checkbox'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function RotateFlipImage() {
  const [file, setFile] = useState<File | null>(null)
  const [angle, setAngle] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.rotateFlipImage(file, angle, flipHorizontal, flipVertical)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Pivoter / retourner une image</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <Field label="Rotation (degrés, sens horaire)">
          <NumberInput step={1} value={angle} onValueChange={setAngle} />
        </Field>
        <Field orientation="horizontal" label="Retourner horizontalement">
          <Checkbox checked={flipHorizontal} onCheckedChange={(checked) => setFlipHorizontal(checked === true)} />
        </Field>
        <Field orientation="horizontal" label="Retourner verticalement">
          <Checkbox checked={flipVertical} onCheckedChange={(checked) => setFlipVertical(checked === true)} />
        </Field>
        <Button type="submit" disabled={!file} loading={loading} className="self-start">
          Appliquer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="rotated.jpg" previewType="image" />
    </section>
  )
}
