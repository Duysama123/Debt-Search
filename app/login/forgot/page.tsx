'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const [recoveryCode, setRecoveryCode] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/recovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: recoveryCode })
            })
            const data = await res.json()

            if (data.success) {
                toast.success('Xác thực thành công! Đang đăng nhập...')
                router.push('/')
                router.refresh()
            } else {
                toast.error(data.error || 'Mã khôi phục không đúng')
            }
        } catch (error) {
            console.error('Recovery error:', error)
            toast.error('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Khôi phục truy cập
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Nhập mã khôi phục bí mật (Recovery Code)
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleRecovery}>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Mã khôi phục
                            </label>
                            <div className="mt-1">
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    autoComplete="off"
                                    required
                                    className="input-field"
                                    value={recoveryCode}
                                    onChange={(e) => setRecoveryCode(e.target.value)}
                                    placeholder="Nhập mã bí mật..."
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {loading ? 'Đang xác thực...' : 'Truy cập ngay'}
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
                                href="/login"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
