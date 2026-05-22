'use client'

import AdminLayout from '@/components/AdminLayout'
import { adminStats } from '@/lib/mockData'
import Link from 'next/link'
import { Users, FileText, TrendingUp, IndianRupee, BookOpen, Eye, Plus, ArrowUpRight, ArrowRight } from 'lucide-react'

const statCards = [
  { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), change: `+${adminStats.newSignupsThisMonth} this month`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Pro Subscribers', value: adminStats.premiumUsers.toLocaleString(), change: `+${adminStats.newSubscribersThisMonth} this month`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { label: 'MRR', value: `₹${(adminStats.mrr / 100).toLocaleString()}`, change: '+12% vs last month', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Daily Active Users', value: adminStats.dailyActiveUsers.toLocaleString(), change: 'Today', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Published Topics', value: adminStats.totalTopics.toString(), change: '4 drafts pending', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { label: 'Published Blogs', value: adminStats.totalBlogs.toString(), change: '2 drafts', icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
]

const recentActivity = [
  { action: 'New user signed up', detail: 'ananya.das@gmail.com', time: '2 min ago', type: 'user' },
  { action: 'New Pro subscription', detail: 'rohan.mehta@gmail.com · ₹299/mo', time: '18 min ago', type: 'payment' },
  { action: 'Content published', detail: 'Caching Strategies (System Design)', time: '1 hour ago', type: 'content' },
  { action: 'New user signed up', detail: 'vikram.nair@outlook.com', time: '2 hours ago', type: 'user' },
  { action: 'New Pro subscription', detail: 'kavita.joshi@gmail.com · Annual plan', time: '3 hours ago', type: 'payment' },
  { action: 'Content published', detail: 'Kafka Streams (Apache Kafka)', time: '5 hours ago', type: 'content' },
]

const typeColor: Record<string, string> = {
  user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  payment: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  content: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      {/* Quick actions */}
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Revenue Overview</h3>
            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">Last 7 months</span>
          </div>
          {/* Fake bar chart */}
          <div className="flex items-end gap-3 h-40 mt-2">
            {[
              { month: 'Nov', val: 55, revenue: '55K' },
              { month: 'Dec', val: 62, revenue: '62K' },
              { month: 'Jan', val: 70, revenue: '70K' },
              { month: 'Feb', val: 75, revenue: '75K' },
              { month: 'Mar', val: 83, revenue: '83K' },
              { month: 'Apr', val: 88, revenue: '88K' },
              { month: 'May', val: 95, revenue: '95K' },
            ].map(({ month, val, revenue }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">₹{revenue}</span>
                <div className="w-full rounded-t-md bg-accent/80 hover:bg-accent transition-colors cursor-pointer" style={{ height: `${val}%` }} />
                <span className="text-[10px] text-slate-400">{month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent" /> Monthly Revenue (INR)</span>
            <span className="text-green-600 dark:text-green-400 font-medium">↑ 8% MoM growth</span>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Activity</h3>
            <Link href="/admin/users" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5 ${typeColor[a.type]}`}>
                  {a.type}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.action}</p>
                  <p className="text-[10px] text-slate-400 truncate">{a.detail}</p>
                  <p className="text-[10px] text-slate-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
