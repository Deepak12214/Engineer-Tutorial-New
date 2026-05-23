import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  try {
    await connectDB()
    const { role, subscriptionStatus } = await req.json()
    const allowedFields: any = {}
    if (role) allowedFields.role = role
    if (subscriptionStatus) allowedFields.subscriptionStatus = subscriptionStatus
    const user = await UserModel.findByIdAndUpdate(params.id, allowedFields, { new: true })
      .select('-passwordHash -otpCode -otpExpiry')
    return NextResponse.json(user)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  await UserModel.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
