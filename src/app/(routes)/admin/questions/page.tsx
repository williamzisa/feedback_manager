'use client'

import { useState, useEffect } from 'react'
import { queries } from '@/lib/supabase/queries'
import { QuestionsView } from '@/components/questions/questions-view'
import { Question, QuestionFormData } from '@/lib/types/questions'
import { StatCard } from '@/components/stats/stat-card'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
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
  const handleCreate = async (data: QuestionFormData) => {
    try {
      const newQuestion = await queries.questions.create({
        text: data.text,
        type: data.type,
        created_at: new Date().toISOString(),
        company: null
      }) as Question
      setQuestions([newQuestion, ...questions])
      return true
    } catch (err) {
      setError('Failed to create question')
      console.error('Error creating question:', err)
      return false
    }
  }

  const handleEdit = async (id: string, data: QuestionFormData) => {
    try {
      await queries.questions.update(id, {
        text: data.text,
        type: data.type
      })
      setQuestions(questions.map((q) => q.id === id ? {
        ...q,
        text: data.text,
        type: data.type
      } : q))
    } catch (err) {
      setError('Failed to update question')
      console.error('Error updating question:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await queries.questions.delete(id)
      setQuestions(questions.filter((q) => q.id !== id))
    } catch (err) {
      setError('Failed to delete question')
      console.error('Error deleting question:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <circle cx="12" cy="12" r="8" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12" y2="17" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Domande</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="N.DOMANDE" value={questions.length} />
          <StatCard 
            title="SOFT" 
            value={questions.filter(q => q.type === 'SOFT').length} 
            className="bg-blue-100" 
          />
          <StatCard 
            title="STRATEGY" 
            value={questions.filter(q => q.type === 'STRATEGY').length} 
            className="bg-green-100" 
          />
          <StatCard 
            title="EXECUTION" 
            value={questions.filter(q => q.type === 'EXECUTION').length} 
            className="bg-yellow-100" 
          />
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