import Link from "next/link";
import BottomNav from "@/components/navigation/bottom-nav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="w-10" /> {/* Placeholder per bilanciare il layout */}
          <h1 className="text-[24px] font-bold text-gray-900">Home</h1>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Sessione in Corso */}
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <h2 className="text-[24px] font-bold text-gray-900 mb-2">Partecipa alla Sessione in Corso</h2>
          <p className="text-blue-500 mb-4">La sessione terminerà il: 31/12/2024</p>
          <Link 
            href="/session"
            className="inline-block px-6 py-2 bg-orange-400 text-white text-sm font-medium rounded-full hover:bg-orange-500 transition-colors"
          >
            VAI
          </Link>
        </div>

        {/* I miei Risultati */}
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <h2 className="text-[24px] font-bold text-gray-900 mb-2">I miei Risultati</h2>
          <p className="text-blue-500 mb-4">3 risultati disponibili</p>
          <Link 
            href="/session_results"
            className="inline-block px-6 py-2 bg-emerald-500 text-white text-sm font-medium rounded-full hover:bg-emerald-600 transition-colors"
          >
            I miei Risultati
          </Link>
        </div>

        {/* Le mie Persone */}
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <h2 className="text-[24px] font-bold text-gray-900 mb-2">Le mie Persone</h2>
          <p className="text-blue-500 mb-4">6 persone hanno me come Mentor</p>
          <Link 
            href="/people"
            className="inline-block px-6 py-2 bg-emerald-500 text-white text-sm font-medium rounded-full hover:bg-emerald-600 transition-colors"
          >
            VAI
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
