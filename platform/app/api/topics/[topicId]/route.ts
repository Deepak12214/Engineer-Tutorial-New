import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import TopicModel from '@/models/Topic'
import ProgressModel from '@/models/Progress'

export async function GET(req: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    await connectDB()
    const session = await auth()

    const isObjectId = /^[a-f\d]{24}$/i.test(params.topicId)
    const topic = await (isObjectId
      ? TopicModel.findById(params.topicId)
      : TopicModel.findOne({ slug: params.topicId })
    ).lean() as any
    if (!topic || !topic.isPublished) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isPro = session?.user?.subscriptionStatus === 'pro'
    const blocks = (topic.isPremium && !isPro)
      ? topic.blocks.slice(0, topic.previewBlockCount ?? 3)
      : topic.blocks

    // Update progress — last visited
    if (session?.user?.id) {
      await ProgressModel.findOneAndUpdate(
        { userId: session.user.id, courseId: topic.courseId },
        { lastVisitedTopicId: topic._id, updatedAt: new Date() },
        { upsert: true }
      )
    }

    return NextResponse.json({ ...topic, blocks, isGated: topic.isPremium && !isPro })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 })
  }
}
