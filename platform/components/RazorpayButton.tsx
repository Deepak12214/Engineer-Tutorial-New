'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

declare global {
  interface Window { Razorpay: any }
}

interface Props {
  label?: string
  className?: string
}

export default function RazorpayButton({ label = 'Upgrade to Pro', className }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function loadScript(): Promise<boolean> {
    return new Promise(resolve => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  async function handlePay() {
    if (!session?.user) {
      toast.error('Please sign in to upgrade')
      router.push('/login?callbackUrl=/pricing')
      return
    }

    setLoading(true)
    try {
      const loaded = await loadScript()
      if (!loaded) throw new Error('Payment gateway failed to load')

      const orderRes = await fetch('/api/payment/create-order', { method: 'POST' })
      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.error || 'Failed to create order')
      }
      const order = await orderRes.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'EngineerTutorial',
        description: 'Pro Monthly Subscription',
        order_id: order.id,
        prefill: { name: session.user.name ?? '', email: session.user.email ?? '' },
        theme: { color: '#2563eb' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })
            if (verifyRes.ok) {
              toast.success('Payment successful! You are now a Pro member.')
              router.push('/dashboard')
            } else {
              throw new Error('Verification failed')
            }
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePay} disabled={loading}
      className={className ?? 'flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 text-sm shadow-lg disabled:opacity-60 w-full justify-center'}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
      {loading ? 'Processing...' : label}
    </button>
  )
}
