import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('Layout', () => {
  it('keeps the sidebar and main content independently scrollable', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    const root = container.querySelector('.flex.h-screen') as HTMLElement
    expect(root).toHaveClass('overflow-hidden')
    const nav = container.querySelector('nav') as HTMLElement
    const main = container.querySelector('main') as HTMLElement
    expect(nav).toBeInTheDocument()
    expect(main).toHaveClass('overflow-y-auto')
  })

  it('resets the main content scroll position when navigating to another page', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    const main = container.querySelector('main') as HTMLElement
    main.scrollTop = 500
    expect(main.scrollTop).toBe(500)

    fireEvent.click(screen.getByRole('link', { name: 'Rogner' }))

    // The target page is a React.lazy route — its chunk resolves asynchronously.
    expect(await screen.findByRole('heading', { level: 2, name: 'Rogner une image' })).toBeInTheDocument()
    expect(main.scrollTop).toBe(0)
  })

  it('provides a skip link that points at the main content landmark', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    const skipLink = screen.getByRole('link', { name: 'Aller au contenu principal' })
    const main = screen.getByRole('main')
    expect(skipLink.getAttribute('href')).toBe(`#${main.id}`)
  })
})
