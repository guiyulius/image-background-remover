export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkUserQuota, checkGuestQuota } from '@/lib/quota'

export async function GET(request: Request) {
  const session = await auth()
  const { searchParams } = new URL(request.url)
  const identifier = searchParams.get('identifier') || 'anonymous'

  if (session?.user?.email) {
    const userId = session.user.email
    const quota = checkUserQuota(userId)
    return NextResponse.json({
      isLoggedIn: true,
      remaining: quota.remaining,
      total: quota.total,
      used: quota.used,
      resetDate: quota.resetDate,
      nextResetIn: quota.nextResetIn
    })
  } else {
    const quota = checkGuestQuota(identifier)
    return NextResponse.json({
      isLoggedIn: false,
      remaining: quota.remaining,
      total: quota.total,
      used: quota.used
    })
  }
}
