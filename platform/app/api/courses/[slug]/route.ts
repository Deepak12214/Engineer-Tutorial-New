export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import CourseModel from '@/models/Course'
import SectionModel from '@/models/Section'
import TopicModel from '@/models/Topic'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB()
    const course = await CourseModel.findOne({ slug: params.slug, isPublished: true }).lean()
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const sections = await SectionModel.find({ courseId: (course as any)._id }).sort({ order: 1 }).lean()
    const sectionIds = sections.map((s: any) => s._id)
    const topics = await TopicModel.find({ sectionId: { $in: sectionIds }, isPublished: true })
      .select('_id title slug isPremium estimatedReadTime sectionId order')
      .sort({ order: 1 })
      .lean()

    const sectionsWithTopics = sections.map((section: any) => ({
      ...section,
      topics: topics.filter((t: any) => t.sectionId.toString() === section._id.toString()),
    }))

    return NextResponse.json({ ...course, sections: sectionsWithTopics })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}
