'use client'

import { useState, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { removeBackground } from '@imgly/background-removal'

export default function Home() {
  const { data: session, status } = useSession()
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    setError(null)
    setProcessedImage(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!originalImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const blob = await (await fetch(originalImage)).blob()
      const resultBlob = await removeBackground(blob, {
        debug: false,
        progress: (key, current, total) => {
          console.log(`Progress: ${key} ${current}/${total}`)
        }
      })
      
      const url = URL.createObjectURL(resultBlob)
      setProcessedImage(url)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
        {!processedImage ? (
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
          </p>
        </div>
      </footer>
    </div>
  )
}
