'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isSessionError, setIsSessionError] = useState(false)

  useEffect(() => {
    console.error('Errore applicazione:', error)
    
    // Controlla se l'errore è relativo alla sessione
    if (error.message.includes('login') || 
        error.message.includes('sessione') || 
        error.message.includes('Sessione non valida') ||
        error.message.includes('utente non autenticato') ||
        error.message.includes('auth')) {
      setIsSessionError(true)
      // Reindirizza automaticamente al login dopo 3 secondi
      const timer = setTimeout(() => {
        router.push('/login')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [error, router])

  if (isSessionError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Sessione scaduta</h2>
        <p className="text-sm text-muted-foreground mb-6">Sarai reindirizzato alla pagina di login...</p>
        <Button 
          variant="default"
          onClick={() => router.push('/login')}
        >
          Vai al login
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold mb-4">Qualcosa è andato storto</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {error.message || 'Si è verificato un errore imprevisto.'}
      </p>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => reset()}
        >
          Riprova
        </Button>
        <Button 
          variant="default"
          onClick={() => router.push('/')}
        >
          Torna alla home
        </Button>
      </div>
    </div>
  )
} 