import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, type ReactNode } from 'react'
import { ScrollShadow } from '@forthtilliath/forth-ui/components/scroll-shadow'
import { Separator } from '@forthtilliath/shadcn-ui/components/separator'
import { cn } from '@forthtilliath/shadcn-ui/lib/utils'
import { toolCategories } from '../toolCategories'

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <h1 className="px-4 py-5 text-lg font-semibold">Toolbox Media</h1>
        <ScrollShadow className="flex-1 px-2 pb-4">
          <ul className="flex flex-col gap-1">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-2 text-sm',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )
                }
              >
                Accueil
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/documentation"
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-2 text-sm',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )
                }
              >
                Documentation
              </NavLink>
            </li>
          </ul>

          {toolCategories.map((category) => (
            <div key={category.title}>
              <Separator className="my-3" />
              <p className="px-3 text-xs font-semibold tracking-wide text-sidebar-foreground/60 uppercase">
                {category.title}
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {category.tools.map((tool) => (
                  <li key={tool.to}>
                    <NavLink
                      to={tool.to}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2 text-sm',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )
                      }
                    >
                      {tool.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ScrollShadow>
      </nav>
      <main ref={mainRef} className="flex-1 overflow-y-auto bg-background p-8 text-foreground">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  )
}
