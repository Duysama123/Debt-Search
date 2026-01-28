import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { password } = body

        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

        if (password === adminPassword) {
            // Set auth cookie
            cookies().set('auth_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json(
            { success: false, error: 'Mật khẩu không đúng' },
            { status: 401 }
        )
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        )
    }
}
