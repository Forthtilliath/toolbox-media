import { Link } from 'react-router-dom'
import { toolCategories } from '../toolCategories'

const tools = toolCategories.flatMap((category) => category.tools)

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
