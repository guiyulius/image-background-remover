import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrCreateUserPreferences, updateUserPreferences } from '@/lib/mock-data'

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  const userId = session.user.email
  const prefs = getOrCreateUserPreferences(userId)
  
  return NextResponse.json({
    defaultOutputFormat: prefs.defaultOutputFormat,
    defaultQuality: prefs.defaultQuality,
    autoDownload: prefs.autoDownload,
    theme: prefs.theme,
    showTutorial: prefs.showTutorial,
    emailNotifications: prefs.emailNotifications,
    newsletter: prefs.newsletter
  })
}

export async function PUT(request: Request) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  const userId = session.user.email
  const data = await request.json()
  
  const updated = updateUserPreferences(userId, {
    defaultOutputFormat: data.defaultOutputFormat,
    defaultQuality: data.defaultQuality,
    autoDownload: data.autoDownload,
    theme: data.theme,
    showTutorial: data.showTutorial,
    emailNotifications: data.emailNotifications,
    newsletter: data.newsletter
  })
  
  return NextResponse.json({ success: true, preferences: updated })
}
