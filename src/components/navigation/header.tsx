import Link from "next/link";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({ title, showBackButton = false, backUrl = "/session" }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-4">
        {showBackButton ? (
          <Link
            href={backUrl}
            className="w-10 h-10 flex items-center justify-center text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        ) : (
          <div className="w-10" />
        )}
        <h1 className="text-[24px] font-bold text-gray-900">{title}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
