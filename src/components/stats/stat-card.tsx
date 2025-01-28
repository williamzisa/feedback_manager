import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  className?: string
  isLoading?: boolean
}

export function StatCard({ title, value, className, isLoading = false }: StatCardProps) {
  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="mt-2 flex items-baseline">
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
