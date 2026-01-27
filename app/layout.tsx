import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
    title: 'Sổ Nợ Điện Tử',
    description: 'Hệ thống quản lý công nợ cho hộ kinh doanh',
    manifest: '/manifest.json',
    themeColor: '#0284c7',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
