'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { CustomerBalance } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ReportData {
    summary: {
        total_customers: number
        customers_with_debt: number
        total_debt: number
        total_paid: number
        total_balance: number
    }
    list: CustomerBalance[]
}

export default function ReportsPage() {
    const [sortBy, setSortBy] = useState<'balance' | 'name'>('balance')
    const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
    const [exporting, setExporting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<ReportData | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/reports')
            const json = await res.json()
            if (json.success) {
                setData(json.data)
            }
        } catch (error) {
            console.error('Error fetching report data:', error)
        } finally {
            setLoading(false)
        }
    }

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

    const sortedCustomers = [...(data?.list || [])].sort((a, b) => {
        if (sortBy === 'balance') {
            return b.balance - a.balance // Descending balance
        }
        return a.name.localeCompare(b.name) // A-Z name
    })

    // Time filter logic
    const filteredCustomers = sortedCustomers.filter(customer => {
        if (timeFilter === 'all') return customer.balance > 0
        if (!customer.oldest_debt_date) return false

        const debtDate = new Date(customer.oldest_debt_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (timeFilter) {
            case 'today':
                const todayStart = new Date(today)
                return debtDate.toDateString() === todayStart.toDateString()
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                return debtDate >= weekAgo
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                return debtDate >= monthAgo
            default:
                return customer.balance > 0
        }
    })

    // Top 10 debtors for chart
    const topDebtors = sortedCustomers
        .filter(c => c.balance > 0)
        .slice(0, 10)
        .map(c => ({
            name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name,
            balance: c.balance
        }))

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    const calculateDebtAge = (oldestDate: string | null): number => {
        if (!oldestDate) return 0
        const today = new Date()
        const debtDate = new Date(oldestDate)
        return Math.floor((today.getTime() - debtDate.getTime()) / (1000 * 60 * 60 * 24))
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
                        disabled={exporting || loading}
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

                {/* Summary Cards + Bar Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Summary Cards - 2 columns */}
                    <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <p className="text-sm font-medium text-red-700">Tổng công nợ</p>
                            <p className="text-2xl font-bold text-red-900 mt-2">
                                {loading ? '...' : formatCurrency(data?.summary.total_balance || 0)}
                            </p>
                        </div>
                        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <p className="text-sm font-medium text-green-700">Đã thu</p>
                            <p className="text-2xl font-bold text-green-900 mt-2">
                                {loading ? '...' : formatCurrency(data?.summary.total_paid || 0)}
                            </p>
                        </div>
                        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                            <p className="text-sm font-medium text-orange-700">Tổng phát sinh</p>
                            <p className="text-2xl font-bold text-orange-900 mt-2">
                                {loading ? '...' : formatCurrency(data?.summary.total_debt || 0)}
                            </p>
                        </div>
                        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <p className="text-sm font-medium text-blue-700">Khách đang nợ</p>
                            <p className="text-2xl font-bold text-blue-900 mt-2">
                                {loading ? '...' : (data?.summary.customers_with_debt || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Bar Chart - 2 columns */}
                    <div className="lg:col-span-2 card">
                        <h2 className="text-xl font-semibold mb-4">📊 Top 10 Khách Hàng Nợ Nhiều Nhất</h2>
                        {loading ? (
                            <div className="h-80 flex items-center justify-center text-gray-500">
                                Đang tải dữ liệu...
                            </div>
                        ) : topDebtors.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={topDebtors}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        angle={-15}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="balance" fill="#dc2626" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <p className="text-lg">Chưa có dữ liệu công nợ</p>
                                    <p className="text-sm mt-1">Bắt đầu ghi nợ để xem biểu đồ</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
                            <select
                                className="input-field w-auto"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'balance' | 'name')}
                            >
                                <option value="balance">Số nợ giảm dần</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Thời gian:</label>
                            <select
                                className="input-field w-auto"
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value as any)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">Tuần này</option>
                                <option value="month">Tháng này</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-600">
                            Hiển thị: <span className="font-semibold">{filteredCustomers.length}</span> khách hàng
                        </div>
                    </div>
                </div>

                {/* Debt List */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Danh sách công nợ</h2>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header w-16">STT</th>
                                    <th className="table-header">Khách hàng</th>
                                    <th className="table-header">Số điện thoại</th>
                                    <th className="table-header text-right">Tổng phát sinh</th>
                                    <th className="table-header text-right">Đã trả</th>
                                    <th className="table-header text-right">Còn lại</th>
                                    <th className="table-header text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : sortedCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="table-cell text-center py-12 text-gray-500">
                                            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg">Chưa có dữ liệu công nợ</p>
                                            <p className="text-sm mt-1">Bắt đầu ghi nợ để xem báo cáo</p>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedCustomers.map((customer, index) => {
                                        const debtAge = calculateDebtAge(customer.oldest_debt_date || null)
                                        const isOldDebt = debtAge > 30 && customer.balance > 0

                                        return (
                                            <tr
                                                key={customer.id}
                                                className={`transition-colors ${isOldDebt
                                                    ? 'bg-red-50 border-l-4 border-red-500 hover:bg-red-100'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td className="table-cell text-center">{index + 1}</td>
                                                <td className={`table-cell font-medium ${isOldDebt ? 'text-gray-900 font-bold' : 'text-gray-900'
                                                    }`}>
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="hover:text-primary-600 hover:underline transition-colors"
                                                    >
                                                        {customer.name}
                                                    </Link>
                                                </td>
                                                <td className="table-cell text-gray-500">{customer.phone}</td>
                                                <td className="table-cell text-right text-gray-600">{formatCurrency(customer.total_debt)}</td>
                                                <td className="table-cell text-right text-green-600">{formatCurrency(customer.total_paid)}</td>
                                                <td className={`table-cell text-right font-bold ${isOldDebt ? 'text-red-700 font-extrabold' : 'text-red-600'
                                                    }`}>
                                                    {formatCurrency(customer.balance)}
                                                </td>
                                                <td className="table-cell text-center">
                                                    {customer.balance > 0 ? (
                                                        isOldDebt ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                                Quá hạn {debtAge} ngày
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Còn nợ
                                                            </span>
                                                        )
                                                    ) : customer.balance < 0 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            Dư {formatCurrency(Math.abs(customer.balance))}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Đã xong
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
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
