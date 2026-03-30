// 方案 A：免费额度+历史记录型 - 配额管理

export interface UserQuota {
  id: string
  userId: string
  monthlyQuota: number
  monthlyUsed: number
  quotaResetDate: number
  totalUsed: number
  createdAt: number
  updatedAt: number
}

export interface GuestUsage {
  id: string
  identifier: string
  date: string
  count: number
  createdAt: number
  updatedAt: number
}

// 内存存储
const userQuotas = new Map<string, UserQuota>()
const guestUsages = new Map<string, GuestUsage>()

// 生成唯一 ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

// 获取今天的日期字符串（YYYY-MM-DD）
function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// 获取下次重置日期（下月 1 号）
function getNextResetDate(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.floor(nextMonth.getTime() / 1000)
}

// 检查是否需要重置月度配额
function needsResetQuota(resetDate: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  return now >= resetDate
}

// 获取或创建用户配额
export function getOrCreateUserQuota(userId: string): UserQuota {
  let quota = userQuotas.get(userId)
  if (!quota) {
    quota = {
      id: generateId(),
      userId,
      monthlyQuota: 50,
      monthlyUsed: 0,
      quotaResetDate: getNextResetDate(),
      totalUsed: 0,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
    userQuotas.set(userId, quota)
  } else if (needsResetQuota(quota.quotaResetDate)) {
    // 重置月度配额
    quota.monthlyUsed = 0
    quota.quotaResetDate = getNextResetDate()
    quota.updatedAt = Math.floor(Date.now() / 1000)
    userQuotas.set(userId, quota)
  }
  return quota
}

// 检查用户是否有剩余额度
export function checkUserQuota(userId: string): { remaining: number; total: number; used: number; resetDate: number; nextResetIn: string } {
  const quota = getOrCreateUserQuota(userId)
  const remaining = quota.monthlyQuota - quota.monthlyUsed
  const now = Math.floor(Date.now() / 1000)
  const daysUntilReset = Math.ceil((quota.quotaResetDate - now) / 86400)
  const nextResetIn = daysUntilReset <= 1 ? '明天' : `${daysUntilReset} 天后`

  return {
    remaining,
    total: quota.monthlyQuota,
    used: quota.monthlyUsed,
    resetDate: quota.quotaResetDate,
    nextResetIn
  }
}

// 使用用户额度
export function useUserQuota(userId: string): boolean {
  const quota = getOrCreateUserQuota(userId)
  if (quota.monthlyUsed >= quota.monthlyQuota) {
    return false
  }
  quota.monthlyUsed += 1
  quota.totalUsed += 1
  quota.updatedAt = Math.floor(Date.now() / 1000)
  userQuotas.set(userId, quota)
  return true
}

// 获取或创建访客使用记录
function getOrCreateGuestUsage(identifier: string): GuestUsage {
  const today = getTodayString()
  const key = `${identifier}-${today}`
  let usage = guestUsages.get(key)
  if (!usage) {
    usage = {
      id: generateId(),
      identifier,
      date: today,
      count: 0,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
    guestUsages.set(key, usage)
  }
  return usage
}

// 检查访客是否有剩余额度
export function checkGuestQuota(identifier: string): { remaining: number; total: number; used: number } {
  const usage = getOrCreateGuestUsage(identifier)
  const remaining = 3 - usage.count
  return {
    remaining,
    total: 3,
    used: usage.count
  }
}

// 使用访客额度
export function useGuestQuota(identifier: string): boolean {
  const usage = getOrCreateGuestUsage(identifier)
  if (usage.count >= 3) {
    return false
  }
  usage.count += 1
  usage.updatedAt = Math.floor(Date.now() / 1000)
  const today = getTodayString()
  const key = `${identifier}-${today}`
  guestUsages.set(key, usage)
  return true
}
