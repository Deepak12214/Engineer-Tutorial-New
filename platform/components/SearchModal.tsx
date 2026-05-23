'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, FileText, ArrowRight, Loader2, X, Lock } from 'lucide-react'

interface SearchResults {
  courses: any[]
  topics: any[]
  blogs: any[]
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults(null); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
      } catch { setResults(null) }
      finally { setLoading(false) }
    }, 300)
  }, [query])

  const allResults = results ? [
    ...results.courses.map(c => ({ type: 'course', ...c })),
    ...results.topics.map(t => ({ type: 'topic', ...t })),
    ...results.blogs.map(b => ({ type: 'blog', ...b })),
  ] : []

  function navigate(result: any) {
    if (result.type === 'course') router.push(`/learn/${result.slug}`)
    else if (result.type === 'blog') router.push(`/blogs/${result.slug}`)
    else if (result.type === 'topic') {
      const courseSlug = result.courseId?.slug ?? result.courseId
      router.push(`/learn/${courseSlug}/${result.slug ?? result._id}`)
    }
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, allResults.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && allResults[selectedIndex]) navigate(allResults[selectedIndex])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search courses, topics, blogs..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white outline-none text-base placeholder-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" />}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Start typing to search across all content</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Courses · Topics · Blogs</p>
            </div>
          )}

          {query.length >= 2 && !loading && results && allResults.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">No results for "<strong>{query}</strong>"</p>
            </div>
          )}

          {allResults.length > 0 && (
            <div className="p-2">
              {results!.courses.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-3 py-1">Courses</p>
                  {results!.courses.map((c, i) => {
                    const idx = i
                    return (
                      <button key={c._id} onClick={() => navigate({ type: 'course', ...c })}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedIndex === idx ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                        <span className="text-2xl">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{c.title}</p>
                          <p className="text-xs text-slate-400 truncate">{c.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {results!.topics.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-3 py-1">Topics</p>
                  {results!.topics.map((t, i) => {
                    const idx = results!.courses.length + i
                    return (
                      <button key={t._id} onClick={() => navigate({ type: 'topic', ...t })}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedIndex === idx ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          {t.isPremium ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <FileText className="w-3.5 h-3.5 text-accent" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                          <p className="text-xs text-slate-400">{t.courseId?.title ?? 'Topic'}{t.isPremium ? ' · Pro' : ''}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {results!.blogs.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-3 py-1">Blogs</p>
                  {results!.blogs.map((b, i) => {
                    const idx = results!.courses.length + results!.topics.length + i
                    return (
                      <button key={b._id} onClick={() => navigate({ type: 'blog', ...b })}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedIndex === idx ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                        <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{b.title}</p>
                          <p className="text-xs text-slate-400">{b.readTime} min read</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-400">
          <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> navigate</span>
          <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> open</span>
          <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
