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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  const blog = await BlogModel.findById(params.id).lean()
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(blog)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  try {
    await connectDB()
    const data = await req.json()
    const blog = await BlogModel.findByIdAndUpdate(params.id, data, { new: true })
    revalidatePath('/blogs')
    return NextResponse.json(blog)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  await BlogModel.findByIdAndDelete(params.id)
  revalidatePath('/blogs')
  return NextResponse.json({ success: true })
}
