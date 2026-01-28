import { NextRequest, NextResponse } from 'next/server'
import { getTransactions, createTransaction, softDeleteTransaction, updateTransaction } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const customerId = searchParams.get('customer_id')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        const { transactions, total } = await getTransactions(
            customerId || undefined,
            page,
            limit
        )

        return NextResponse.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                total
            }
        })
    } catch (error: any) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { customer_id, type, amount, description, transaction_date } = body

        // Validation
        if (!customer_id) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng chọn khách hàng' },
                { status: 400 }
            )
        }

        if (!type || !['debt', 'payment'].includes(type)) {
            return NextResponse.json(
                { success: false, error: 'Loại giao dịch không hợp lệ' },
                { status: 400 }
            )
        }

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Số tiền phải lớn hơn 0' },
                { status: 400 }
            )
        }

        const transaction = await createTransaction({
            customer_id,
            type,
            amount: parseFloat(amount),
            description: description?.trim() || null,
            transaction_date: transaction_date || new Date().toISOString().split('T')[0]
        })

        return NextResponse.json({
            success: true,
            data: transaction
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating transaction:', error)

        // Handle foreign key violation
        if (error.code === '23503') {
            return NextResponse.json(
                { success: false, error: 'Khách hàng không tồn tại' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing transaction ID' },
                { status: 400 }
            )
        }

        const transaction = await updateTransaction(id, updates)

        return NextResponse.json({
            success: true,
            data: transaction
        })
    } catch (error: any) {
        console.error('Error updating transaction:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing transaction ID' },
                { status: 400 }
            )
        }

        await softDeleteTransaction(id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting transaction:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
