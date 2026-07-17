import { useEffect, useState } from 'react'

interface ResultPanelProps {
  blob: Blob | null
  filename: string
  previewType?: 'image' | 'video' | 'none'
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
    <div className="result-panel">
      {previewType === 'image' && <img src={url} alt="Résultat" />}
      {previewType === 'video' && <video src={url} controls />}
      <a href={url} download={filename}>
        Télécharger {filename}
      </a>
    </div>
  )
}
