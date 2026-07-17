import { Link } from 'react-router-dom'

const tools = [
  { to: '/remove-background', label: 'Remove BG', description: "Supprimer le fond d'une image" },
  {
    to: '/color-match',
    label: 'Uniformiser teintes',
    description: "Aligner les couleurs d'un groupe de photos sur une référence",
  },
  {
    to: '/brightness-match',
    label: 'Uniformiser luminosité',
    description: "Égaliser la luminosité d'un groupe de photos (moyenne du lot ou référence)",
  },
  { to: '/compress-image', label: 'Compresser image', description: "Réduire le poids d'une image" },
  { to: '/convert-image', label: 'Convertir image', description: "Changer le format d'une image" },
  { to: '/crop-image', label: 'Rogner image', description: "Recadrer une image (ratio prédéfini ou zone manuelle)" },
  {
    to: '/resize-image',
    label: 'Redimensionner image',
    description: "Changer les dimensions d'une image (pourcentage ou pixels)",
  },
  {
    to: '/rotate-flip-image',
    label: 'Pivoter / retourner',
    description: "Faire pivoter une image ou la retourner horizontalement/verticalement",
  },
  {
    to: '/watermark',
    label: 'Filigrane',
    description: "Ajouter un texte ou un logo sur un lot de photos",
  },
  {
    to: '/adjust-images',
    label: 'Luminosité / contraste / saturation',
    description: "Ajuster manuellement un lot de photos avec les mêmes réglages",
  },
  {
    to: '/icon-pack',
    label: 'Favicon / pack icônes',
    description: 'Générer favicon.ico ou un pack complet (apple-touch-icon, PWA, manifest.json)',
  },
  {
    to: '/srcset',
    label: 'Srcset responsive',
    description: "Générer plusieurs tailles d'une image pour l'attribut srcset",
  },
  {
    to: '/lqip',
    label: 'Placeholder flou (LQIP)',
    description: 'Générer une mini image floutée en data URI pour le lazy loading',
  },
  {
    to: '/base64-encode',
    label: 'Encoder en base64',
    description: 'Convertir une image en data URI pour inline CSS/HTML',
  },
  {
    to: '/spritesheet',
    label: 'Spritesheet CSS',
    description: 'Assembler plusieurs icônes en une image + CSS associé',
  },
  { to: '/svg-optimize', label: 'Optimiser SVG', description: 'Nettoyer et minifier un fichier SVG' },
  {
    to: '/svg-convert',
    label: 'Convertir SVG/PNG',
    description: 'Rasteriser un SVG en PNG, ou encapsuler un PNG dans un SVG',
  },
  {
    to: '/color-palette',
    label: 'Palette de couleurs',
    description: "Extraire les couleurs dominantes d'une image",
  },
  {
    to: '/compare-images',
    label: 'Comparer deux images',
    description: 'Score de similarité + heatmap des différences',
  },
  { to: '/trim-video', label: 'Couper vidéo', description: "Extraire un passage d'une vidéo" },
  { to: '/video-to-gif', label: 'Vidéo -> GIF', description: 'Transformer un extrait vidéo en GIF' },
  { to: '/convert-video', label: 'Convertir vidéo', description: 'Changer le format (mp4, webm, mov, mkv, avi)' },
  {
    to: '/compress-video',
    label: 'Compresser vidéo',
    description: 'Réduire le poids via un bitrate et/ou une largeur cible',
  },
  {
    to: '/extract-frame',
    label: 'Extraire une frame',
    description: 'Récupérer une image fixe à un instant donné',
  },
  {
    to: '/concat-videos',
    label: 'Concaténer vidéos',
    description: 'Mettre bout à bout plusieurs extraits (résolution normalisée automatiquement)',
  },
  {
    to: '/audio-track',
    label: 'Piste audio',
    description: 'Retirer la piste audio, ou la remplacer par un autre fichier',
  },
  { to: '/qrcode', label: 'QR code', description: 'Générer un QR code à partir d\'un texte ou d\'une URL' },
  {
    to: '/images-to-pdf',
    label: 'Images vers PDF',
    description: 'Assembler plusieurs images en un seul PDF',
  },
  {
    to: '/pdf-to-images',
    label: 'PDF vers images',
    description: 'Extraire les pages d\'un PDF en images PNG',
  },
  {
    to: '/rename-files',
    label: 'Renommer en lot',
    description: 'Renommer plusieurs fichiers selon un pattern (numéro, nom original...)',
  },
]

export default function Home() {
  return (
    <section>
      <h2>Outils disponibles</h2>
      <p>
        Besoin d'une vue d'ensemble ? La <Link to="/documentation">documentation</Link> détaille chaque
        outil par catégorie.
      </p>
      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="tool-card">
            <h3>{tool.label}</h3>
            <p>{tool.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
