export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import CourseModel from '@/models/Course'
import TopicModel from '@/models/Topic'
import BlogModel from '@/models/Blog'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    if (!q || q.length < 2) return NextResponse.json({ courses: [], topics: [], blogs: [] })

    await connectDB()

    const [courses, topics, blogs] = await Promise.all([
      CourseModel.find({ $text: { $search: q }, isPublished: true })
        .select('title slug description icon difficulty category').limit(5).lean(),
      TopicModel.find({ $text: { $search: q }, isPublished: true })
        .select('title slug isPremium courseId').populate('courseId', 'title slug').limit(8).lean(),
      BlogModel.find({ $text: { $search: q }, isPublished: true })
        .select('title slug category readTime').limit(5).lean(),
    ])

    return NextResponse.json({ courses, topics, blogs })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
