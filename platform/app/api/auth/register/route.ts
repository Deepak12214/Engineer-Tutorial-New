import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'
import { sendOTPEmail } from '@/lib/brevo'

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    await connectDB()

    const existing = await UserModel.findOne({ email: email.toLowerCase() })
    if (existing) {
      if (existing.isEmailVerified)
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      // Resend OTP for unverified account
      const otp = generateOTP()
      existing.otpCode = otp
      existing.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
      await existing.save()
      await sendOTPEmail(email, name, otp)
      return NextResponse.json({ message: 'OTP resent', email })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const otp = generateOTP()

    await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      otpCode: otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isEmailVerified: false,
      provider: 'credentials',
    })

    await sendOTPEmail(email, name, otp)

    return NextResponse.json({ message: 'OTP sent to your email', email })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
