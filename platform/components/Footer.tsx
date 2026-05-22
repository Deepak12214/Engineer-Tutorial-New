import Link from 'next/link'
import { Code2, Github, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              Engineer<span className="text-accent">Tutorial</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Learn system design, Kafka, LLD, and more — built by engineers from Google, Meta, and Amazon.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Learn</h4>
            <ul className="space-y-2.5 text-sm">
              {[['System Design', '/learn/system-design/fundamentals/intro'], ['Apache Kafka', '/learn/kafka/basics/intro'], ['Low Level Design', '/learn/lld/oop/solid'], ['AWS', '/learn/aws/fundamentals/intro']].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Blogs', '/blogs'], ['Playground', '/playground'], ['Pricing', '/pricing'], ['Roadmaps', '/roadmaps']].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[['About', '/about'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 EngineerTutorial. All rights reserved.</p>
          <p>Built with ❤️ for engineers worldwide · 12,000+ learners</p>
        </div>
      </div>
    </footer>
  )
}
