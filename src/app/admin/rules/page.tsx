import { AdminHeader } from '@/components/layout/admin-header'
import { RulesTable } from '@/components/rules/rules-table'

const mockRules = [
  {
    numero: 1,
    nomeRegola: 'FEEDBACK SOFT E STRATEGY DA CLU VERSO TL',
    descrizione: 'Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.',
    note: true,
    codiceSQL: 'Apri'
  },
  {
    numero: 2,
    nomeRegola: 'FEEDBACK SOFT E STRATEGY DA CLU VERSO TL',
    descrizione: 'Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.',
    note: true,
    codiceSQL: 'Button'
  },
  {
    numero: 3,
    nomeRegola: 'FEEDBACK SOFT E STRATEGY DA CLU VERSO TL',
    descrizione: 'Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.',
    note: true,
    codiceSQL: 'Button'
  },
  {
    numero: 4,
    nomeRegola: 'FEEDBACK SOFT E STRATEGY DA CLU VERSO TL',
    descrizione: 'Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.',
    note: true,
    codiceSQL: 'Button'
  },
  {
    numero: 5,
    nomeRegola: 'FEEDBACK SOFT E STRATEGY DA CLU VERSO TL',
    descrizione: 'Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.',
    note: true,
    codiceSQL: 'Button'
  },
]

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="mx-auto max-w-full px-8 py-8">
        {/* Rules Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center">
            <svg
              className="mr-2 h-5 w-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <h2 className="text-xl font-semibold">Regole</h2>
          </div>

          <RulesTable rules={mockRules} />
        </div>
      </main>
    </div>
  )
}
