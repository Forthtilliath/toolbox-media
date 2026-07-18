import { Link } from 'react-router-dom'
import { toolCategories } from '../toolCategories'

export default function Documentation() {
  return (
    <section>
      <h2>Guide complet des outils</h2>
      <p>
        Toolbox Media regroupe {toolCategories.reduce((n, c) => n + c.tools.length, 0)} outils de traitement
        d'image et de vidéo, organisés en {toolCategories.length} catégories. Chaque outil est une page
        indépendante : upload du ou des fichiers, réglage des paramètres, et téléchargement du résultat.
      </p>

      {toolCategories.map((category) => (
        <div key={category.title} className="doc-category">
          <h3>{category.title}</h3>
          <p>{category.intro}</p>
          <dl>
            {category.tools.map((tool) => (
              <div key={tool.to} className="doc-tool">
                <dt>
                  <Link to={tool.to}>{tool.label}</Link>
                </dt>
                <dd>{tool.description}</dd>
              </div>
            ))}
          </dl>
          {category.screenshot && (
            <img
              className="doc-screenshot"
              src={category.screenshot.src}
              alt={category.screenshot.alt}
              loading="lazy"
            />
          )}
        </div>
      ))}
    </section>
  )
}
