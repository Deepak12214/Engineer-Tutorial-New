'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth'
import { courses } from '@/lib/mockData'
import { BookOpen, Zap, Flame, CheckCircle2, ArrowRight, Lock, Clock, Star } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoaded, isPremium } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) router.push('/login')
  }, [user, isLoaded, router])

  if (!isLoaded) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return null

  const inProgress = [
    { ...courses[0], completed: 2, total: courses[0].sections.reduce((a, s) => a + s.topics.length, 0) },
    { ...courses[1], completed: 3, total: courses[1].sections.reduce((a, s) => a + s.topics.length, 0) },
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Keep learning — you're doing great!</p>
          </div>
          {!isPremium && (
            <Link href="/pricing" className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow shadow-blue-500/20">
              <Zap className="w-4 h-4" /> Upgrade to Pro
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Topics Completed', value: '5', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: Flame, label: 'Day Streak', value: '3', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { icon: CheckCircle2, label: 'Courses Started', value: '2', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
            { icon: Star, label: 'Bookmarks', value: '8', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* In Progress */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Continue Learning</h2>
            <div className="space-y-4">
              {inProgress.map(course => {
                const pct = Math.round((course.completed / course.total) * 100)
                const section = course.sections[0]
                const nextTopic = section.topics.find(t => !['intro', 'scalability'].includes(t.id)) || section.topics[0]
                return (
                  <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{course.icon}</span>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{course.title}</h3>
                          <p className="text-xs text-slate-500">{course.completed} / {course.total} topics</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-accent">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <Link href={`/learn/${course.id}/${section.id}/${nextTopic.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                      {nextTopic.isPremium && !isPremium ? <Lock className="w-3.5 h-3.5" /> : null}
                      Continue: {nextTopic.title} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Explore more */}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 mt-8">Explore More Courses</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {courses.slice(2).map(course => (
                <Link key={course.id} href={`/learn/${course.id}/${course.sections[0].id}/${course.sections[0].topics[0].id}`}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-accent hover:shadow-sm transition-all group">
                  <span className="text-3xl">{course.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-accent">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.totalTopics} topics · {course.estimatedHours}h</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-accent flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* User card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-xl font-bold">
                  {user.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Plan</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${isPremium ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {isPremium ? '⚡ Pro' : 'Free'}
                </span>
              </div>
              {!isPremium && (
                <Link href="/pricing" className="block w-full text-center mt-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Upgrade to Pro
                </Link>
              )}
            </div>

            {/* Recent blogs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Recent Blogs</h3>
              <div className="space-y-3">
                {[
                  { title: 'Caching Is Not Just About Speed', time: '8 min', slug: 'caching-strategy' },
                  { title: 'Why Netflix Never Crashes', time: '12 min', slug: 'why-netflix-never-crashes' },
                ].map(b => (
                  <Link key={b.slug} href={`/blogs/${b.slug}`}
                    className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-accent leading-snug">{b.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {b.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
