'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Code2, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'email' | 'otp' | 'password'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('OTP sent to your email')
      setStep('otp')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white mb-8 justify-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          EngineerTutorial
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Link href="/login" className="flex items-center gap-1 text-sm text-slate-500 hover:text-accent mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>

          {step === 'email' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Reset password</h1>
              <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you an OTP.</p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Enter OTP</h1>
              <p className="text-slate-500 text-sm mb-6">6-digit code sent to <strong>{email}</strong></p>
              <form onSubmit={(e) => { e.preventDefault(); setStep('password') }} className="space-y-4">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-bold tracking-widest py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-accent"
                />
                <button type="submit" disabled={otp.length !== 6}
                  className="w-full py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 text-sm">
                  Continue
                </button>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">New password</h1>
              <p className="text-slate-500 text-sm mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                    placeholder="Min 6 characters"
                    className="w-full pl-4 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
