import { NextRequest, NextResponse } from 'next/server'
import { getCustomerById, getCustomerBalance, updateCustomer, deleteCustomer } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customer = await getCustomerBalance(params.id)

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy khách hàng' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: customer
        })
    } catch (error: any) {
        console.error('Error fetching customer:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { name, phone, notes } = body

        if (!name || name.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Tên khách hàng không được để trống' },
                { status: 400 }
            )
        }

        const customer = await updateCustomer(params.id, {
            name: name.trim(),
            phone: phone?.trim() || null,
            notes: notes?.trim() || null
        })

        return NextResponse.json({
            success: true,
            data: customer
        })
    } catch (error: any) {
        console.error('Error updating customer:', error)

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await deleteCustomer(params.id)

        return NextResponse.json({
            success: true,
            message: 'Đã xóa khách hàng'
        })
    } catch (error: any) {
        console.error('Error deleting customer:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
