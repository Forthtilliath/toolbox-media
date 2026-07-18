import { Button } from '@forthtilliath/forth-ui/components/button'
import { useEffect, useState } from 'react'

interface ResultPanelProps {
  blob: Blob | null
  filename: string
  previewType?: 'image' | 'video' | 'audio' | 'none'
}

export default function ResultPanel({ blob, filename, previewType = 'none' }: ResultPanelProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  if (!url) return null

  return (
    <div className="mt-6 flex flex-col items-start gap-3">
      {previewType === 'image' && <img src={url} alt="Résultat" className="max-w-full rounded-lg border" />}
      {previewType === 'video' && <video src={url} controls className="max-w-full rounded-lg border" />}
      {previewType === 'audio' && <audio src={url} controls />}
      <Button asChild>
        <a href={url} download={filename}>
          Télécharger {filename}
        </a>
      </Button>
    </div>
  )
}
