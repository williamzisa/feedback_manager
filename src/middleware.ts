import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se non c'è una sessione e non siamo nella pagina di login, redirect al login
  if (!session && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se siamo nella route /admin, verifichiamo che l'utente sia admin e abbia una company
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session?.user?.id) {
      console.log('No session user id');
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('Checking admin access for user:', session.user.id);
    
    // Ottieni i dati dell'utente
    const { data: userData, error } = await supabase
      .from('users')
      .select('admin, company, auth_id')
      .eq('auth_id', session.user.id)
      .single()

    console.log('User data:', userData);
    console.log('Error:', error);

    if (error || !userData || !userData.admin || !userData.company) {
      console.log('Access denied:', { error, userData });
      // Se c'è un errore o l'utente non è admin o non ha una company, redirect alla home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return res
}

// Configuriamo il matcher per escludere i file statici e includere solo i percorsi che vogliamo proteggere
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
