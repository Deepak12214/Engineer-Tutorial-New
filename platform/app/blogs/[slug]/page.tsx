'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AIChatWindow from '@/components/AIChatWindow'
import ContentRenderer from '@/components/ContentRenderer'
import { useSession } from 'next-auth/react'
import { Clock, ArrowLeft, Share2, Bookmark, Twitter, Linkedin, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession()
  const [blog, setBlog] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    fetch(`/api/blogs/${params.slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setBlog(data) })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch('/api/blogs?limit=3')
      .then(r => r.json())
      .then(data => setRelated(Array.isArray(data) ? data.filter((b: any) => b.slug !== params.slug).slice(0, 2) : []))
      .catch(() => {})
  }, [params.slug])

  useEffect(() => {
    if (!session?.user || !blog?._id) return
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(data => {
        const bookmarks: any[] = data.bookmarks ?? []
        setIsBookmarked(bookmarks.some((b: any) => b.refId === blog._id && b.type === 'blog'))
      })
      .catch(() => {})
  }, [session, blog?._id])

  async function toggleBookmark() {
    if (!session?.user) return toast.error('Sign in to bookmark')
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'blog', refId: blog._id }),
    })
    if (res.ok) {
      const data = await res.json()
      setIsBookmarked(data.action === 'added')
      toast.success(data.action === 'added' ? 'Bookmarked!' : 'Bookmark removed')
    }
  }

  function shareUrl(platform: 'twitter' | 'linkedin') {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(blog?.title ?? '')
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`)
    else window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-500 mb-4">Blog post not found</p>
            <Link href="/blogs" className="text-accent hover:underline">← Back to Blogs</Link>
          </div>
        </div>
      </div>
    )
  }

  const authorName = blog.authorId?.name ?? 'Author'
  const publishedDate = new Date(blog.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/blogs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {(blog.tags ?? []).map((tag: string) => (
            <span key={tag} className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">{tag}</span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          {blog.title}
        </h1>
        {blog.seo?.metaDescription && (
          <p className="text-xl text-slate-500 mb-6 leading-relaxed">{blog.seo.metaDescription}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              {authorName[0]?.toUpperCase()}
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{authorName}</span>
          </div>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {blog.readTime} min read</span>
          <span>{publishedDate}</span>

          <div className="flex gap-2 ml-auto">
            <button onClick={toggleBookmark}
              className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs transition-colors
                ${isBookmarked ? 'border-accent text-accent bg-accent/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Bookmark className="w-3.5 h-3.5" /> {isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {blog.featuredImage && (
          <div className="rounded-2xl overflow-hidden mb-10 aspect-video bg-slate-100 dark:bg-slate-800">
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="prose-content max-w-none">
          <ContentRenderer blocks={blog.blocks ?? []} />
        </article>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Share this article</p>
          <div className="flex gap-3">
            <button onClick={() => shareUrl('twitter')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-lg text-sm font-medium hover:opacity-90">
              <Twitter className="w-4 h-4" /> Share on X
            </button>
            <button onClick={() => shareUrl('linkedin')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-lg text-sm font-medium hover:opacity-90">
              <Linkedin className="w-4 h-4" /> Share on LinkedIn
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Related Articles</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map(b => (
                <Link key={b._id} href={`/blogs/${b.slug}`}
                  className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-accent hover:shadow-sm transition-all">
                  {b.featuredImage ? (
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={b.featuredImage} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📝</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-accent">{b.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{b.readTime} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <AIChatWindow contextTopic={blog.title} />
    </div>
  )
}
