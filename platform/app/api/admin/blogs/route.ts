import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import BlogModel from '@/models/Blog'
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
  const blogs = await BlogModel.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json(blogs)
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin()
  if (err) return err
  const session = await auth()
  try {
    await connectDB()
    const data = await req.json()
    const blog = await BlogModel.create({ ...data, authorId: session!.user.id })
    if (data.isPublished) revalidatePath('/blogs')
    return NextResponse.json(blog, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
