'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import CourseSidebar from '@/components/CourseSidebar'
import AIChatWindow from '@/components/AIChatWindow'
import { topicContent, courses } from '@/lib/mockData'
import { useAuth } from '@/lib/auth'
import { CheckCircle2, ChevronRight, Clock, Lock, Share2, Bookmark, Copy, Play, MessageCircle, Zap, ArrowLeft, ArrowRight } from 'lucide-react'

function ContentBlock({ block }: { block: any }) {
  const [copied, setCopied] = useState(false)

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  switch (block.type) {
    case 'heading':
      return <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4 mt-2">{block.content}</h1>
    case 'smallHeading':
      return <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-6 pb-2 border-b border-slate-100 dark:border-slate-800">{block.content}</h2>
    case 'mediumHeading':
      return <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 mt-4">{block.content}</h3>
    case 'text':
      return <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{block.content}</p>
    case 'list':
      return <ul className="list-disc pl-5 mb-4 space-y-1.5">{(block.content as string[]).map((item, i) => <li key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</li>)}</ul>
    case 'orderedList':
      return <ol className="list-decimal pl-5 mb-4 space-y-1.5">{(block.content as string[]).map((item, i) => <li key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</li>)}</ol>
    case 'table':
      return (
        <div className="overflow-x-auto mb-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 dark:bg-slate-800">{block.content.headers.map((h: string, i: number) => <th key={i} className="px-4 py-2.5 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">{h}</th>)}</tr></thead>
            <tbody>{block.content.rows.map((row: string[], i: number) => <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'}>{row.map((cell: string, j: number) => <td key={j} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-0">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    case 'code':
      return (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-700">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-400 text-xs">
            <span className="font-mono font-medium text-slate-300">{block.content.language}</span>
            <div className="flex gap-2">
              <button onClick={() => copyCode(block.content.code)}
                className="flex items-center gap-1 hover:text-white transition-colors">
                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <Link href="/playground" className="flex items-center gap-1 hover:text-white transition-colors">
                <Play className="w-3.5 h-3.5" /> Run
              </Link>
            </div>
          </div>
          <pre className="bg-slate-900 p-4 overflow-x-auto text-sm text-green-300 font-mono leading-relaxed whitespace-pre">{block.content.code}</pre>
        </div>
      )
    case 'callout':
      const colorMap: Record<string, string> = {
        tip: 'bg-green-50 dark:bg-green-900/20 border-l-green-500 text-green-800 dark:text-green-300',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500 text-blue-800 dark:text-blue-300',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-l-amber-500 text-amber-800 dark:text-amber-300',
      }
      const emoji: Record<string, string> = { tip: '💡', info: 'ℹ️', warning: '⚠️' }
      return (
        <div className={`border-l-4 px-4 py-3 rounded-r-xl mb-4 ${colorMap[block.content.type] || colorMap.info}`}>
          <p className="text-sm leading-relaxed">{emoji[block.content.type]} {block.content.text}</p>
        </div>
      )
    default:
      return null
  }
}

export default function TopicPage({ params }: { params: { courseId: string; sectionId: string; topicId: string } }) {
  const { isPremium } = useAuth()
  const topic = topicContent[params.topicId as keyof typeof topicContent] || topicContent.intro
  const course = courses.find(c => c.id === params.courseId)
  const section = course?.sections.find(s => s.id === params.sectionId)
  const topicIdx = section?.topics.findIndex(t => t.id === params.topicId) ?? 0
  const prevTopic = section?.topics[topicIdx - 1]
  const nextTopic = section?.topics[topicIdx + 1]

  const isGated = topic.isPremium && !isPremium
  const visibleBlocks = isGated ? topic.blocks.slice(0, 3) : topic.blocks

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="flex h-[calc(100vh-88px)] overflow-hidden">
        {/* Left sidebar */}
        <CourseSidebar courseId={params.courseId} currentTopicId={params.topicId} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-6 flex-wrap">
              <Link href="/learn" className="hover:text-accent">Learn</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/learn/${params.courseId}/${params.sectionId}/${params.topicId}`} className="hover:text-accent capitalize">{params.courseId.replace(/-/g, ' ')}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 dark:text-slate-400 capitalize">{params.sectionId.replace(/-/g, ' ')}</span>
            </div>

            {/* Topic meta */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {topic.estimatedReadTime} min read</span>
                {topic.isPremium && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                    <Zap className="w-3 h-3" /> Pro Content
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <article className="prose-content">
              {visibleBlocks.map((block, i) => <ContentBlock key={i} block={block} />)}
            </article>

            {/* Premium gate */}
            {isGated && (
              <div className="relative mt-2 mb-8">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-slate-950 pointer-events-none" />
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

            {/* Completed button */}
            {!isGated && (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl font-medium text-sm hover:bg-green-100 dark:hover:bg-green-900/30 mt-8">
                <CheckCircle2 className="w-4 h-4" /> Mark as Complete
              </button>
            )}

            {/* Prev / Next */}
            <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
              {prevTopic ? (
                <Link href={`/learn/${params.courseId}/${params.sectionId}/${prevTopic.id}`}
                  className="flex flex-col gap-1 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent hover:shadow-sm transition-all group">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Previous</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-accent">{prevTopic.title}</span>
                </Link>
              ) : <div />}

              {nextTopic && (
                <Link href={`/learn/${params.courseId}/${params.sectionId}/${nextTopic.id}`}
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
            {['Why System Design Matters', 'Key Concepts to Master', 'The System Design Interview', 'Sample Code: Basic Rate Limiter'].map(h => (
              <a key={h} href="#" className="block py-1 text-slate-500 hover:text-accent hover:pl-1 transition-all">{h}</a>
            ))}
          </nav>
          <hr className="my-4 border-slate-200 dark:border-slate-700" />
          <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20">
            <MessageCircle className="w-3.5 h-3.5" /> Ask AI
          </button>
        </aside>
      </div>

      <AIChatWindow contextTopic={topic.heading} />
    </div>
  )
}
