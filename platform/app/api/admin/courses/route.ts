import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import CourseModel from '@/models/Course'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'author'))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req)
  if (err) return err
  await connectDB()
  const courses = await CourseModel.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req)
  if (err) return err
  try {
    await connectDB()
    const data = await req.json()
    const course = await CourseModel.create(data)
    return NextResponse.json(course, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
