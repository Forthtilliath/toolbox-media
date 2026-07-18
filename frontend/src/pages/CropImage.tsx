import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forthtilliath/shadcn-ui/components/select'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'ratio' | 'manual'

export default function CropImage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>('ratio')
  const [ratio, setRatio] = useState('1:1')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [width, setWidth] = useState(200)
  const [height, setHeight] = useState(200)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.cropImage(file, mode === 'ratio' ? { ratio } : { x, y, width, height })
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Rogner une image</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <Field label="Mode">
          <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <SelectTrigger className="w-full" aria-label="Mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ratio">Ratio prédéfini (centré)</SelectItem>
              <SelectItem value="manual">Zone manuelle (pixels)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {mode === 'ratio' ? (
          <Field label="Ratio">
            <Select value={ratio} onValueChange={setRatio}>
              <SelectTrigger className="w-full" aria-label="Ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Field label="X">
              <NumberInput min={0} value={x} onValueChange={setX} />
            </Field>
            <Field label="Y">
              <NumberInput min={0} value={y} onValueChange={setY} />
            </Field>
            <Field label="Largeur">
              <NumberInput min={1} value={width} onValueChange={setWidth} />
            </Field>
            <Field label="Hauteur">
              <NumberInput min={1} value={height} onValueChange={setHeight} />
            </Field>
          </div>
        )}
        <Button type="submit" disabled={!file || loading} loading={loading} className="self-start">
          Rogner
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="cropped.jpg" previewType="image" />
    </section>
  )
}
