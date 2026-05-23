export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import SectionModel from '@/models/Section'

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
  const courseId = searchParams.get('courseId')
  const query = courseId ? { courseId } : {}
  const sections = await SectionModel.find(query).sort({ order: 1 }).lean()
  return NextResponse.json(sections)
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  try {
    await connectDB()
    const data = await req.json()
    const section = await SectionModel.create(data)
    return NextResponse.json(section, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
