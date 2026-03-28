import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import StoreProvider from './StoreProvider';
import { AuthProvider } from "../features/auth/hooks/useAuth";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | CivicFix',
    default: 'CivicFix - Community Issue Reporting',
  },
  description: 'Report, track, and resolve community issues in your neighborhood.',
}

export default function RootLayout({children,}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
              expand
            />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
