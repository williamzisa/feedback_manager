'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClusterFormValues, clusterSchema } from "./cluster-schema"

interface ClusterFormProps {
  initialData?: ClusterFormValues
  onSubmit: (data: ClusterFormValues) => void
  isLoading?: boolean
}

export function ClusterForm({
  initialData,
  onSubmit,
  isLoading
}: ClusterFormProps) {
  const form = useForm<ClusterFormValues>({
    resolver: zodResolver(clusterSchema),
    defaultValues: initialData || {
      name: "",
      cluster_leader: "",
      level: "",
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Input text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cluster_leader"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cluster Leader</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cluster leader" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO: Populate with actual users */}
                  <SelectItem value="user1">User 1</SelectItem>
                  <SelectItem value="user2">User 2</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Livello</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un livello" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO: Populate with actual levels */}
                  <SelectItem value="level1">Level 1</SelectItem>
                  <SelectItem value="level2">Level 2</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {initialData ? "SALVA" : "CREA CLUSTER"}
        </Button>
      </form>
    </Form>
  )
}
