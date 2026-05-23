import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'
import { sendWelcomeEmail } from '@/lib/brevo'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp)
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })

    await connectDB()
    const user = await UserModel.findOne({ email: email.toLowerCase() })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.isEmailVerified) return NextResponse.json({ message: 'Already verified' })
    if (user.otpCode !== otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    if (user.otpExpiry && user.otpExpiry < new Date())
      return NextResponse.json({ error: 'OTP expired, please register again' }, { status: 400 })

    user.isEmailVerified = true
    user.otpCode = undefined
    user.otpExpiry = undefined
    await user.save()

    // Send welcome email in background (don't await)
    sendWelcomeEmail(user.email, user.name).catch(() => {})

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
