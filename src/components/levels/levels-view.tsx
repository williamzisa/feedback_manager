import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LevelsTable } from './levels-table'

const mockLevels = [
  { categoria: 'CEO', numero: 1, lettera: 'A', pesoExecution: '30%', pesoSoft: '30%', pesoStrategy: '40%', standard: 4.2, nUser: 2 },
  { categoria: 'Chief', numero: 2, lettera: 'A', pesoExecution: '30%', pesoSoft: '40%', pesoStrategy: '30%', standard: 4, nUser: 4 },
  { categoria: 'Director', numero: 1, lettera: 'A', pesoExecution: '40%', pesoSoft: '30%', pesoStrategy: '30%', standard: 4, nUser: 4 },
  { categoria: 'Director', numero: 3, lettera: 'B', pesoExecution: '30%', pesoSoft: '50%', pesoStrategy: '20%', standard: 3.8, nUser: 6 },
]

export const LevelsView = () => {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="search"
            placeholder="Cerca Livello"
            className="w-full bg-white"
          />
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
          Aggiungi Livello
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">4 risultati</p>
        </div>
        <div className="p-4">
          <div className="block sm:hidden space-y-4">
            {mockLevels.map((level, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{level.categoria}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {level.numero}
                    </span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      {level.lettera}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="text-xs text-gray-500">Execution</p>
                      <p className="font-medium">{level.pesoExecution}</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="text-xs text-gray-500">Soft</p>
                      <p className="font-medium">{level.pesoSoft}</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="text-xs text-gray-500">Strategy</p>
                      <p className="font-medium">{level.pesoStrategy}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-gray-500">Standard:</span>
                      <span className="ml-2 font-medium">{level.standard}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Utenti:</span>
                      <span className="ml-2 font-medium">{level.nUser}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <LevelsTable levels={mockLevels} />
          </div>
        </div>
      </div>
    </div>
  )
}
