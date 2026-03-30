'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { removeBackground } from '@imgly/background-removal'
import { addProcessingHistory } from '@/lib/mock-data'

export default function HomePlanA() {
  const { data: session, status } = useSession()
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<any>(null)
  const [showQuotaWarning, setShowQuotaWarning] = useState(false)
  const [showQuotaExhausted, setShowQuotaExhausted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkQuota()
  }, [status])

  async function checkQuota() {
    try {
      const res = await fetch('/api/usage/check?identifier=anonymous')
      if (res.ok) {
        const data = await res.json()
        setQuota(data)
      }
    } catch (error) {
      console.error('检查额度失败:', error)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    setError(null)
    setProcessedImage(null)
    setShowQuotaWarning(false)
    setShowQuotaExhausted(false)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!originalImage || !fileInputRef.current?.files?.[0]) return

    const file = fileInputRef.current.files[0]
    const startTime = Date.now()
    
    setIsProcessing(true)
    setError(null)
    setShowQuotaWarning(false)
    setShowQuotaExhausted(false)

    try {
      // 先尝试使用额度
      const recordRes = await fetch('/api/usage/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'anonymous',
          type: 'processing'
        })
      })

      if (!recordRes.ok) {
        const data = await recordRes.json()
        if (recordRes.status === 429) {
          setShowQuotaExhausted(true)
          return
        }
        throw new Error(data.error)
      }

      const recordData = await recordRes.json()
      setQuota(recordData)

      if (recordData.remaining === 1 && !recordData.isLoggedIn) {
        setShowQuotaWarning(true)
      }

      // 处理图片
      const blob = await (await fetch(originalImage)).blob()
      const resultBlob = await removeBackground(blob, {
        debug: false,
        progress: (key, current, total) => {
          console.log(`Progress: ${key} ${current}/${total}`)
        }
      })
      
      const processingTime = Date.now() - startTime
      const url = URL.createObjectURL(resultBlob)
      setProcessedImage(url)
      
      // 如果已登录，自动保存到历史记录
      if (session?.user?.email) {
        addProcessingHistory(session.user.email, {
          originalFilename: file.name,
          originalSize: file.size,
          processedSize: resultBlob.size,
          processingTime,
          outputFormat: 'png'
        })
      }
    } catch (err) {
      console.error('Error:', err)
      setError('处理图片时出错，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.href = processedImage
    link.download = 'removebg-pro-result.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setError(null)
    setShowQuotaWarning(false)
    setShowQuotaExhausted(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  RemoveBG Pro
                </h1>
                <p className="text-sm text-gray-500">专业的 AI 背景移除工具</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {status === 'loading' ? (
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="text-sm font-medium text-purple-600 hover:text-purple-700">
                    个人中心
                  </Link>
                  <div className="flex items-center gap-2">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40"
                >
                  使用 Google 登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 额度提示 */}
        {quota && (
          <div className={`mb-8 rounded-2xl shadow-xl p-6 ${
            showQuotaExhausted ? 'bg-red-50 border border-red-200' : 
            showQuotaWarning ? 'bg-yellow-50 border border-yellow-200' :
            'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  showQuotaExhausted ? 'bg-red-100' : 
                  showQuotaWarning ? 'bg-yellow-100' : 'bg-white/20'
                }`}>
                  <span className="text-2xl">
                    {showQuotaExhausted ? '⚠️' : showQuotaWarning ? '⏱️' : '🎁'}
                  </span>
                </div>
                <div>
                  {showQuotaExhausted ? (
                    <>
                      <h3 className="text-lg font-semibold text-red-900">今日/本月免费次数已用完</h3>
                      <p className="text-red-700">
                        {quota.isLoggedIn ? '下个月 1 号重置额度' : '请登录获取更多次数或明天再来'}
                      </p>
                    </>
                  ) : showQuotaWarning ? (
                    <>
                      <h3 className="text-lg font-semibold text-yellow-900">
                        还剩最后 1 次免费机会！
                      </h3>
                      <p className="text-yellow-700">
                        {!quota.isLoggedIn && '登录解锁更多次数！'}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">
                        {quota.isLoggedIn ? '本月剩余' : '今日剩余'}：{quota.remaining}/{quota.total} 次
                      </h3>
                      {quota.isLoggedIn && quota.nextResetIn && (
                        <p className="text-white/80">
                          下次重置：{quota.nextResetIn}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              {!quota.isLoggedIn && !showQuotaExhausted && (
                <button
                  onClick={() => signIn('google')}
                  className={`px-6 py-2.5 font-medium rounded-xl transition-all ${
                    showQuotaWarning ? 'bg-white text-yellow-600 hover:bg-gray-100' :
                    'bg-white text-purple-600 hover:bg-gray-100'
                  }`}
                >
                  登录获取更多次数
                </button>
              )}
              {showQuotaExhausted && !quota.isLoggedIn && (
                <button
                  onClick={() => signIn('google')}
                  className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                >
                  登录解锁更多
                </button>
              )}
            </div>
          </div>
        )}

        {!showQuotaExhausted && !processedImage ? (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                一键移除图片背景
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                使用 AI 技术，简单、快速、专业的背景移除效果
              </p>
            </div>

            {!originalImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="max-w-2xl mx-auto border-3 border-dashed border-gray-300 rounded-3xl p-16 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                    <span className="text-5xl">📷</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    上传你的图片
                  </h3>
                  <p className="text-gray-600 mb-2">
                    点击或拖拽图片到此处
                  </p>
                  <p className="text-sm text-gray-400">
                    支持 JPG、PNG、WebP 格式
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full max-h-96 object-contain mx-auto"
                  />
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={reset}
                    className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                    重新选择
                  </button>
                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="px-8 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        移除背景
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : showQuotaExhausted ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
              <span className="text-5xl">⏰</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              免费次数已用完
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {session?.user?.email ? 
                '本月 50 次免费额度已用完，请下个月再来或升级到 Pro' :
                '今日 3 次免费额度已用完，请登录获取更多次数或明天再来'
              }
            </p>
            <div className="flex gap-4 justify-center">
              {!session?.user?.email && (
                <button
                  onClick={() => signIn('google')}
                  className="px-8 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl"
                >
                  登录解锁更多
                </button>
              )}
              <button
                onClick={reset}
                className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                {session?.user?.email ? '升级到 Pro' : '明天再来'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 处理完成！
              </h2>
              <p className="text-xl text-gray-600">
                你的图片背景已经完美移除
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-600">原图</p>
                </div>
                <div className="p-4">
                  <img
                    src={originalImage || ''}
                    alt="Original"
                    className="w-full max-h-80 object-contain mx-auto"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
                  <p className="text-sm font-medium text-purple-700">处理结果</p>
                </div>
                <div className="p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSI+PGNpcmNsZSBmaWxsPSIjZjNmNGY2IiBjeD0iMTAiIGN5PSIxMCIgcj0iMCIvPjxjaXJjbGUgZmlsbD0iI2U1ZTdlYiIgY3g9IjEwIiBjeT0iMTAiIHI9IjEwIi8+PC9nPjwvc3ZnPg==')]">
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full max-h-80 object-contain mx-auto"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                处理新图片
              </button>
              <button
                onClick={downloadImage}
                className="px-8 py-3 text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-medium shadow-lg shadow-green-500/30 transition-all hover:shadow-xl flex items-center gap-2"
              >
                <span>📥</span>
                下载图片
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            © 2025 RemoveBG Pro. 使用 AI 技术，让图片处理更简单。
            {!session?.user?.email && (
              <span className="ml-2 text-purple-600">
                · 登录解锁更多免费次数
              </span>
            )}
          </p>
        </div>
      </footer>
    </div>
  )
}
