'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminUsers } from '@/lib/mockData'
import { Search, Filter, UserCheck, UserX, Download, MoreHorizontal, ChevronDown } from 'lucide-react'

const roleColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  author: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  premium_user: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  free_user: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [users, setUsers] = useState(adminUsers)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  function grantPro(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'pro', role: 'premium_user' } : u))
  }

  function revokeAccess(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'free', role: 'free_user' } : u))
  }

  return (
    <AdminLayout title="User Management">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: '12,847' },
          { label: 'Pro Subscribers', value: '3,241' },
          { label: 'Free Users', value: '9,606' },
          { label: 'New Today', value: '47' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="py-2 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="author">Author</option>
          <option value="premium_user">Premium</option>
          <option value="free_user">Free</option>
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none">
          <option value="all">All Plans</option>
          <option value="pro">Pro</option>
          <option value="free">Free</option>
        </select>

        <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:border-accent hover:text-accent ml-auto">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Last Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColor[user.role]}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {user.status === 'pro' ? '⚡ Pro' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 hidden md:table-cell">{user.joinedAt}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 hidden lg:table-cell">{user.lastLogin}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {user.status !== 'pro' ? (
                        <button onClick={() => grantPro(user.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30">
                          <UserCheck className="w-3.5 h-3.5" /> Grant Pro
                        </button>
                      ) : (
                        <button onClick={() => revokeAccess(user.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                          <UserX className="w-3.5 h-3.5" /> Revoke
                        </button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <span className="text-xs text-slate-500">Showing {filtered.length} of 12,847 users</span>
          <div className="flex gap-1">
            {['1', '2', '3', '...', '128'].map(p => (
              <button key={p} className={`w-7 h-7 text-xs rounded-lg ${p === '1' ? 'bg-accent text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
