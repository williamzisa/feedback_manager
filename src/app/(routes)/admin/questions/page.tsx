import { AdminHeader } from '@/components/layout/admin-header'
import { QuestionsTable } from '@/components/questions/questions-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Question } from '@/components/questions/questions-table'

const mockQuestions: Question[] = [
  { id: 1, domanda: 'Ottimista nell\'approccio al futuro', type: 'SOFT' },
  { id: 2, domanda: 'L\'elemento che tutti vorrebbero nel proprio team', type: 'STRATEGY' },
  { id: 3, domanda: 'Sa comunicare e condividere in modo chiaro l\'esito del proprio lavoro', type: 'EXECUTION' },
  { id: 4, domanda: 'Capacità di dire no alle continue urgenze, per poter mettere a terra le cose più importanti', type: 'EXECUTION' },
  { id: 5, domanda: 'Costanza nel riportare sui risultati raggiunti', type: 'SOFT' },
]

export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="mx-auto max-w-full px-8 py-8">
        {/* Questions Section */}
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <h2 className="text-xl font-semibold">Domande</h2>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-96">
              <Input
                type="search"
                placeholder="Cerca Domanda"
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-64">
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="">Type</option>
                <option value="SOFT">SOFT</option>
                <option value="STRATEGY">STRATEGY</option>
                <option value="EXECUTION">EXECUTION</option>
              </select>
            </div>
            <Button className="w-full sm:w-auto">
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              AGGIUNGI DOMANDA
            </Button>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            7 risultati
          </div>

          <QuestionsTable questions={mockQuestions} />
        </div>
      </main>
    </div>
  )
}
