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
    // Syncs React state with the browser's object-URL lifecycle (create on a
    // new blob, revoke on the way out) — an external resource, not a value
    // merely derived from props, so this is the case react-hooks's
    // set-state-in-effect rule itself carves out ("subscribe to an external
    // system, calling setState when it changes").
    if (!blob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      {previewType === 'video' && (
        // No caption track: this previews a file the tool just generated
        // (converted/trimmed/etc.), not authored content — there's no
        // caption source that could exist for it.
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={url} controls className="max-w-full rounded-lg border" />
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- see the video case above */}
      {previewType === 'audio' && <audio src={url} controls />}
      <Button
        onClick={() => {
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          a.click()
        }}
      >
        Télécharger {filename}
      </Button>
    </div>
  )
}
