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
      
      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center">
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
          <h1 className="text-2xl font-semibold text-gray-900">Domande</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Totale Domande</h3>
            <p className="text-2xl font-semibold mt-1">284</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">SOFT</h3>
            <p className="text-2xl font-semibold mt-1">94</p>
          </div>
          <div className="bg-green-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">STRATEGY</h3>
            <p className="text-2xl font-semibold mt-1">82</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">EXECUTION</h3>
            <p className="text-2xl font-semibold mt-1">108</p>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mt-6">
          <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-64">
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
            </div>
            <Button className="w-full sm:w-auto whitespace-nowrap">
              Nuova Domanda
            </Button>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">7 risultati</p>
            </div>
            <div className="p-4 overflow-x-auto">
              <div className="block sm:hidden space-y-4">
                {mockQuestions.map((question) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-500">#{question.id}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        question.type === 'SOFT' ? 'bg-blue-100 text-blue-800' :
                        question.type === 'STRATEGY' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {question.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{question.domanda}</p>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <QuestionsTable questions={mockQuestions} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
