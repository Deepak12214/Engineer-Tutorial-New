import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'EngineerTutorial — Learn System Design, Kafka & More',
  description: 'Master system design, Apache Kafka, LLD, AWS and more with in-depth tutorials, a built-in code editor, and an AI assistant.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const t = localStorage.getItem('et_theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        <SessionProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} />
        </SessionProvider>
      </body>
    </html>
  )
}
