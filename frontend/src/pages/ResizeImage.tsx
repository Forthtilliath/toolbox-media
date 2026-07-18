import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { Checkbox } from '@forthtilliath/shadcn-ui/components/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forthtilliath/shadcn-ui/components/select'
import { Slider } from '@forthtilliath/shadcn-ui/components/slider'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'dimensions' | 'percent'

export default function ResizeImage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>('percent')
  const [percent, setPercent] = useState(50)
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const [keepRatio, setKeepRatio] = useState(true)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = file !== null && (mode === 'percent' || width !== undefined || height !== undefined)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file || !canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.resizeImage(
        file,
        mode === 'percent' ? { percent, keepRatio: true } : { width, height, keepRatio },
      )
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Redimensionner une image</h2>
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
              <SelectItem value="percent">Pourcentage</SelectItem>
              <SelectItem value="dimensions">Dimensions</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {mode === 'percent' ? (
          <Field label={`Échelle : ${percent}%`}>
            <Slider min={5} max={200} value={[percent]} onValueChange={([value]) => setPercent(value)} />
          </Field>
        ) : (
          <>
            <Field label="Largeur (px)">
              <NumberInput min={1} value={width ?? 1} onValueChange={setWidth} />
            </Field>
            <Field label="Hauteur (px)">
              <NumberInput min={1} value={height ?? 1} onValueChange={setHeight} />
            </Field>
            <Field orientation="horizontal" label="Conserver le ratio">
              <Checkbox checked={keepRatio} onCheckedChange={(checked) => setKeepRatio(checked === true)} />
            </Field>
          </>
        )}
        <Button type="submit" disabled={!canSubmit || loading} loading={loading} className="self-start">
          Redimensionner
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="resized.jpg" previewType="image" />
    </section>
  )
}
