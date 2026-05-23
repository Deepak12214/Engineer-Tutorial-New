export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const order = await razorpay.orders.create({
      amount: 29900,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })
    return NextResponse.json(order)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Order creation failed' }, { status: 500 })
  }
}
