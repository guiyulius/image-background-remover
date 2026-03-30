import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { useUserQuota, useGuestQuota, checkUserQuota, checkGuestQuota } from '@/lib/quota'
import { addProcessingHistory } from '@/lib/mock-data'

export async function POST(request: Request) {
  const session = await auth()
  const data = await request.json()

  if (session?.user?.email) {
    const userId = session.user.email
    const success = useUserQuota(userId)

    if (!success) {
      return NextResponse.json({
        success: false,
        error: '月度配额已用完',
        remaining: 0,
        total: 50
      }, { status: 429 })
    }

    // 记录到历史
    if (data.historyData) {
      addProcessingHistory(userId, data.historyData)
    }

    const { remaining, total, used } = checkUserQuota(userId)
    return NextResponse.json({
      success: true,
      remaining,
      total,
      used
    })
  } else {
    const identifier = data.identifier || 'anonymous'
    const success = useGuestQuota(identifier)

    if (!success) {
      return NextResponse.json({
        success: false,
        error: '今日配额已用完，请登录或明天再来',
        remaining: 0,
        total: 3
      }, { status: 429 })
    }

    const { remaining, total, used } = checkGuestQuota(identifier)
    return NextResponse.json({
      success: true,
      remaining,
      total,
      used
    })
  }
}
