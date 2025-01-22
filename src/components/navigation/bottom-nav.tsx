'use client';

import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="container mx-auto max-w-2xl">
        <div className="flex justify-around py-2">
          {/* Home */}
          <button 
            onClick={() => window.location.href = '/'}
            className={`flex flex-col items-center p-2 rounded-lg ${pathname === '/' ? 'text-[#4285F4]' : 'text-gray-600'}`}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </button>

          {/* People */}
          <button 
            onClick={() => window.location.href = '/people'}
            className={`flex flex-col items-center p-2 rounded-lg ${pathname === '/people' ? 'text-[#4285F4]' : 'text-gray-600'}`}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </button>

          {/* Results */}
          <button 
            onClick={() => window.location.href = '/session_results'}
            className={`flex flex-col items-center p-2 rounded-lg ${pathname.startsWith('/session_results') ? 'text-[#4285F4]' : 'text-gray-600'}`}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
} 