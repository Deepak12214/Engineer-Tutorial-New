'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Globe, Search, CheckCircle2, AlertCircle, XCircle, RefreshCw, Save, Edit2 } from 'lucide-react'

const contentSeoItems = [
  { id: '1', title: 'Introduction to System Design', type: 'topic', metaTitle: 'Introduction to System Design | EngineerTutorial', metaDesc: 'Learn the fundamentals of system design...', hasOG: true, score: 'good' },
  { id: '2', title: 'Load Balancing Deep Dive', type: 'topic', metaTitle: 'Load Balancing Explained | EngineerTutorial', metaDesc: 'Understand load balancing strategies used in production...', hasOG: true, score: 'good' },
  { id: '3', title: 'Caching Strategies', type: 'topic', metaTitle: '', metaDesc: '', hasOG: false, score: 'bad' },
  { id: '4', title: 'What is Apache Kafka?', type: 'topic', metaTitle: 'Apache Kafka Introduction | EngineerTutorial', metaDesc: 'Complete guide to Apache Kafka event streaming...', hasOG: false, score: 'warning' },
  { id: '5', title: 'Caching Is Not Just About Speed', type: 'blog', metaTitle: 'Caching Strategy Guide | EngineerTutorial Blog', metaDesc: 'Why smart caching decisions can make or break...', hasOG: true, score: 'good' },
  { id: '6', title: 'Why Netflix Never Crashes', type: 'blog', metaTitle: 'Netflix Resilience Patterns | EngineerTutorial', metaDesc: '', hasOG: true, score: 'warning' },
  { id: '7', title: 'SOLID Principles', type: 'topic', metaTitle: '', metaDesc: '', hasOG: false, score: 'bad' },
  { id: '8', title: 'Design Twitter Case Study', type: 'topic', metaTitle: 'Design Twitter System Design | EngineerTutorial', metaDesc: 'Complete system design walkthrough for Twitter...', hasOG: true, score: 'good' },
]

const scoreConfig: Record<string, { icon: any; color: string; label: string }> = {
  good: { icon: CheckCircle2, color: 'text-green-500', label: 'Good' },
  warning: { icon: AlertCircle, color: 'text-amber-500', label: 'Needs work' },
  bad: { icon: XCircle, color: 'text-red-500', label: 'Missing' },
}

export default function AdminSEOPage() {
  const [globalSEO, setGlobalSEO] = useState({
    titleTemplate: '%s | EngineerTutorial',
    defaultDescription: 'Learn system design, Apache Kafka, LLD, and AWS from expert engineers. In-depth tutorials, AI assistant, and built-in code editor.',
    defaultOGImage: 'https://yourdomain.com/og-default.jpg',
    twitterHandle: '@engineertutorial',
  })
  const [sitemap, setSitemap] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  async function regenerateSitemap() {
    setSitemap(true)
    await new Promise(r => setTimeout(r, 1500))
    setSitemap(false)
  }

  async function save() {
    await new Promise(r => setTimeout(r, 400))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const scores = { good: contentSeoItems.filter(i => i.score === 'good').length, warning: contentSeoItems.filter(i => i.score === 'warning').length, bad: contentSeoItems.filter(i => i.score === 'bad').length }

  return (
    <AdminLayout title="SEO Manager">
      <div className="max-w-5xl space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Well Optimized', value: scores.good, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle2 },
            { label: 'Needs Work', value: scores.warning, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: AlertCircle },
            { label: 'Missing SEO', value: scores.bad, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Global SEO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Global SEO Settings</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">Title Template</label>
              <input value={globalSEO.titleTemplate} onChange={e => setGlobalSEO(g => ({ ...g, titleTemplate: e.target.value }))}
                className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
              <p className="text-[10px] text-slate-400 mt-1">Use %s for the page title</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">Twitter Handle</label>
              <input value={globalSEO.twitterHandle} onChange={e => setGlobalSEO(g => ({ ...g, twitterHandle: e.target.value }))}
                className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 block mb-1.5">Default Meta Description</label>
              <textarea value={globalSEO.defaultDescription} onChange={e => setGlobalSEO(g => ({ ...g, defaultDescription: e.target.value }))} rows={2}
                className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800 resize-none" />
              <p className={`text-[10px] mt-1 ${globalSEO.defaultDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                {globalSEO.defaultDescription.length}/160 characters
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 block mb-1.5">Default OG Image URL</label>
              <input value={globalSEO.defaultOGImage} onChange={e => setGlobalSEO(g => ({ ...g, defaultOGImage: e.target.value }))}
                className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800 font-mono" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {saved && <span className="text-sm text-green-600 font-medium">✓ Saved!</span>}
            <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Save className="w-4 h-4" /> Save Global SEO
            </button>
            <button onClick={regenerateSitemap} disabled={sitemap}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${sitemap ? 'animate-spin' : ''}`} />
              {sitemap ? 'Regenerating...' : 'Regenerate Sitemap'}
            </button>
          </div>
        </div>

        {/* Per-page SEO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Content SEO</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input placeholder="Search..." className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-44" />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {contentSeoItems.map(item => {
              const { icon: Icon, color, label } = scoreConfig[item.score]
              const isEditing = editId === item.id
              return (
                <div key={item.id} className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-4">
                    <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${item.type === 'topic' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                          {item.type}
                        </span>
                      </div>
                      {!isEditing && (
                        <p className="text-xs text-slate-400 truncate">{item.metaTitle || <span className="text-red-400">No meta title set</span>}</p>
                      )}
                      {isEditing && (
                        <div className="mt-2 space-y-2">
                          <input defaultValue={item.metaTitle} placeholder="Meta title..."
                            className="w-full text-xs py-1.5 px-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
                          <input defaultValue={item.metaDesc} placeholder="Meta description..."
                            className="w-full text-xs py-1.5 px-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
                          <div className="flex gap-2">
                            <button onClick={() => setEditId(null)} className="px-3 py-1 bg-accent text-white text-xs rounded-lg">Save</button>
                            <button onClick={() => setEditId(null)} className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs rounded-lg">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium ${color}`}>{label}</span>
                      {!item.hasOG && <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">No OG Image</span>}
                      <button onClick={() => setEditId(isEditing ? null : item.id)}
                        className="p-1.5 text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
