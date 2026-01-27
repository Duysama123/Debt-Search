import { NextRequest, NextResponse } from 'next/server'
import { getDebtSummary } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const summary = await getDebtSummary()

        return NextResponse.json({
            success: true,
            data: summary
        })
    } catch (error: any) {
        console.error('Error fetching summary:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
