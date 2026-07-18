import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Dropzone } from '@forthtilliath/forth-ui/components/dropzone'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { ImageInput } from '@forthtilliath/forth-ui/components/image-input'
import { Input } from '@forthtilliath/shadcn-ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forthtilliath/shadcn-ui/components/select'
import { Slider } from '@forthtilliath/shadcn-ui/components/slider'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

type Mode = 'text' | 'logo'

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center']

export default function Watermark() {
  const [images, setImages] = useState<File[]>([])
  const [mode, setMode] = useState<Mode>('text')
  const [text, setText] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [opacity, setOpacity] = useState(70)
  const [position, setPosition] = useState('bottom-right')
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = images.length > 0 && (mode === 'text' ? text.trim() !== '' : logo !== null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.watermarkImages(images, {
        text: mode === 'text' ? text : undefined,
        logo: mode === 'logo' ? (logo ?? undefined) : undefined,
        opacity,
        position,
      })
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Ajouter un filigrane</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Photos à filigraner">
          <Dropzone value={images} onValueChange={setImages} accept="image/*" multiple />
        </Field>
        <Field label="Type">
          <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texte</SelectItem>
              <SelectItem value="logo">Logo (image)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {mode === 'text' ? (
          <Field label="Texte">
            <Input type="text" value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
        ) : (
          <Field label="Logo">
            <ImageInput onFileChange={setLogo} />
          </Field>
        )}
        <Field label="Position">
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={`Opacité : ${opacity}%`}>
          <Slider min={0} max={100} value={[opacity]} onValueChange={([value]) => setOpacity(value)} />
        </Field>
        <Button type="submit" disabled={!canSubmit} loading={loading} className="self-start">
          Appliquer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="watermarked_images.zip" previewType="none" />
    </section>
  )
}
