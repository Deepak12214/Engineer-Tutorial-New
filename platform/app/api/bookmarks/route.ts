import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import UserModel from '@/models/User'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const user = await UserModel.findById(session.user.id).select('bookmarks').lean() as any
  return NextResponse.json(user?.bookmarks ?? [])
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, refId, action } = await req.json()
    await connectDB()

    if (action === 'remove') {
      await UserModel.findByIdAndUpdate(session.user.id, {
        $pull: { bookmarks: { refId } }
      })
    } else {
      await UserModel.findByIdAndUpdate(session.user.id, {
        $addToSet: { bookmarks: { type, refId } }
      })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
  }
}
