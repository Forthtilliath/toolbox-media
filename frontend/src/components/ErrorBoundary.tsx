import { Alert } from '@forthtilliath/forth-ui/components/alert'
import { Button } from '@forthtilliath/forth-ui/components/button'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error rendering the page:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <section>
        <h2>Une erreur est survenue</h2>
        <Alert variant="destructive" className="mt-4">
          {error.message || "Erreur inconnue — voir la console du navigateur pour plus de détails."}
        </Alert>
        <Button className="mt-4" onClick={() => this.setState({ error: null })}>
          Réessayer
        </Button>
      </section>
    )
  }
}
