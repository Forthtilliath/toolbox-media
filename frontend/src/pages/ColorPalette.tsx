import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { Slider } from '@forthtilliath/shadcn-ui/components/slider'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'

interface Color {
  hex: string
  rgb: number[]
  percentage: number
}

export default function ColorPalette() {
  const [file, setFile] = useState<File | null>(null)
  const [numColors, setNumColors] = useState(5)
  const [colors, setColors] = useState<Color[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { colors } = await api.colorPalette(file, numColors)
      setColors(colors)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Extraire la palette de couleurs dominante</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Image">
          <ImageInput onFileChange={setFile} />
        </Field>
        <Field label={`Nombre de couleurs : ${numColors}`}>
          <Slider min={2} max={10} value={[numColors]} onValueChange={([value]) => setNumColors(value)} />
        </Field>
        <Button type="submit" disabled={!file || loading} loading={loading} className="self-start">
          Extraire
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      {colors && (
        <div className="mt-4 flex flex-col gap-3">
          {colors.map((color) => (
            <div key={color.hex} className="flex items-center gap-3">
              <div
                className="size-10 shrink-0 rounded-md border"
                style={{ backgroundColor: color.hex, borderColor: 'rgba(128,128,128,0.4)' }}
              />
              <span>
                {color.hex} — {color.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
