// 数据库类型定义和工具函数

export interface UserProfile {
  id: string
  userId: string
  username?: string
  bio?: string
  website?: string
  timezone: string
  language: string
  createdAt: number
  updatedAt: number
}

export interface UserPreferences {
  id: string
  userId: string
  defaultOutputFormat: 'png' | 'webp' | 'jpg'
  defaultQuality: number
  autoDownload: boolean
  theme: 'light' | 'dark' | 'system'
  showTutorial: boolean
  emailNotifications: boolean
  newsletter: boolean
  createdAt: number
  updatedAt: number
}

export interface ProcessingHistory {
  id: string
  userId: string
  originalFilename?: string
  originalSize?: number
  processedSize?: number
  processingTime?: number
  outputFormat?: string
  originalUrl?: string
  processedUrl?: string
  thumbnailUrl?: string
  ipAddress?: string
  userAgent?: string
  createdAt: number
}

export interface UserStats {
  id: string
  userId: string
  totalImagesProcessed: number
  totalProcessingTime: number
  totalBytesSaved: number
  streakDays: number
  lastProcessedAt?: number
  createdAt: number
  updatedAt: number
}

// 生成唯一 ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// 相对时间
export function relativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`
  
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN')
}
