import Link from "next/link";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Home" />

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
