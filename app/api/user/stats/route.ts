import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrCreateUserStats } from '@/lib/mock-data'

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  const userId = session.user.email
  const stats = getOrCreateUserStats(userId)
  
  return NextResponse.json({
    totalImagesProcessed: stats.totalImagesProcessed,
    totalProcessingTime: stats.totalProcessingTime,
    streakDays: stats.streakDays,
    lastProcessedAt: stats.lastProcessedAt
  })
}
