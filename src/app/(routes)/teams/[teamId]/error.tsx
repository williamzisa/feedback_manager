"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Team page error:", error);
  }, [error]);

  return (
    <main className="container mx-auto p-4 space-y-6">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Si è verificato un errore</CardTitle>
          <CardDescription>
            Non è stato possibile caricare i dettagli del team. Per favore
            riprova più tardi.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={reset}>Riprova</Button>
        </CardContent>
      </Card>
    </main>
  );
}
