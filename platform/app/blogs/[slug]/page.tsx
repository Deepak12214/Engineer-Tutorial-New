import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AIChatWindow from '@/components/AIChatWindow'
import { blogs } from '@/lib/mockData'
import { Clock, Star, ArrowLeft, Share2, Bookmark, Twitter, Linkedin } from 'lucide-react'

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = blogs.find(b => b.slug === params.slug) || blogs[0]

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <Link href="/blogs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">{tag}</span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          {blog.title}
        </h1>
        <p className="text-xl text-slate-500 mb-6 leading-relaxed">{blog.subtitle}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              {blog.author[0]}
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{blog.author}</span>
          </div>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {blog.readTime} min read</span>
          <span>{blog.publishedAt}</span>
          <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {blog.rating}</span>

          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
              <Bookmark className="w-3.5 h-3.5" /> Save
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Cover */}
        <div className="rounded-2xl overflow-hidden mb-10 aspect-video bg-slate-100 dark:bg-slate-800">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="prose-content max-w-none">
          <h2>The Problem With "Just Add Redis"</h2>
          <p>
            Caching seems simple: store expensive computations or database queries in memory so you don't have to redo them. But engineers often treat it as a magic performance fix without thinking about the real costs — stale data, cache invalidation complexity, memory pressure, and cold starts.
          </p>
          <p>
            The famous Phil Karlton quote goes: "There are only two hard things in Computer Science: cache invalidation and naming things." It's funny precisely because it's true.
          </p>

          <h2>Understanding Cache Eviction Policies</h2>
          <p>When your cache fills up, you need a policy to decide which entries to remove. The most common strategies are:</p>

          <div className="callout-info">
            <strong>💡 Key insight:</strong> The right eviction policy depends on your access patterns. There's no universal best — LRU works great for temporal locality, LFU works better when some keys are permanently "hot".
          </div>

          <table>
            <thead><tr><th>Policy</th><th>Best For</th><th>Overhead</th></tr></thead>
            <tbody>
              <tr><td><strong>LRU</strong> (Least Recently Used)</td><td>General purpose, temporal locality</td><td>Low</td></tr>
              <tr><td><strong>LFU</strong> (Least Frequently Used)</td><td>Frequency-based hot keys</td><td>Medium</td></tr>
              <tr><td><strong>FIFO</strong></td><td>Queue-like access patterns</td><td>Very low</td></tr>
              <tr><td><strong>TTL-based</strong></td><td>Time-sensitive data</td><td>Low</td></tr>
            </tbody>
          </table>

          <h2>Cache-Aside vs Write-Through vs Write-Behind</h2>
          <p>
            The most widely used pattern is <strong>Cache-Aside</strong> (also called Lazy Loading): your application checks the cache first, and on a miss, loads from the database and populates the cache.
          </p>

          <div className="code-block">
            <pre>{`def get_user(user_id):
    # 1. Check cache
    user = cache.get(f"user:{user_id}")
    if user:
        return user

    # 2. Cache miss — load from database
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)

    # 3. Populate cache with TTL
    cache.set(f"user:{user_id}", user, ttl=3600)
    return user`}</pre>
          </div>

          <h2>Cache Stampede (Thundering Herd)</h2>
          <p>
            One of the most dangerous cache failure modes: when a popular cached item expires, hundreds of concurrent requests all miss the cache simultaneously and all try to rebuild it from the database — causing a spike that can take down your database.
          </p>

          <div className="callout-warning">
            <strong>⚠️ Production war story:</strong> We once had a cache stampede on our most-visited page during a traffic spike. The cached response expired at exactly the moment 3,000 requests/second were hitting the endpoint. The DB went down in 4 seconds.
          </div>

          <p>
            Solutions include: probabilistic early expiration, mutex locking on the cache miss path, or using a background refresh before TTL expires (cache warming).
          </p>
        </div>

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Share this article</p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-lg text-sm font-medium hover:opacity-90">
              <Twitter className="w-4 h-4" /> Share on X
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-lg text-sm font-medium hover:opacity-90">
              <Linkedin className="w-4 h-4" /> Share on LinkedIn
            </button>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {blogs.filter(b => b.slug !== params.slug).slice(0, 2).map(b => (
              <Link key={b.id} href={`/blogs/${b.slug}`}
                className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-accent hover:shadow-sm transition-all">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-accent">{b.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{b.readTime} min · {b.publishedAt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <AIChatWindow contextTopic={blog.title} />
    </div>
  )
}
