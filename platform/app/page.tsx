import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ArrowRight, CheckCircle2, Code2, Star, Zap, BookOpen, Users, Trophy, ChevronDown } from 'lucide-react'

const courses = [
  { icon: '🏗️', title: 'System Design', desc: 'Scalability, load balancing, caching, databases, and real-world case studies.', topics: 24, href: '/learn/system-design/fundamentals/intro', badge: 'Most Popular' },
  { icon: '⚡', title: 'Apache Kafka', desc: 'Event streaming, topics, partitions, producers, consumers, and Kafka Streams.', topics: 18, href: '/learn/kafka/basics/intro', badge: null },
  { icon: '🔧', title: 'Low Level Design', desc: 'SOLID principles, design patterns, and object-oriented system design.', topics: 20, href: '/learn/lld/oop/solid', badge: null },
  { icon: '☁️', title: 'AWS', desc: 'Core AWS services, architecture best practices, and hands-on cloud patterns.', topics: 22, href: '/learn/aws/fundamentals/intro', badge: 'New' },
]

const testimonials = [
  { name: 'Rohan Mehta', role: 'SDE-2 at Amazon', img: '🧑‍💻', text: 'The System Design course is the best resource I\'ve found. I cleared my Amazon interview with L5 offer after going through it.', rating: 5 },
  { name: 'Sneha Gupta', role: 'Senior Engineer at Flipkart', img: '👩‍💻', text: 'The Kafka course is incredibly detailed. Went from zero to implementing real-time pipelines at work within 2 weeks.', rating: 5 },
  { name: 'Vikram Nair', role: 'Staff Engineer at Swiggy', img: '🧑‍🔬', text: 'The AI assistant is a game-changer. Being able to ask questions while reading without switching tabs is so productive.', rating: 5 },
]

const faqs = [
  { q: 'Is there a free tier?', a: 'Yes! A large portion of our content is completely free. Premium topics are clearly marked with a PRO badge. You can explore all our courses for free before deciding to upgrade.' },
  { q: 'What\'s included in Pro?', a: 'Pro gives you full access to all topics including premium case studies, advanced patterns, and AI-assisted learning with unlimited messages.' },
  { q: 'Can I use the code editor without an account?', a: 'Yes, the Playground code editor is available to everyone. You can run code in 8 languages without creating an account.' },
  { q: 'Do you cover behavioral interviews?', a: 'Our main focus is technical content (system design, LLD, Kafka, AWS). Behavioral interview prep is on our roadmap.' },
]

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>Now with AI Assistant — Ask anything while you learn</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            Master System Design,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Kafka & More
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            In-depth tutorials, a built-in code editor, and an AI assistant — everything you need to ace technical interviews and build world-class systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/learn" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 text-base">
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:border-accent hover:text-accent text-base">
              View Pricing
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {[['12,000+', 'Learners'], ['87', 'Topics'], ['4', 'Courses'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{val}</div>
                <div className="text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Everything You Need to Excel</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Structured courses taught by engineers from top companies, with real code and real-world examples.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map(c => (
            <Link key={c.title} href={c.href}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-accent hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              {c.badge && (
                <span className={`absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-semibold ${c.badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {c.badge}
                </span>
              )}
              <div className="text-4xl mb-4">{c.icon}</div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-accent">{c.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{c.desc}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {c.topics} topics</span>
                <span className="text-accent font-medium flex items-center gap-1">Start →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Learn Smarter with AI</h2>
              <div className="space-y-5">
                {[
                  ['Ask While You Learn', 'A floating AI assistant is always one click away. Ask for explanations, examples, or interview tips without leaving the page.'],
                  ['Context-Aware Answers', 'The AI knows which topic you\'re reading and gives answers tailored to that context.'],
                  ['Free for Everyone', 'The AI assistant is completely free — no message limits, no paywalls.'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/learn" className="inline-flex items-center gap-2 mt-8 px-6 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-blue-700">
                Try it now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">AI Assistant</p>
                  <p className="text-[10px] text-slate-400">Load Balancing — System Design</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-end">
                  <span className="bg-accent text-white px-3 py-2 rounded-xl rounded-br-sm max-w-[80%] text-xs">What's the difference between L4 and L7 load balancers?</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-accent" />
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl rounded-bl-sm text-slate-800 dark:text-slate-200 text-xs max-w-[85%]">
                    L4 load balancers operate at the transport layer (TCP/UDP) — they route traffic based on IP and port without inspecting packet content. L7 operates at the application layer (HTTP) and can make routing decisions based on URL, headers, or cookies. Use L7 when you need content-based routing (e.g., route /api to service A, /static to CDN).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Trusted by Engineers at Top Companies</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{t.img}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <details key={faq.q} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-slate-900 dark:text-white text-sm list-none">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join 12,000+ engineers learning system design, Kafka, and more.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 shadow-lg">
            Start for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
