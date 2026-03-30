// 模拟数据服务 - 用于开发和演示

import { UserProfile, UserPreferences, ProcessingHistory, UserStats, generateId } from './db'

// 内存存储
const userProfiles = new Map<string, UserProfile>()
const userPreferences = new Map<string, UserPreferences>()
const processingHistory = new Map<string, ProcessingHistory[]>()
const userStats = new Map<string, UserStats>()

// 获取或创建用户资料
export function getOrCreateUserProfile(userId: string): UserProfile {
  let profile = userProfiles.get(userId)
  if (!profile) {
    profile = {
      id: generateId(),
      userId,
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
    userProfiles.set(userId, profile)
  }
  return profile
}

// 更新用户资料
export function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): UserProfile {
  const profile = getOrCreateUserProfile(userId)
  const updated = {
    ...profile,
    ...data,
    updatedAt: Math.floor(Date.now() / 1000)
  }
  userProfiles.set(userId, updated)
  return updated
}

// 获取或创建用户偏好
export function getOrCreateUserPreferences(userId: string): UserPreferences {
  let prefs = userPreferences.get(userId)
  if (!prefs) {
    prefs = {
      id: generateId(),
      userId,
      defaultOutputFormat: 'png',
      defaultQuality: 100,
      autoDownload: false,
      theme: 'light',
      showTutorial: true,
      emailNotifications: true,
      newsletter: false,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
    userPreferences.set(userId, prefs)
  }
  return prefs
}

// 更新用户偏好
export function updateUserPreferences(userId: string, data: Partial<Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): UserPreferences {
  const prefs = getOrCreateUserPreferences(userId)
  const updated = {
    ...prefs,
    ...data,
    updatedAt: Math.floor(Date.now() / 1000)
  }
  userPreferences.set(userId, updated)
  return updated
}

// 获取或创建用户统计
export function getOrCreateUserStats(userId: string): UserStats {
  let stats = userStats.get(userId)
  if (!stats) {
    stats = {
      id: generateId(),
      userId,
      totalImagesProcessed: 0,
      totalProcessingTime: 0,
      totalBytesSaved: 0,
      streakDays: 0,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
    userStats.set(userId, stats)
  }
  return stats
}

// 添加处理记录
export function addProcessingHistory(userId: string, data: Omit<ProcessingHistory, 'id' | 'userId' | 'createdAt'>): ProcessingHistory {
  const record: ProcessingHistory = {
    id: generateId(),
    userId,
    createdAt: Math.floor(Date.now() / 1000),
    ...data
  }
  
  const history = processingHistory.get(userId) || []
  history.unshift(record)
  processingHistory.set(userId, history)
  
  // 更新统计
  const stats = getOrCreateUserStats(userId)
  stats.totalImagesProcessed += 1
  if (data.processingTime) {
    stats.totalProcessingTime += data.processingTime
  }
  if (data.originalSize && data.processedSize) {
    stats.totalBytesSaved += (data.originalSize - data.processedSize)
  }
  stats.lastProcessedAt = record.createdAt
  stats.updatedAt = Math.floor(Date.now() / 1000)
  userStats.set(userId, stats)
  
  return record
}

// 获取处理历史
export function getProcessingHistory(userId: string, page = 1, limit = 20): { items: ProcessingHistory[], total: number } {
  const history = processingHistory.get(userId) || []
  const start = (page - 1) * limit
  const items = history.slice(start, start + limit)
  return { items, total: history.length }
}

// 删除处理记录
export function deleteProcessingHistory(userId: string, recordId: string): boolean {
  const history = processingHistory.get(userId)
  if (!history) return false
  
  const index = history.findIndex(r => r.id === recordId)
  if (index === -1) return false
  
  history.splice(index, 1)
  processingHistory.set(userId, history)
  return true
}

// 生成示例数据
export function generateSampleData(userId: string) {
  const sampleFiles = [
    { name: 'product_photo.jpg', originalSize: 2456789, processedSize: 876543, time: 1234 },
    { name: 'profile_picture.png', originalSize: 1234567, processedSize: 456789, time: 987 },
    { name: 'vacation_photo.webp', originalSize: 3456789, processedSize: 1234567, time: 1567 },
    { name: 'family_portrait.jpg', originalSize: 5678901, processedSize: 2345678, time: 2345 },
    { name: 'team_photo.png', originalSize: 2345678, processedSize: 789012, time: 1123 },
  ]
  
  sampleFiles.forEach((file, i) => {
    const daysAgo = i * 2
    const timestamp = Math.floor(Date.now() / 1000) - daysAgo * 86400
    
    addProcessingHistory(userId, {
      originalFilename: file.name,
      originalSize: file.originalSize,
      processedSize: file.processedSize,
      processingTime: file.time,
      outputFormat: file.name.split('.').pop(),
      createdAt: timestamp
    })
  })
}
