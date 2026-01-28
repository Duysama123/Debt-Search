import { NextRequest, NextResponse } from 'next/server'
import { getCustomersWithBalance, createCustomer } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const searchParams = url.searchParams
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        const customers = await getCustomersWithBalance(search, page, limit)

        return NextResponse.json({
            success: true,
            data: customers
        })
    } catch (error: any) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, phone, notes } = body

        if (!name || name.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Tên khách hàng không được để trống' },
                { status: 400 }
            )
        }

        const customer = await createCustomer({
            name: name.trim(),
            phone: phone?.trim() || null,
            notes: notes?.trim() || null
        })

        return NextResponse.json({
            success: true,
            data: customer
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating customer:', error)

        // Handle unique constraint violation (duplicate phone)
        if (error.code === '23505') {
            return NextResponse.json(
                { success: false, error: 'Số điện thoại đã tồn tại' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
