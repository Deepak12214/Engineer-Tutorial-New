import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { blogs } from '@/lib/mockData'
import { Star, Clock, Tag } from 'lucide-react'

const tags = ['All', 'System Design', 'Kafka', 'Databases', 'Caching', 'Microservices', 'Algorithms', 'Performance']

export default function BlogsPage() {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Engineering Blog</h1>
          <p className="text-slate-500 text-lg">Deep dives, patterns, and insights from real-world engineering.</p>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {tags.map(tag => (
            <button key={tag}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${tag === 'All'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Blog grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-slate-900/80 transition-all hover:-translate-y-0.5"
            >
              {/* Cover */}
              <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={blog.coverImage} alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>

              <div className="p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {blog.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="font-bold text-slate-900 dark:text-white leading-snug mb-2 text-base group-hover:text-accent transition-colors line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{blog.subtitle}</p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {blog.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {blog.readTime} min
                    </span>
                  </div>
                  <span>{blog.publishedAt}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
