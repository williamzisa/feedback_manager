import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

// Elenco delle route pubbliche accessibili senza sessione
const publicRoutes = ['/login', '/signup', '/reset-password', '/update-password'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Se non c'è una sessione e la route NON è pubblica, redirect a /login
  if (!session && !publicRoutes.includes(pathname)) {
    // Eccezione per la root (pagina principale), che potrebbe essere pubblica
    // Aggiungi altre eccezioni se necessario
    if (pathname === '/') {
      // Lascia passare alla home page pubblica se non c'è sessione
      // Se la home deve essere protetta, rimuovi questo if
    } else {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Se c'è una sessione e l'utente prova ad accedere a una route pubblica (es. /login), redirect alla home
  if (session && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protezione delle route admin
  if (pathname.startsWith('/admin')) {
    // Se non c'è una sessione, redirect a /login (già coperto sopra, ma ridondanza sicura)
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    try {
      // Verifica se l'utente è admin
      const { data: user, error } = await supabase
        .from("users")
        .select("admin")
        .eq("auth_id", session.user.id)
        .single()

      if (error || !user || !user.admin) {
        // Se non è admin, redirect alla home
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (err) {
      console.error("Errore nella verifica dei permessi admin:", err)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

// Configuriamo il matcher per escludere i file statici e includere solo i percorsi che vogliamo proteggere
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
