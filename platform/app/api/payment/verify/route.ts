export const dynamic = 'force-dynamic'

﻿import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'
import { createHmac } from 'crypto'
import { sendPaymentReceipt } from '@/lib/brevo'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, paymentId, signature } = await req.json()

  const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  try {
    await connectDB()
    const user = await UserModel.findByIdAndUpdate(
      (session.user as any).id,
      {
        subscriptionStatus: 'pro',
        role: 'premium_user',
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
      },
      { new: true }
    )

    if (user) {
      await sendPaymentReceipt(user.email, user.name, paymentId).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
