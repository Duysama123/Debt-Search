import { NextRequest, NextResponse } from 'next/server'
import { getDebtSummary, getCustomersWithBalance } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const searchParams = url.searchParams
        const search = searchParams.get('search') || ''

        // Parallel fetch for summary and list
        const [summary, list] = await Promise.all([
            getDebtSummary(),
            getCustomersWithBalance(search, 1, 1000) // Fetch top 1000 for display
        ])

        return NextResponse.json({
            success: true,
            data: {
                summary,
                list
            }
        })
    } catch (error: any) {
        console.error('Error fetching report data:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
