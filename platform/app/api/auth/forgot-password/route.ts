import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'
import { sendForgotPasswordOTP } from '@/lib/brevo'

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    await connectDB()
    const user = await UserModel.findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: 'If this email exists, an OTP has been sent' })
    }

    const otp = generateOTP()
    user.otpCode = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendForgotPasswordOTP(user.email, user.name, otp)

    return NextResponse.json({ message: 'OTP sent to your email', email })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
