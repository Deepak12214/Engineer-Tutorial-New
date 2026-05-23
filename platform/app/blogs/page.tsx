'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Clock, Tag, Loader2 } from 'lucide-react'

const TAGS = ['All', 'System Design', 'Kafka', 'Databases', 'Caching', 'Microservices', 'Algorithms', 'Performance']

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('All')

  useEffect(() => {
    const params = activeTag !== 'All' ? `?tag=${encodeURIComponent(activeTag)}` : ''
    setLoading(true)
    fetch(`/api/blogs${params}`)
      .then(r => r.json())
      .then(data => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false))
  }, [activeTag])

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Engineering Blog</h1>
          <p className="text-slate-500 text-lg">Deep dives, patterns, and insights from real-world engineering.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${activeTag === tag
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No blogs published yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <Link key={blog._id} href={`/blogs/${blog.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-slate-900/80 transition-all hover:-translate-y-0.5"
              >
                {blog.featuredImage ? (
                  <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={blog.featuredImage} alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(blog.tags ?? []).slice(0, 2).map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-bold text-slate-900 dark:text-white leading-snug mb-2 text-base group-hover:text-accent transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  {blog.seo?.metaDescription && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{blog.seo.metaDescription}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {blog.readTime} min
                    </span>
                    <span>{blog.authorId?.name ?? 'Author'}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
