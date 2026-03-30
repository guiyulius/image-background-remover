// RemoveBG Pro 方案配置

export type PlanType = 'A' | 'B'

export interface PlanConfig {
  type: PlanType
  name: string
  description: string
  guestDailyLimit: number
  userMonthlyLimit: number
  features: string[]
}

export const PLANS: Record<PlanType, PlanConfig> = {
  A: {
    type: 'A',
    name: '免费额度+历史记录型',
    description: '未登录：每天3次免费；登录后：每月50次+查历史记录',
    guestDailyLimit: 3,
    userMonthlyLimit: 50,
    features: [
      '未登录用户每天3次免费',
      '登录用户每月50次',
      '登录用户永久保存历史记录',
      '额度耗尽时提示登录',
      'Pro 会员可无限使用'
    ]
  },
  B: {
    type: 'B',
    name: '纯记录型（无额度限制）',
    description: '所有人无限免费使用，登录只为保存历史',
    guestDailyLimit: Infinity,
    userMonthlyLimit: Infinity,
    features: [
      '所有人无限免费使用',
      '登录用户保存历史记录',
      '登录用户个人统计',
      '无额度限制，爽快体验',
      '通过高级功能变现'
    ]
  }
}

// 当前激活的方案
export const CURRENT_PLAN: PlanType = 'A' // 切换到方案 A

export function getCurrentPlan(): PlanConfig {
  return PLANS[CURRENT_PLAN]
}

export function isPlanA(): boolean {
  return CURRENT_PLAN === 'A'
}

export function isPlanB(): boolean {
  return CURRENT_PLAN === 'B'
}
