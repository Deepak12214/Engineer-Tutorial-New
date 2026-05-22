'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { BookOpen, Code2, FileText, Menu, Moon, Sun, X, ChevronDown, LayoutDashboard, LogOut, Settings, User, Zap } from 'lucide-react'

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('et_theme', 'light')
      setDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('et_theme', 'dark')
      setDark(true)
    }
  }

  const courses = [
    { href: '/learn/system-design/fundamentals/intro', label: 'System Design', icon: '🏗️', desc: 'Scalability & Architecture' },
    { href: '/learn/kafka/basics/intro', label: 'Apache Kafka', icon: '⚡', desc: 'Event Streaming' },
    { href: '/learn/lld/oop/solid', label: 'Low Level Design', icon: '🔧', desc: 'OOP & Patterns' },
    { href: '/learn/aws/fundamentals/intro', label: 'AWS', icon: '☁️', desc: 'Cloud Engineering' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      {/* Announcement bar */}
      <div className="bg-accent text-white text-center text-xs py-1.5 px-4 font-medium">
        🚀 New Course: <Link href="/learn/aws/fundamentals/intro" className="underline font-semibold">AWS for Engineers</Link> is now live! &nbsp;·&nbsp; Use code <span className="font-mono bg-white/20 px-1 rounded">LAUNCH50</span> for 50% off Pro
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span>Engineer<span className="text-accent">Tutorial</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <div className="relative">
            <button
              onMouseEnter={() => setLearnOpen(true)}
              onMouseLeave={() => setLearnOpen(false)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Learn <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {learnOpen && (
              <div
                onMouseEnter={() => setLearnOpen(true)}
                onMouseLeave={() => setLearnOpen(false)}
                className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50"
              >
                {courses.map(c => (
                  <Link key={c.href} href={c.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setLearnOpen(false)}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{c.label}</div>
                      <div className="text-xs text-slate-500">{c.desc}</div>
                    </div>
                  </Link>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <Link href="/learn" className="flex items-center gap-2 p-3 text-sm text-accent font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setLearnOpen(false)}
                  >
                    <BookOpen className="w-4 h-4" /> View all courses →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/blogs" className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
            Blogs
          </Link>
          <Link href="/playground" className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
            Playground
          </Link>
          <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-accent rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
            Pricing
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${user.subscriptionStatus === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {user.subscriptionStatus === 'pro' ? '⚡ Pro' : 'Free'}
                    </span>
                  </div>
                  <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Settings className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  {user.subscriptionStatus !== 'pro' && (
                    <Link href="/pricing" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium">
                      <Zap className="w-4 h-4" /> Upgrade to Pro
                    </Link>
                  )}
                  <button onClick={() => { setProfileOpen(false); logout() }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-accent">
                Login
              </Link>
              <Link href="/register" className="px-4 py-1.5 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-400">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2">
          {courses.map(c => (
            <Link key={c.href} href={c.href} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
              <span>{c.icon}</span>
              <span className="text-sm font-medium">{c.label}</span>
            </Link>
          ))}
          <hr className="border-slate-200 dark:border-slate-800" />
          <Link href="/blogs" onClick={() => setMenuOpen(false)} className="block p-2 text-sm font-medium">Blogs</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block p-2 text-sm font-medium">Pricing</Link>
          <Link href="/playground" onClick={() => setMenuOpen(false)} className="block p-2 text-sm font-medium">Playground</Link>
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-accent text-white rounded-lg text-sm font-semibold">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
