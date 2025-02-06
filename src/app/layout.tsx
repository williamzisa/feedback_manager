import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Feedback Manager',
  description: 'Gestisci i feedback del tuo team',
}

interface RootLayoutProps {
  children: React.ReactNode;
  admin: React.ReactNode;
  params?: Promise<Record<string, unknown>>;
}

export default function RootLayout({
  children,
  admin,
}: RootLayoutProps) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
        {admin}
        <Toaster />
      </body>
    </html>
  );
}
