import { NextRequest, NextResponse } from 'next/server'
import { getCustomersWithBalance } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
    try {
        // Get all customers with balance (no pagination for export)
        const customers = await getCustomersWithBalance('', 1, 10000)

        // Prepare data for Excel
        const excelData = customers.map((customer, index) => ({
            'STT': index + 1,
            'Tên khách hàng': customer.name,
            'Số điện thoại': customer.phone || '',
            'Tổng nợ': customer.total_debt,
            'Đã trả': customer.total_paid,
            'Còn lại': customer.balance,
            'Ghi chú': customer.notes || ''
        }))

        // Create workbook
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(excelData)

        // Set column widths
        worksheet['!cols'] = [
            { wch: 5 },  // STT
            { wch: 25 }, // Tên
            { wch: 15 }, // SĐT
            { wch: 15 }, // Tổng nợ
            { wch: 15 }, // Đã trả
            { wch: 15 }, // Còn lại
            { wch: 30 }  // Ghi chú
        ]

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Công nợ')

        // Generate buffer
        const excelBuffer = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx'
        })

        // Return file
        const filename = `cong-no-${new Date().toISOString().split('T')[0]}.xlsx`

        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })
    } catch (error: any) {
        console.error('Error exporting to Excel:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
