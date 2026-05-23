export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import ProgressModel from '@/models/Progress'
import TopicModel from '@/models/Topic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const progress = await ProgressModel.find({ userId: session.user.id }).lean()
  return NextResponse.json(progress)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { topicId, courseId } = await req.json()
    await connectDB()

    const progress = await ProgressModel.findOneAndUpdate(
      { userId: session.user.id, courseId },
      { $addToSet: { completedTopics: topicId }, lastVisitedTopicId: topicId },
      { upsert: true, new: true }
    )

    // Recalculate completion percentage
    const totalTopics = await TopicModel.countDocuments({ courseId, isPublished: true })
    progress.completionPercentage = totalTopics > 0
      ? Math.round((progress.completedTopics.length / totalTopics) * 100)
      : 0
    await progress.save()

    return NextResponse.json(progress)
  } catch {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
