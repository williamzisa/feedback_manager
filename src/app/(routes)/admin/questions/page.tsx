'use client'

import { useState, useEffect } from 'react'
import { queries } from '@/lib/supabase/queries'
import { QuestionsView } from '@/components/questions/questions-view'
import { Question, QuestionFormData } from '@/lib/types/questions'
import { StatCard } from '@/components/stats/stat-card'
import { AdminHeader } from '@/components/layout/admin-header'
import { mockQuestionsApi } from '@/lib/data/mock-questions'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestionsApi.getAll())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = async () => {
    try {
      const data = await queries.questions.getAll() as Question[]
      setQuestions(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch questions')
      console.error('Error fetching questions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleCreate = async (data: QuestionFormData): Promise<boolean> => {
    try {
      mockQuestionsApi.create(data)
      setQuestions(mockQuestionsApi.getAll())
      return true
    } catch (error) {
      console.error('Error creating question:', error)
      return false
    }
  }

  const handleEdit = async (id: string, data: QuestionFormData): Promise<boolean> => {
    try {
      mockQuestionsApi.update(id, data)
      setQuestions(mockQuestionsApi.getAll())
      return true
    } catch (error) {
      console.error('Error updating question:', error)
      return false
    }
  }

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      mockQuestionsApi.delete(id)
      setQuestions(mockQuestionsApi.getAll())
      return true
    } catch (error) {
      console.error('Error deleting question:', error)
      return false
    }
  }

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
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Domande</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="Totale Domande" value={284} className="bg-white shadow-sm" />
          <StatCard title="Soft Skills" value={95} className="bg-blue-100" />
          <StatCard title="Strategy" value={89} className="bg-purple-100" />
          <StatCard title="Execution" value={100} className="bg-green-100" />
        </div>

        {error && <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-md">{error}</div>}
        {isLoading ? (
          <div className="text-center p-4">Loading questions...</div>
        ) : (
          <QuestionsView
            questions={questions}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}