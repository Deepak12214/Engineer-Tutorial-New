'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Code2, User, Mail, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-green-500']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('OTP sent to your email!')
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col w-[45%] bg-gradient-to-br from-indigo-600 to-blue-700 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <Link href="/" className="flex items-center gap-2 font-bold text-xl z-10 relative">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          EngineerTutorial
        </Link>
        <div className="flex-1 flex flex-col justify-center z-10 relative">
          <h2 className="text-4xl font-extrabold mb-8 leading-tight">Start your journey today</h2>
          <div className="space-y-6">
            {[['Free forever', 'Access dozens of free topics and all blogs immediately.'], ['AI learning assistant', 'Ask anything while you read — no separate app needed.'], ['Built-in code editor', 'Write and run code in 8 languages right in your browser.']].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-blue-200 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white mb-8 lg:hidden">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            EngineerTutorial
          </Link>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm mb-6">Free forever. No credit card required.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Rahul Sharma" required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters" required
                    className="w-full pl-4 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor[strength] : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-green-500'}`}>
                      {strengthLabel[strength]} password
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm mt-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</>
                ) : 'Create Account — Free'}
              </button>

              <p className="text-xs text-center text-slate-400 mt-2">
                By signing up you agree to our{' '}
                <a href="#" className="text-accent hover:underline">Terms</a> and{' '}
                <a href="#" className="text-accent hover:underline">Privacy Policy</a>
              </p>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
