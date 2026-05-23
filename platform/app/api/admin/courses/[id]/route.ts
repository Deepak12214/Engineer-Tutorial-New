import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import CourseModel from '@/models/Course'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'author'))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  const course = await CourseModel.findById(params.id).lean()
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(course)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  try {
    await connectDB()
    const data = await req.json()
    const course = await CourseModel.findByIdAndUpdate(params.id, data, { new: true })
    return NextResponse.json(course)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  await CourseModel.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
