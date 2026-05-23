export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import CourseModel from '@/models/Course'
import SectionModel from '@/models/Section'
import TopicModel from '@/models/Topic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    const query: any = { isPublished: true }
    if (category) query.category = category
    if (difficulty) query.difficulty = difficulty

    const courses = await CourseModel.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json(courses)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
