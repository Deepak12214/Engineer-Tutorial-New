import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { courses } from '@/lib/mockData'
import { BookOpen, Clock, ChevronRight, Lock } from 'lucide-react'

export default function LearnPage() {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">All Courses</h1>
          <p className="text-slate-500 text-lg">Choose a course and start learning at your own pace.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{course.icon}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>{course.difficulty}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{course.description}</p>
                <div className="flex gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.totalTopics} topics</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.estimatedHours}h</span>
                </div>
              </div>

              {/* Sections preview */}
              <div className="p-4">
                {course.sections.slice(0, 2).map(section => (
                  <div key={section.id} className="mb-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{section.title}</p>
                    <div className="space-y-1">
                      {section.topics.slice(0, 3).map(topic => (
                        <Link key={topic.id}
                          href={`/learn/${course.id}/${section.id}/${topic.id}`}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group"
                        >
                          <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-accent">{topic.title}</span>
                          <div className="flex items-center gap-1">
                            {topic.isPremium && <Lock className="w-3 h-3 text-amber-500" />}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <Link href={`/learn/${course.id}/${course.sections[0].id}/${course.sections[0].topics[0].id}`}
                  className="block w-full text-center py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 text-sm">
                  Start Course →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
