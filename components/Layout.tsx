'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    UsersIcon,
    DocumentTextIcon,
    CreditCardIcon,
    MagnifyingGlassIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Tổng quan', href: '/', icon: HomeIcon },
    { name: 'Khách hàng', href: '/customers', icon: UsersIcon },
    { name: 'Ghi nợ', href: '/debt', icon: DocumentTextIcon },
    { name: 'Thanh toán', href: '/payment', icon: CreditCardIcon },
    { name: 'Báo cáo', href: '/reports', icon: ChartBarIcon },
]

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-gray-200 flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-3 relative rounded-full overflow-hidden border-4 border-primary-100 shadow-sm">
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
                    <h1 className="text-xl font-bold text-gray-900">Shop Lý Triệu</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý bán hàng & công nợ</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-4 py-4 rounded-lg font-bold transition-colors text-lg
                  ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                `}
                            >
                                <item.icon className="w-6 h-6" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' })
                            window.location.reload()
                        }}
                        className="flex items-center gap-3 px-4 py-2 w-full text-left font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Đăng xuất</span>
                    </button>
                    <p className="text-sm text-gray-500 text-center mt-4">
                        © 2026 Hệ thống tra cứu nợ
                    </p>
                </div>
            </aside>


            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
