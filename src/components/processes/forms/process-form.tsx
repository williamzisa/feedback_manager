import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Process, ProcessFormData } from "@/lib/types/processes"
import { Loader2, Trash2 } from "lucide-react"

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
  const form = useForm<ProcessFormData>({
    defaultValues: {
      processo: initialData?.processo || '',
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="processo"
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