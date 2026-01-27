'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'

export default function ReportsPage() {
    const [sortBy, setSortBy] = useState<'balance' | 'name'>('balance')
    const [exporting, setExporting] = useState(false)

    const handleExport = async () => {
        try {
            setExporting(true)
            const res = await fetch('/api/export')

            if (!res.ok) throw new Error('Export failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cong-no-${new Date().toISOString().split('T')[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Error exporting:', error)
            alert('Lỗi khi xuất file Excel')
        } finally {
            setExporting(false)
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Báo cáo công nợ</h1>
                        <p className="text-gray-600 mt-1">Tổng hợp và xuất báo cáo công nợ</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exporting ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Đang xuất...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Xuất Excel
                            </>
                        )}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <p className="text-sm font-medium text-red-700">Tổng công nợ</p>
                        <p className="text-3xl font-bold text-red-900 mt-2">0 ₫</p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <p className="text-sm font-medium text-green-700">Đã thu</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">0 ₫</p>
                    </div>
                    <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <p className="text-sm font-medium text-orange-700">Còn lại</p>
                        <p className="text-3xl font-bold text-orange-900 mt-2">0 ₫</p>
                    </div>
                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <p className="text-sm font-medium text-blue-700">Khách đang nợ</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">0</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
                        <select
                            className="input-field w-auto"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'balance' | 'name')}
                        >
                            <option value="balance">Số nợ cao nhất</option>
                            <option value="name">Tên A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Debt List */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Danh sách công nợ</h2>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header">STT</th>
                                    <th className="table-header">Khách hàng</th>
                                    <th className="table-header">Số điện thoại</th>
                                    <th className="table-header text-right">Tổng nợ</th>
                                    <th className="table-header text-right">Đã trả</th>
                                    <th className="table-header text-right">Còn lại</th>
                                    <th className="table-header text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={7} className="table-cell text-center py-12 text-gray-500">
                                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg">Chưa có dữ liệu công nợ</p>
                                        <p className="text-sm mt-1">Bắt đầu ghi nợ để xem báo cáo</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Export Info */}
                <div className="card bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Về tính năng xuất Excel</h3>
                            <p className="text-sm text-blue-800">
                                File Excel sẽ bao gồm: Danh sách khách hàng, tổng nợ, đã trả, còn lại, và ghi chú.
                                Bạn có thể lưu file làm bản backup hoặc in ra giấy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
