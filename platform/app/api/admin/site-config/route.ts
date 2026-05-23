export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import SiteConfigModel from '@/models/SiteConfig'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'author'))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (key) {
    const config = await SiteConfigModel.findOne({ key }).lean()
    return NextResponse.json(config ?? { key, value: null })
  }
  const all = await SiteConfigModel.find({}).lean()
  return NextResponse.json(all)
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  try {
    await connectDB()
    const { key, value } = await req.json()
    const config = await SiteConfigModel.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    )
    return NextResponse.json(config)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
