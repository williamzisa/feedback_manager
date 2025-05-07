'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginError() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="mx-auto w-full max-w-md p-6 space-y-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold text-center">
          Sessione scaduta o non valida
        </h2>
        
        <p className="text-sm text-center text-muted-foreground">
          È necessario effettuare nuovamente l&apos;accesso per continuare.
        </p>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Accedi
          </Button>
        </div>
      </div>
    </div>
  )
} 