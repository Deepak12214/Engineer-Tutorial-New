export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import TopicModel from '@/models/Topic'
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
  const topic = await TopicModel.findById(params.id).lean()
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(topic)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  try {
    await connectDB()
    const data = await req.json()
    const topic = await TopicModel.findByIdAndUpdate(params.id, data, { new: true })
    if (data.isPublished) revalidatePath(`/learn`)
    return NextResponse.json(topic)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin()
  if (err) return err
  await connectDB()
  await TopicModel.findByIdAndDelete(params.id)
  revalidatePath('/learn')
  return NextResponse.json({ success: true })
}
