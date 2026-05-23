'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import { Users, FileText, TrendingUp, IndianRupee, BookOpen, Eye, Plus, ArrowUpRight, ArrowRight, Loader2 } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, topicsRes, blogsRes] = await Promise.all([
          fetch('/api/admin/users?limit=1'),
          fetch('/api/admin/topics'),
          fetch('/api/admin/blogs'),
        ])
        const usersData = usersRes.ok ? await usersRes.json() : { total: 0 }
        const topics = topicsRes.ok ? await topicsRes.json() : []
        const blogs = blogsRes.ok ? await blogsRes.json() : []

        const publishedTopics = Array.isArray(topics) ? topics.filter((t: any) => t.isPublished).length : 0
        const draftTopics = Array.isArray(topics) ? topics.filter((t: any) => !t.isPublished).length : 0
        const publishedBlogs = Array.isArray(blogs) ? blogs.filter((b: any) => b.isPublished).length : 0
        const draftBlogs = Array.isArray(blogs) ? blogs.filter((b: any) => !b.isPublished).length : 0

        setStats({
          totalUsers: usersData.total ?? 0,
          publishedTopics,
          draftTopics,
          publishedBlogs,
          draftBlogs,
          totalContent: (Array.isArray(topics) ? topics.length : 0) + (Array.isArray(blogs) ? blogs.length : 0),
        })
      } catch {}
      setLoading(false)
    }
    loadStats()
  }, [])

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: 'registered users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Published Topics', value: stats.publishedTopics.toString(), change: `${stats.draftTopics} drafts pending`, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Published Blogs', value: stats.publishedBlogs.toString(), change: `${stats.draftBlogs} drafts`, icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Total Content', value: stats.totalContent.toString(), change: 'topics + blogs', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ] : []

  return (
    <AdminLayout title="Dashboard">
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/admin/content/new" className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Content
        </Link>
        <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-accent hover:text-accent">
          <Users className="w-4 h-4" /> View Users
        </Link>
        <Link href="/admin/content" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-accent hover:text-accent">
          <FileText className="w-4 h-4" /> Manage Content
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, change, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-xs text-slate-400 mt-1">{change}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/admin/content/new', label: 'Create new topic', desc: 'Add learning content' },
              { href: '/admin/content', label: 'Manage all content', desc: 'Edit, publish, delete' },
              { href: '/admin/users', label: 'View all users', desc: 'Grant Pro, manage roles' },
              { href: '/admin/navigation', label: 'Edit navigation', desc: 'Header links & announcement' },
              { href: '/admin/seo', label: 'SEO settings', desc: 'Meta tags & global SEO' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent hover:shadow-sm transition-all group">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-accent">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Getting Started</h3>
          <div className="space-y-3 text-sm">
            {[
              { step: '1', text: 'Add MONGODB_URI to .env.local', done: true },
              { step: '2', text: 'Add GROQ_API_KEY for AI chat', done: true },
              { step: '3', text: 'Add BREVO_API_KEY for emails', done: true },
              { step: '4', text: 'Add Razorpay keys for payments', done: true },
              { step: '5', text: 'Create your first course', done: false },
              { step: '6', text: 'Publish your first topic', done: false },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${item.done ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {item.done ? '✓' : item.step}
                </div>
                <span className={item.done ? 'text-slate-500 line-through text-xs' : 'text-slate-700 dark:text-slate-300 text-xs'}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
