'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })
            const data = await res.json()

            if (data.success) {
                toast.success('Đăng nhập thành công')
                router.push('/')
                router.refresh()
            } else {
                toast.error(data.error || 'Mật khẩu không đúng')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-primary-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt="Shop Lý Triệu"
                            className="object-cover w-full h-full"
                            onError={(e) => {
                                e.currentTarget.src = 'https://ui-avatars.com/api/?name=Ly+Trieu&background=0ea5e9&color=fff&size=128'
                            }}
                        />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Sổ Nợ Điện Tử
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Đăng nhập để quản lý công nợ
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu..."
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Hoặc
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Link
                                href="/login/forgot"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
