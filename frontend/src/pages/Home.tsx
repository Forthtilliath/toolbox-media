import { Link } from 'react-router-dom'

const tools = [
  { to: '/remove-background', label: 'Remove BG', description: "Supprimer le fond d'une image" },
  {
    to: '/color-match',
    label: 'Uniformiser teintes',
    description: "Aligner les couleurs d'un groupe de photos sur une référence",
  },
  { to: '/compress-image', label: 'Compresser image', description: "Réduire le poids d'une image" },
  { to: '/convert-image', label: 'Convertir image', description: "Changer le format d'une image" },
  { to: '/trim-video', label: 'Couper vidéo', description: "Extraire un passage d'une vidéo" },
  { to: '/video-to-gif', label: 'Vidéo -> GIF', description: 'Transformer un extrait vidéo en GIF' },
]

export default function Home() {
  return (
    <section>
      <h2>Outils disponibles</h2>
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
