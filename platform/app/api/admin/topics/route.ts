import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import TopicModel from '@/models/Topic'
import CourseModel from '@/models/Course'
import { revalidatePath } from 'next/cache'

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
  const sectionId = searchParams.get('sectionId')
  const query: any = {}
  if (courseId) query.courseId = courseId
  if (sectionId) query.sectionId = sectionId
  const topics = await TopicModel.find(query).sort({ order: 1 }).lean()
  return NextResponse.json(topics)
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  try {
    await connectDB()
    const data = await req.json()
    const topic = await TopicModel.create(data)
    // Update course totalTopics count
    const count = await TopicModel.countDocuments({ courseId: data.courseId, isPublished: true })
    await CourseModel.findByIdAndUpdate(data.courseId, { totalTopics: count })
    if (data.isPublished) revalidatePath(`/learn`)
    return NextResponse.json(topic, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
