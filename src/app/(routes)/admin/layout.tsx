'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AdminHeader } from "@/components/layout/admin-header"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000, // 5 secondi
      refetchOnWindowFocus: false
    }
  }
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="pt-[72px]">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  )
}
