import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const viewport: Viewport = {
    themeColor: '#0284c7',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export const metadata: Metadata = {
    title: 'Shop Lý Triệu - Quản lý công nợ',
    description: 'Hệ thống quản lý công nợ cho Shop Lý Triệu',
    manifest: '/manifest.json',
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
