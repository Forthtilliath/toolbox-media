import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Field } from '@forthtilliath/forth-ui/components/field'
import { Input } from '@forthtilliath/shadcn-ui/components/input'
import { Slider } from '@forthtilliath/shadcn-ui/components/slider'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import ResultPanel from '../components/ResultPanel'

export default function QrCode() {
  const [data, setData] = useState('')
  const [boxSize, setBoxSize] = useState(10)
  const [result, setResult] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!data.trim()) return
    setLoading(true)
    setError(null)
    try {
      const blob = await api.qrcode(data, boxSize)
      setResult(blob)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Générer un QR code</h2>
      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <Field label="Texte ou URL">
          <Input type="text" value={data} onChange={(e) => setData(e.target.value)} />
        </Field>
        <Field label={`Taille des modules : ${boxSize}`}>
          <Slider min={4} max={20} value={[boxSize]} onValueChange={([value]) => setBoxSize(value)} />
        </Field>
        <Button type="submit" disabled={!data.trim()} loading={loading} className="self-start">
          Générer
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
      <ResultPanel blob={result} filename="qrcode.png" previewType="image" />
    </section>
  )
}
