export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import BlogModel from '@/models/Blog'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const query: any = { isPublished: true }
    if (category) query.category = category

    const blogs = await BlogModel.find(query)
      .select('title slug category tags readTime featuredImage createdAt authorId')
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(blogs)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}
