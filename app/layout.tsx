import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
    title: 'Shop Lý Triệu - Quản lý công nợ',
    description: 'Hệ thống quản lý công nợ cho Shop Lý Triệu',
    manifest: '/manifest.json',
    themeColor: '#0284c7',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <Toaster position="top-right" />
                {children}
            </body>
        </html>
    )
}
