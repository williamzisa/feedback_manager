'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LevelsTable } from './levels-table'
import { CreateLevelDialog } from './dialogs/create-level-dialog'
import { EditLevelDialog } from './dialogs/edit-level-dialog'
import type { Level } from '@/lib/types/levels'
import { mockLevels } from '@/lib/data/mock-levels'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const LevelsView = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [levels, setLevels] = useState<Level[]>(mockLevels)

  const filteredLevels = selectedFilter === 'all' 
    ? levels 
    : levels.filter(level => level.role === selectedFilter)

  const uniqueLevels = Array.from(new Set(levels.map(level => level.role)))

  const handleEdit = (level: Level) => {
    setSelectedLevel(level)
  }

  const handleSuccess = () => {
    setLevels([...mockLevels])
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Select
            value={selectedFilter}
            onValueChange={setSelectedFilter}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Filtra per livello" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i livelli</SelectItem>
              {uniqueLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="w-full sm:w-auto whitespace-nowrap"
          onClick={() => setIsCreateOpen(true)}
        >
          Nuovo Livello
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">{filteredLevels.length} risultati</p>
        </div>
        <div className="p-4">
          <div className="block sm:hidden space-y-4">
            {filteredLevels.map((level) => (
              <div key={level.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{level.role}</h3>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(level)}
                    >
                      Modifica
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="text-xs text-gray-500">Execution</p>
                      <p className="font-medium">{level.execution_weight}%</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="text-xs text-gray-500">Soft</p>
                      <p className="font-medium">{level.soft_weight}%</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="text-xs text-gray-500">Strategy</p>
                      <p className="font-medium">{level.strategy_weight}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-gray-500">Standard:</span>
                      <span className="ml-2 font-medium">{level.standard}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Step:</span>
                      <span className="ml-2 font-medium">{level.step}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <LevelsTable 
              levels={filteredLevels} 
              onEdit={handleEdit}
            />
          </div>
        </div>
      </div>

      <CreateLevelDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleSuccess}
      />

      <EditLevelDialog
        level={selectedLevel}
        open={!!selectedLevel}
        onOpenChange={(open) => !open && setSelectedLevel(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
