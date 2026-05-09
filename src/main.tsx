import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import App from './App.tsx'
import './index.css'

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4 text-center">
      <div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-4">{(error as any)?.message || 'An unexpected error occurred'}</p>
        <button onClick={() => window.location.href = '/'} className="bg-blue-600 px-6 py-2 rounded-xl">Go to Homepage</button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
