import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Feedback Manager',
  description: 'Gestione feedback per team e organizzazioni',
}

export default function RootLayout({
  children,
  admin,
}: LayoutProps): React.ReactElement {
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

// Definiamo esplicitamente l'interfaccia LayoutProps
export interface LayoutProps {
  children: React.ReactNode;
  admin?: React.ReactNode;
}
