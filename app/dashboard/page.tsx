'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { formatFileSize, formatDuration, relativeTime } from '@/lib/db'

interface UserStats {
  totalImagesProcessed: number
  totalProcessingTime: number
  streakDays: number
  lastProcessedAt: number | null
}

interface HistoryItem {
  id: string
  originalFilename: string
  originalSize: number
  processedSize: number
  processingTime: number
  outputFormat: string
  createdAt: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      loadData()
    }
  }, [status])

  async function loadData() {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/history?limit=5')
      ])

      if (statsRes.ok) {
        setStats(await statsRes.json())
      }

      if (historyRes.ok) {
        const data = await historyRes.json()
        setRecentHistory(data.items)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <button
            onClick={() => signIn('google')}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40"
          >
            使用 Google 登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  RemoveBG Pro
                </h1>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-purple-600">
                个人中心
              </Link>
              <Link href="/history" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                处理历史
              </Link>
              <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                设置
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  👋 欢迎回来，{session.user?.name || '用户'}！
                </h2>
                <p className="text-gray-600 mt-1">
                  今天想要处理什么图片呢？
                </p>
              </div>
            </div>
            <Link href="/" className="px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl">
              上传新图片
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalImagesProcessed || 0}
                </p>
                <p className="text-sm text-gray-600">张图片</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? formatDuration(stats.totalProcessingTime) : '0s'}
                </p>
                <p className="text-sm text-gray-600">总耗时</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.streakDays || 0}
                </p>
                <p className="text-sm text-gray-600">天连续使用</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.lastProcessedAt ? relativeTime(stats.lastProcessedAt) : '-'}
                </p>
                <p className="text-sm text-gray-600">最近使用</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">最近处理记录</h3>
            <Link href="/history" className="text-sm font-medium text-purple-600 hover:text-purple-700">
              查看全部 →
            </Link>
          </div>

          {recentHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📷</span>
              </div>
              <p className="text-gray-600 mb-4">还没有处理记录</p>
              <Link href="/" className="text-purple-600 font-medium hover:text-purple-700">
                上传第一张图片 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📷</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.originalFilename}</p>
                      <p className="text-sm text-gray-500">
                        {item.originalSize && item.processedSize ? (
                          <>
                            {formatFileSize(item.originalSize)} → {formatFileSize(item.processedSize)}
                          </>
                        ) : (
                          '-'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{relativeTime(item.createdAt)}</p>
                    <p className="text-xs text-gray-400">
                      {item.processingTime ? `${(item.processingTime / 1000).toFixed(1)}s` : '-'} · {item.outputFormat?.toUpperCase() || '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
