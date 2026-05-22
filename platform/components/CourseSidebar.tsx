'use client'

import Link from 'next/link'
import { CheckCircle2, Lock, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { courses } from '@/lib/mockData'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

interface Props {
  courseId: string
  currentTopicId: string
}

export default function CourseSidebar({ courseId, currentTopicId }: Props) {
  const { isPremium } = useAuth()
  const course = courses.find(c => c.id === courseId)
  const [openSections, setOpenSections] = useState<string[]>(course?.sections.map(s => s.id) || [])

  if (!course) return null

  const completedTopics = new Set(['intro', 'scalability'])

  const totalTopics = course.sections.reduce((acc, s) => acc + s.topics.length, 0)
  const completed = completedTopics.size
  const pct = Math.round((completed / totalTopics) * 100)

  function toggleSection(id: string) {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  return (
    <aside className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-y-auto">
      {/* Course header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/learn" className="text-xs text-accent font-medium hover:underline block mb-2">← All Courses</Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{course.icon}</span>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{course.title}</h2>
        </div>
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{completed}/{totalTopics} topics</span>
            <span className="font-medium text-accent">{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Topic list */}
      <nav className="flex-1 p-2">
        {course.sections.map(section => {
          const isOpen = openSections.includes(section.id)
          return (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <span>{section.title}</span>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isOpen && (
                <div className="space-y-0.5">
                  {section.topics.map(topic => {
                    const isActive = topic.id === currentTopicId
                    const isDone = completedTopics.has(topic.id)
                    const isLocked = topic.isPremium && !isPremium

                    return (
                      <Link
                        key={topic.id}
                        href={isLocked ? '/pricing' : `/learn/${courseId}/${section.id}/${topic.id}`}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                          ${isActive
                            ? 'bg-accent/10 text-accent font-semibold border-l-2 border-accent ml-0'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }
                          ${isLocked ? 'opacity-60' : ''}
                        `}
                      >
                        <span className="flex-shrink-0">
                          {isDone
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : isLocked
                            ? <Lock className="w-4 h-4 text-slate-400" />
                            : <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isActive ? 'border-accent' : 'border-slate-300 dark:border-slate-600'}`} />
                          }
                        </span>
                        <span className="leading-snug flex-1 text-xs">{topic.title}</span>
                        {topic.isPremium && !isPremium && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-medium flex-shrink-0">PRO</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{course.totalTopics} topics · {course.estimatedHours}h</span>
        </div>
      </div>
    </aside>
  )
}
