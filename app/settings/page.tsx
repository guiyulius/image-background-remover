'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

interface UserProfile {
  username?: string
  bio?: string
  website?: string
  timezone: string
  language: string
}

interface UserPreferences {
  defaultOutputFormat: 'png' | 'webp' | 'jpg'
  defaultQuality: number
  autoDownload: boolean
  theme: 'light' | 'dark' | 'system'
  showTutorial: boolean
  emailNotifications: boolean
  newsletter: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      loadData()
    }
  }, [status])

  async function loadData() {
    try {
      const [profileRes, prefsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/preferences')
      ])

      if (profileRes.ok) {
        setProfile(await profileRes.json())
      }

      if (prefsRes.ok) {
        setPreferences(await prefsRes.json())
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    if (!profile) return
    
    try {
      setSaving(true)
      setMessage(null)
      
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: '个人资料已保存！' })
      } else {
        setMessage({ type: 'error', text: '保存失败，请重试' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  async function savePreferences() {
    if (!preferences) return
    
    try {
      setSaving(true)
      setMessage(null)
      
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: '偏好设置已保存！' })
      } else {
        setMessage({ type: 'error', text: '保存失败，请重试' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setSaving(false)
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
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                个人中心
              </Link>
              <Link href="/history" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                处理历史
              </Link>
              <Link href="/settings" className="text-sm font-medium text-purple-600">
                设置
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">⚙️ 设置</h2>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'profile', label: '个人资料', icon: '👤' },
                { id: 'preferences', label: '偏好设置', icon: '🎛️' },
                { id: 'account', label: '账户管理', icon: '🔐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Message */}
          {message && (
            <div className={`mx-6 mt-6 px-4 py-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && profile && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-20 h-20 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-gray-500">{session.user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                  <input
                    type="text"
                    value={profile.username || ''}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="输入用户名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="介绍一下自己..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人网站</label>
                  <input
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">时区</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Asia/Shanghai">亚洲/上海 (UTC+8)</option>
                      <option value="Asia/Tokyo">亚洲/东京 (UTC+9)</option>
                      <option value="America/New_York">美洲/纽约 (UTC-5)</option>
                      <option value="Europe/London">欧洲/伦敦 (UTC+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="zh-CN">简体中文</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : '保存更改'}
                </button>
              </div>
            )}

            {activeTab === 'preferences' && preferences && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">输出设置</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">默认输出格式</label>
                    <select
                      value={preferences.defaultOutputFormat}
                      onChange={(e) => setPreferences({ ...preferences, defaultOutputFormat: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="png">PNG (推荐，支持透明)</option>
                      <option value="webp">WebP (更小体积)</option>
                      <option value="jpg">JPG (不支持透明)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">默认质量</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={preferences.defaultQuality}
                      onChange={(e) => setPreferences({ ...preferences, defaultQuality: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">自动下载</p>
                    <p className="text-sm text-gray-500">处理完成后自动下载图片</p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, autoDownload: !preferences.autoDownload })}
                    className={`w-14 h-7 rounded-full transition-colors ${
                      preferences.autoDownload ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      preferences.autoDownload ? 'translate-x-8' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 pt-4">界面设置</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="light">浅色</option>
                    <option value="dark">深色</option>
                    <option value="system">跟随系统</option>
                  </select>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 pt-4">通知设置</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">邮件通知</p>
                      <p className="text-sm text-gray-500">接收重要更新和通知</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                      className={`w-14 h-7 rounded-full transition-colors ${
                        preferences.emailNotifications ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        preferences.emailNotifications ? 'translate-x-8' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">订阅 Newsletter</p>
                      <p className="text-sm text-gray-500">获取新产品和功能更新</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, newsletter: !preferences.newsletter })}
                      className={`w-14 h-7 rounded-full transition-colors ${
                        preferences.newsletter ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        preferences.newsletter ? 'translate-x-8' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : '保存更改'}
                </button>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">关联账户</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-xl">🔵</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Google</p>
                      <p className="text-sm text-green-600">✓ 已关联</p>
                    </div>
                  </div>
                  <span className="text-gray-400">{session.user?.email}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 pt-4">数据管理</h3>

                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                    <p className="font-medium text-gray-900">导出我的数据</p>
                    <p className="text-sm text-gray-500">下载所有处理历史和个人数据</p>
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-red-600 mb-4 pt-4">危险区域</h3>

                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-medium text-red-900 mb-2">删除账户</p>
                  <p className="text-sm text-red-700 mb-4">
                    永久删除你的账户和所有相关数据。此操作不可撤销。
                  </p>
                  <button className="px-4 py-2 text-red-600 bg-white border border-red-300 hover:bg-red-50 rounded-lg font-medium transition-colors">
                    删除账户
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
