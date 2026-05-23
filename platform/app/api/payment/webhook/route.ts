export const dynamic = 'force-dynamic'

﻿import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'
import { createHmac } from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (webhookSecret && signature) {
    const expectedSig = createHmac('sha256', webhookSecret).update(body).digest('hex')
    if (expectedSig !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  const event = JSON.parse(body)
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    try {
      await connectDB()
      await UserModel.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        { subscriptionStatus: 'pro', role: 'premium_user', razorpayPaymentId: payment.id }
      )
    } catch {}
  }

  return NextResponse.json({ received: true })
}
