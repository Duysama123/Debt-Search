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
    { name: 'Tra cứu', href: '/lookup', icon: MagnifyingGlassIcon },
    { name: 'Báo cáo', href: '/reports', icon: ChartBarIcon },
]

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-primary-600">Sổ Nợ Điện Tử</h1>
                    <p className="text-base text-gray-500 mt-1">Quản lý công nợ</p>
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
                    <p className="text-sm text-gray-500 text-center">
                        © 2026 Hệ thống tra cứu nợ
                    </p>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
