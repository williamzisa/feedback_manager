import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Process, ProcessFormData } from "@/lib/types/processes"
import { Loader2, Trash2 } from "lucide-react"
import { queries } from "@/lib/supabase/queries"

interface ProcessFormProps {
  onSubmit: (data: ProcessFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  initialData?: Process
  mode?: 'create' | 'edit'
}

export function ProcessForm({
  onSubmit,
  onDelete,
  isLoading = false,
  initialData,
  mode = 'create'
}: ProcessFormProps) {
  const [questions, setQuestions] = useState<Array<{ id: string, description: string }>>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)

  const form = useForm<ProcessFormData>({
    defaultValues: {
      name: initialData?.name || '',
      linked_question_id: initialData?.linked_question_id || ''
    }
  })

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await queries.questions.getAll()
        setQuestions(data)
      } catch (err) {
        console.error('Errore nel caricamento delle domande:', err)
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    loadQuestions()
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Processo</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linked_question_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domanda Collegata</FormLabel>
              <Select 
                disabled={isLoading || isLoadingQuestions}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una domanda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {questions.map((question) => (
                    <SelectItem key={question.id} value={question.id}>
                      {question.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Crea Processo' : 'Aggiorna Processo'}
          </Button>
          
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Elimina
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
} 