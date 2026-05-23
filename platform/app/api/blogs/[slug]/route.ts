import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import BlogModel from '@/models/Blog'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB()
    const blog = await BlogModel.findOne({ slug: params.slug, isPublished: true })
      .populate('authorId', 'name avatar')
      .lean()
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    return NextResponse.json(blog)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
  }
}
