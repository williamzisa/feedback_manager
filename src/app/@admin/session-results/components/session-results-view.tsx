'use client'

import { SessionResultsTable } from './session-results-table'

export const SessionResultsView = () => {
  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <p className="text-sm text-gray-500">Risultati della sessione</p>
      </div>
      
      <div className="p-4">
        <SessionResultsTable />
      </div>
    </div>
  )
} 