'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigationLeft = [
  { name: 'Clusters', href: '/admin/clusters' },
  { name: 'Teams', href: '/admin/teams' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Levels', href: '/admin/levels' },
  { name: 'Processes', href: '/admin/processes' },
]

const navigationRight = [
  { name: 'Questions', href: '/admin/questions' },
  { name: 'Rules', href: '/admin/rules' },
  { name: 'Sessions', href: '/admin/sessions' },
  { name: 'Feedbacks', href: '/admin/feedbacks', subtitle: '(Analisi Sessione)' },
]

export const AdminHeader = () => {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b">
      <nav className="mx-auto flex max-w-full items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-10">
          {navigationLeft.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                pathname === item.href
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
                'text-base font-medium transition-colors'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-10">
          {navigationRight.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                pathname === item.href
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
                'text-base font-medium transition-colors'
              )}
            >
              {item.name}
              {item.subtitle && (
                <span className="ml-1 text-gray-400">{item.subtitle}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
