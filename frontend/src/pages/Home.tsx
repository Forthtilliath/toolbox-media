import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@forthtilliath/shadcn-ui/components/card'
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
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to}>
            <Card className="hover:border-primary h-full transition-colors">
              <CardHeader>
                <CardTitle>{tool.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
