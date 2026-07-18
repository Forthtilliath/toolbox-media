import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { NumberInput } from '@forthtilliath/forth-ui/components/number-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forthtilliath/shadcn-ui/components/select'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Direction = 'svg-to-png' | 'png-to-svg'

export default function SvgConvert() {
  const [file, setFile] = useState<File | null>(null)
  const [direction, setDirection] = useState<Direction>('svg-to-png')
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.svgConvert(file, direction, width)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Convertir SVG ↔ PNG</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Sens">
          <Select value={direction} onValueChange={(value) => setDirection(value as Direction)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="svg-to-png">SVG → PNG (rasteriser)</SelectItem>
              <SelectItem value="png-to-svg">PNG → SVG (encapsuler)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={direction === 'svg-to-png' ? 'Fichier SVG' : 'Fichier PNG'}>
          <ImageInput onFileChange={setFile} />
        </Field>
        {direction === 'svg-to-png' && (
          <Field label="Largeur cible (px, optionnel)">
            <NumberInput min={1} value={width ?? 1} onValueChange={setWidth} />
          </Field>
        )}
        <Button type="submit" disabled={!file} loading={loading} className="self-start">
          Convertir
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel
        blob={result}
        filename={direction === 'svg-to-png' ? 'converted.png' : 'converted.svg'}
        previewType="image"
      />
    </section>
  )
}
