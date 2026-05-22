'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useEffect } from 'react'
import {
  LayoutDashboard, FileText, Users, Settings, Globe, Navigation,
  Code2, LogOut, ChevronRight, BarChart2, Bell, Search
} from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/content', icon: FileText, label: 'Content' },
  { href: '/admin/navigation', icon: Navigation, label: 'Navigation' },
  { href: '/admin/seo', icon: Globe, label: 'SEO' },
  { href: '/admin/users', icon: Users, label: 'Users' },
]

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname()
  const { user, isLoaded, logout, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push('/login'); return }
    if (!isAdmin) router.push('/')
  }, [user, isLoaded, isAdmin, router])

  if (!isLoaded) return (
    <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user || !isAdmin) return null

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm">EngineerTutorial</span>
          </Link>
          <span className="text-xs text-slate-500 mt-1 block">Admin Panel</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-accent text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input placeholder="Search..." className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-52" />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link href="/" className="text-xs text-accent font-medium hover:underline">← View Site</Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
