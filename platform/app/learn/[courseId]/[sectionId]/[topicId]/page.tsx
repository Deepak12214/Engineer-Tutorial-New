'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import CourseSidebar from '@/components/CourseSidebar'
import AIChatWindow from '@/components/AIChatWindow'
import ContentRenderer from '@/components/ContentRenderer'
import { useSession } from 'next-auth/react'
import { CheckCircle2, ChevronRight, Clock, Lock, Share2, Bookmark, MessageCircle, Zap, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TopicPage({ params }: { params: { courseId: string; sectionId: string; topicId: string } }) {
  const { data: session } = useSession()
  const [topic, setTopic] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [aiCode, setAiCode] = useState<string | undefined>()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [topicRes, courseRes] = await Promise.all([
          fetch(`/api/topics/${params.topicId}`),
          fetch(`/api/courses/${params.courseId}`),
        ])
        if (topicRes.ok) setTopic(await topicRes.json())
        if (courseRes.ok) setCourse(await courseRes.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [params.topicId, params.courseId])

  useEffect(() => {
    if (!session?.user || !topic?._id || !course?._id) return
    fetch(`/api/progress?courseId=${course._id}`)
      .then(r => r.json())
      .then(data => {
        if (data.completedTopics?.includes(topic._id)) setIsCompleted(true)
      })
      .catch(() => {})
  }, [session, topic?._id, course?._id])

  useEffect(() => {
    if (!session?.user || !topic?._id) return
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(data => {
        const bookmarks: any[] = data.bookmarks ?? []
        setIsBookmarked(bookmarks.some((b: any) => b.refId === topic._id))
      })
      .catch(() => {})
  }, [session, topic?._id])

  async function markComplete() {
    if (!session?.user) return toast.error('Sign in to track progress')
    if (isCompleted) return
    setCompleting(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course._id, topicId: topic._id }),
      })
      if (res.ok) {
        setIsCompleted(true)
        toast.success('Topic completed!')
      }
    } catch {}
    setCompleting(false)
  }

  async function toggleBookmark() {
    if (!session?.user) return toast.error('Sign in to bookmark')
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'topic', refId: topic._id }),
    })
    if (res.ok) {
      const data = await res.json()
      setIsBookmarked(data.action === 'added')
      toast.success(data.action === 'added' ? 'Bookmarked!' : 'Bookmark removed')
    }
  }

  // Find prev/next topics across all sections
  const allTopics = course?.sections?.flatMap((s: any) => s.topics) ?? []
  const currentIdx = allTopics.findIndex((t: any) => t.slug === params.topicId || t._id === params.topicId)
  const prevTopic = allTopics[currentIdx - 1]
  const nextTopic = allTopics[currentIdx + 1]

  const prevSection = prevTopic ? course?.sections?.find((s: any) => s.topics.some((t: any) => t._id === prevTopic._id || t.slug === prevTopic.slug)) : null
  const nextSection = nextTopic ? course?.sections?.find((s: any) => s.topics.some((t: any) => t._id === nextTopic._id || t.slug === nextTopic.slug)) : null

  // Extract headings for TOC
  const headings = topic?.blocks?.filter((b: any) => ['heading', 'smallHeading', 'mediumHeading'].includes(b.type)) ?? []

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-88px)]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-88px)]">
          <div className="text-center">
            <p className="text-slate-500 mb-4">Topic not found</p>
            <Link href="/learn" className="text-accent hover:underline">← Back to courses</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="flex h-[calc(100vh-88px)] overflow-hidden">
        <CourseSidebar courseId={params.courseId} currentTopicId={params.topicId} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-6 flex-wrap">
              <Link href="/learn" className="hover:text-accent">Learn</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/learn/${params.courseId}`} className="hover:text-accent capitalize">
                {course?.title ?? params.courseId.replace(/-/g, ' ')}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 dark:text-slate-400">{topic.title}</span>
            </div>

            {/* Topic meta */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                {topic.estimatedReadTime && (
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {topic.estimatedReadTime} min read</span>
                )}
                {topic.isPremium && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                    <Zap className="w-3 h-3" /> Pro Content
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={toggleBookmark}
                  className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? 'text-accent bg-accent/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Bookmark className="w-4 h-4" />
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <article className="prose-content">
              <ContentRenderer
                blocks={topic.blocks ?? []}
                onAskAI={(code) => setAiCode(code)}
              />
            </article>

            {/* Premium gate */}
            {topic.isGated && (
              <div className="mt-2 mb-8">
                <div className="text-center py-12 px-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">This content is for Pro members</h3>
                  <p className="text-slate-500 text-sm mb-5">Upgrade to Pro to unlock all topics, case studies, and advanced patterns.</p>
                  <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 text-sm">
                    <Zap className="w-4 h-4" /> Unlock Pro
                  </Link>
                  <p className="text-xs text-slate-400 mt-3">From ₹299/month · Cancel anytime</p>
                </div>
              </div>
            )}

            {/* Mark complete */}
            {!topic.isGated && (
              <button onClick={markComplete} disabled={isCompleted || completing}
                className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl font-medium text-sm mt-8 transition-colors
                  ${isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 hover:border-green-200'
                  }`}>
                {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isCompleted ? 'Completed!' : 'Mark as Complete'}
              </button>
            )}

            {/* Prev / Next */}
            <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
              {prevTopic ? (
                <Link href={`/learn/${params.courseId}/${prevSection?._id ?? params.sectionId}/${prevTopic.slug}`}
                  className="flex flex-col gap-1 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent hover:shadow-sm transition-all group">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Previous</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-accent">{prevTopic.title}</span>
                </Link>
              ) : <div />}

              {nextTopic && (
                <Link href={`/learn/${params.courseId}/${nextSection?._id ?? params.sectionId}/${nextTopic.slug}`}
                  className="flex flex-col gap-1 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent hover:shadow-sm transition-all group text-right">
                  <span className="text-xs text-slate-400 flex items-center justify-end gap-1">Next <ArrowRight className="w-3 h-3" /></span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-accent">{nextTopic.title}</span>
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* Right TOC */}
        <aside className="hidden xl:block w-56 flex-shrink-0 p-6 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">On this page</p>
          <nav className="space-y-1 text-xs">
            {headings.map((h: any, i: number) => (
              <a key={i} href={`#heading-${i}`}
                className={`block py-1 text-slate-500 hover:text-accent hover:pl-1 transition-all ${
                  h.type === 'heading' ? 'font-medium' : h.type === 'smallHeading' ? 'pl-2' : 'pl-4'
                }`}>
                {h.content}
              </a>
            ))}
          </nav>
          {headings.length > 0 && <hr className="my-4 border-slate-200 dark:border-slate-700" />}
          <button onClick={() => setAiCode(undefined)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20">
            <MessageCircle className="w-3.5 h-3.5" /> Ask AI
          </button>
        </aside>
      </div>

      <AIChatWindow contextTopic={topic.title} prefillCode={aiCode} />
    </div>
  )
}
