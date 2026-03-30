export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProcessingHistory, generateSampleData } from '@/lib/mock-data'

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  const userId = session.user.email
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  
  let result = getProcessingHistory(userId, page, limit)
  
  if (result.total === 0) {
    generateSampleData(userId)
    result = getProcessingHistory(userId, page, limit)
  }
  
  return NextResponse.json({
    items: result.items.map(item => ({
      id: item.id,
      originalFilename: item.originalFilename,
      originalSize: item.originalSize,
      processedSize: item.processedSize,
      processingTime: item.processingTime,
      outputFormat: item.outputFormat,
      thumbnailUrl: item.thumbnailUrl,
      createdAt: item.createdAt
    })),
    total: result.total,
    page,
    limit
  })
}
