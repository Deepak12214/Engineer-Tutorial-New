'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RazorpayButton from '@/components/RazorpayButton'
import { useSession } from 'next-auth/react'
import { CheckCircle2, X, Zap } from 'lucide-react'

const features = [
  { label: 'Free topics & all blogs', free: true, pro: true },
  { label: 'AI assistant (unlimited)', free: true, pro: true },
  { label: 'Built-in code editor', free: true, pro: true },
  { label: 'Premium topics', free: false, pro: true },
  { label: 'Advanced case studies (Twitter, Uber, YouTube)', free: false, pro: true },
  { label: 'System Design patterns', free: false, pro: true },
  { label: 'LLD deep-dives & solutions', free: false, pro: true },
  { label: 'Progress tracking', free: true, pro: true },
  { label: 'Bookmarks & notes', free: true, pro: true },
  { label: 'Certificate on completion', free: false, pro: true },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const isPro = (session?.user as any)?.subscriptionStatus === 'pro'

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Start free. Go Pro when you're ready.</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">A large portion of our content is free forever. Upgrade to Pro for premium case studies, advanced patterns, and certificates.</p>
        </div>

        {isPro && (
          <div className="text-center mb-10 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-blue-700 dark:text-blue-300 font-semibold">⚡ You are already a Pro member! Enjoy unlimited access.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Free</h2>
              <p className="text-sm text-slate-500">Everything you need to get started.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹0</span>
              <span className="text-slate-500 text-sm ml-2">forever</span>
            </div>
            <Link href="/register" className="block w-full text-center py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:border-accent hover:text-accent text-sm mb-8">
              Get Started Free
            </Link>
            <ul className="space-y-3">
              {features.map(f => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  {f.free
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <X className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                  <span className={f.free ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-b from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl shadow-blue-500/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow">MOST POPULAR</span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">Pro <Zap className="w-4 h-4 text-amber-300" /></h2>
              <p className="text-blue-200 text-sm">Full access to all content.</p>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 items-end">
                <div>
                  <span className="text-4xl font-extrabold">₹299</span>
                  <span className="text-blue-200 text-sm ml-2">/month</span>
                </div>
                <div className="text-sm text-blue-200 pb-0.5">or <span className="text-white font-semibold">₹2,499/year</span> <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Save 30%</span></div>
              </div>
            </div>

            {isPro ? (
              <div className="block w-full text-center py-3 bg-white/20 text-white font-bold rounded-xl text-sm mb-8">
                ✓ Already Pro
              </div>
            ) : (
              <div className="mb-8">
                <RazorpayButton label="Start Pro — ₹299/month" />
              </div>
            )}

            <ul className="space-y-3">
              {features.map(f => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-200 flex-shrink-0" />
                  <span className="text-blue-50">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              ['Can I cancel anytime?', 'Yes. No contracts. Cancel your Pro subscription at any time from your billing dashboard and you will continue to have access until the end of your current billing period.'],
              ['What payment methods do you accept?', "We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI, and net banking via Razorpay — India's most trusted payment gateway."],
              ['Is there a student discount?', "Yes! Email us with proof of enrollment and we'll apply a 50% student discount to your Pro plan."],
              ['What happens to my free content if I upgrade?', 'Nothing changes. All free content remains accessible. You gain additional access to premium topics on top of what you already have.'],
            ].map(([q, a]) => (
              <details key={q} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-slate-900 dark:text-white text-sm list-none">
                  {q} <span className="text-accent text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
