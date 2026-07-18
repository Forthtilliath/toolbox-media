import { Separator } from '@forthtilliath/shadcn-ui/components/separator'
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
        <div key={category.title} className="mt-8">
          <Separator className="mb-6" />
          <h3 className="mb-1">{category.title}</h3>
          <p>{category.intro}</p>
          <dl>
            {category.tools.map((tool) => (
              <div key={tool.to} className="my-4">
                <dt>
                  <Link to={tool.to} className="text-primary font-semibold hover:underline">
                    {tool.label}
                  </Link>
                </dt>
                <dd className="mt-1 text-sm opacity-85">{tool.description}</dd>
              </div>
            ))}
          </dl>
          {category.screenshot && (
            <img
              className="mt-4 max-w-full rounded-lg border"
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
