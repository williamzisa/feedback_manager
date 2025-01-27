"use client";

import { UsersView } from "@/app/@admin/users/components/users-view";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Si è verificato un errore</h2>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <UsersView />
    </ErrorBoundary>
  );
}
