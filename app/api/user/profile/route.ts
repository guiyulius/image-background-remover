import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getOrCreateUserProfile, updateUserProfile } from '@/lib/mock-data'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  // 使用 email 作为 userId（简化处理）
  const userId = session.user.email
  const profile = getOrCreateUserProfile(userId)
  
  return NextResponse.json({
    id: profile.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    username: profile.username,
    bio: profile.bio,
    website: profile.website,
    timezone: profile.timezone,
    language: profile.language,
    createdAt: profile.createdAt
  })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  const userId = session.user.email
  const data = await request.json()
  
  const updated = updateUserProfile(userId, {
    username: data.username,
    bio: data.bio,
    website: data.website,
    timezone: data.timezone,
    language: data.language
  })
  
  return NextResponse.json({ success: true, profile: updated })
}
