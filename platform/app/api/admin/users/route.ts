export const dynamic = 'force-dynamic'

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

export async function GET(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const users = await UserModel.find({})
    .select('-passwordHash -otpCode -otpExpiry')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
  const total = await UserModel.countDocuments()
  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) })
}
