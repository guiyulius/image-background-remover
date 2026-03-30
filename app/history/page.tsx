'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { formatFileSize, relativeTime } from '@/lib/db'

interface HistoryItem {
  id: string
  originalFilename: string
  originalSize: number
  processedSize: number
  processingTime: number
  outputFormat: string
  createdAt: number
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      loadHistory(1)
    }
  }, [status])

  async function loadHistory(pageNum: number) {
    try {
      setLoading(true)
      const res = await fetch(`/api/history?page=${pageNum}&limit=20`)
      
      if (res.ok) {
        const data = await res.json()
        if (pageNum === 1) {
          setHistory(data.items)
        } else {
          setHistory(prev => [...prev, ...data.items])
        }
        setTotal(data.total)
        setHasMore(pageNum * 20 < data.total)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
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
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                个人中心
              </Link>
              <Link href="/history" className="text-sm font-medium text-purple-600">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📋 处理历史</h2>
          <p className="text-gray-600">
            共 {total} 条记录
          </p>
        </div>

        {loading && history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-5xl">📷</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有处理记录</h3>
            <p className="text-gray-600 mb-6">开始使用 RemoveBG Pro 处理你的第一张图片吧！</p>
            <Link href="/" className="px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl">
              上传新图片
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📷</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.originalFilename}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">原始大小：</span>
                          <span className="font-medium text-gray-900">
                            {item.originalSize ? formatFileSize(item.originalSize) : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">处理后大小：</span>
                          <span className="font-medium text-gray-900">
                            {item.processedSize ? formatFileSize(item.processedSize) : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">处理耗时：</span>
                          <span className="font-medium text-gray-900">
                            {item.processingTime ? `${(item.processingTime / 1000).toFixed(1)}s` : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">输出格式：</span>
                          <span className="font-medium text-gray-900">
                            {item.outputFormat?.toUpperCase() || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-600">
                      {relativeTime(item.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt * 1000).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => loadHistory(page + 1)}
                  disabled={loading}
                  className="px-8 py-3 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
