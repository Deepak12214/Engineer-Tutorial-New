'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminContent } from '@/lib/mockData'
import Link from 'next/link'
import { Plus, Search, Filter, Edit2, Trash2, Eye, FileText, BookOpen, Lock, Globe } from 'lucide-react'

export default function AdminContentPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = adminContent.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.course.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || c.type === typeFilter
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  return (
    <AdminLayout title="Content Management">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link href="/admin/content/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Content
        </Link>

        {/* Search */}
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Filters */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="py-2 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="all">All Types</option>
          <option value="topic">Topics</option>
          <option value="blog">Blogs</option>
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <span className="text-sm text-slate-500 ml-auto">{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id}
                  className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.type === 'topic'
                        ? <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        : <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      }
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
                        {item.isPremium && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-medium">
                            <Lock className="w-2.5 h-2.5" /> PRO
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${item.type === 'topic' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-sm">{item.course}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit
                      ${item.status === 'published' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                        item.status === 'draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                        'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {item.status === 'published' ? <Globe className="w-3 h-3" /> : null}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{item.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href="/learn/system-design/fundamentals/intro"
                        className="p-1.5 text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Preview">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href="/admin/content/new"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
