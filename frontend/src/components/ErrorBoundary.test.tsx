import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Kaboom')
  return <div>All good</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs the caught error to console.error — expected noise for this test.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children normally when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('shows a fallback with the error message when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('heading', { name: 'Une erreur est survenue' })).toBeInTheDocument()
    expect(screen.getByRole('alert').textContent).toContain('Kaboom')
    expect(screen.queryByText('All good')).not.toBeInTheDocument()
  })

  it('recovers when Réessayer is clicked and the child stops throwing', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Boom shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('heading', { name: 'Une erreur est survenue' })).toBeInTheDocument()

    rerender(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    )
    // Still showing the fallback — the boundary's own error state doesn't clear on new props alone.
    expect(screen.getByRole('heading', { name: 'Une erreur est survenue' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(screen.getByText('All good')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Une erreur est survenue' })).not.toBeInTheDocument()
  })
})
