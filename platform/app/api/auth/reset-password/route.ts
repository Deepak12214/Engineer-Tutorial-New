export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json()
    if (!email || !otp || !newPassword)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })

    if (newPassword.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    await connectDB()
    const user = await UserModel.findOne({ email: email.toLowerCase() })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.otpCode !== otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    if (user.otpExpiry && user.otpExpiry < new Date())
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 })

    user.passwordHash = await bcrypt.hash(newPassword, 12)
    user.otpCode = undefined
    user.otpExpiry = undefined
    await user.save()

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }
}
