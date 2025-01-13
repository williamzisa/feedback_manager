interface StatCardProps {
  title: string
  value: number
  className?: string
}

export const StatCard = ({ title, value, className = '' }: StatCardProps) => {
  return (
    <div className={`rounded-lg p-6 ${className}`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}
