'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Layout from '@/components/Layout'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Customer {
    id: string
    name: string
    phone: string | null
    notes: string | null
    total_debt: number
    total_paid: number
    balance: number
}

interface Transaction {
    id: string
    type: 'debt' | 'payment'
    amount: number
    description: string | null
    transaction_date: string
    created_at: string
}

export default function CustomerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const customerId = params.id as string

    const [customer, setCustomer] = useState<Customer | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

    const handleUpdateTransaction = async () => {
        if (!editingTransaction) return

        try {
            const res = await fetch('/api/transactions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTransaction)
            })
            const data = await res.json()

            if (data.success) {
                toast.success('Đã cập nhật giao dịch!')
                setEditingTransaction(null)
                fetchData() // Refresh data
            } else {
                toast.error(data.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error updating transaction:', error)
            toast.error('Có lỗi xảy ra khi cập nhật giao dịch')
        }
    }

    useEffect(() => {
        fetchData()
    }, [customerId])

    const fetchData = async () => {
        try {
            // Fetch customer info
            const customerRes = await fetch(`/api/customers/${customerId}`)
            const customerData = await customerRes.json()

            // Fetch transactions - use customer_id (with underscore) to match API
            const txnRes = await fetch(`/api/transactions?customer_id=${customerId}&limit=100`)
            const txnData = await txnRes.json()

            if (customerData.success) {
                setCustomer(customerData.data)
            }
            if (txnData.success && txnData.data) {
                setTransactions(txnData.data)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!customer) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600">Không tìm thấy khách hàng</p>
                    <button onClick={() => router.push('/customers')} className="btn-primary mt-4">
                        Quay lại danh sách
                    </button>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                        <p className="text-gray-600 mt-1">Chi tiết khách hàng và lịch sử giao dịch</p>
                    </div>
                </div>

                {/* Customer Info + Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Customer Info */}
                    <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Thông tin khách hàng</p>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-gray-500">Số điện thoại</p>
                                <p className="text-base font-mono font-semibold text-gray-900">
                                    {customer.phone || 'Chưa có'}
                                </p>
                            </div>
                            {customer.notes && (
                                <div className="pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Ghi chú</p>
                                    <p className="text-sm text-gray-700 mt-1">{customer.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Balance Cards */}
                    <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <p className="text-sm font-medium text-red-700">Tổng nợ</p>
                        <p className="text-2xl font-bold text-red-900 mt-2">
                            {formatCurrency(customer.total_debt)}
                        </p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <p className="text-sm font-medium text-green-700">Đã trả</p>
                        <p className="text-2xl font-bold text-green-900 mt-2">
                            {formatCurrency(customer.total_paid)}
                        </p>
                    </div>
                    <div className={`card bg-gradient-to-br ${customer.balance > 0
                        ? 'from-orange-50 to-orange-100 border-orange-200'
                        : customer.balance < 0
                            ? 'from-purple-50 to-purple-100 border-purple-200'
                            : 'from-blue-50 to-blue-100 border-blue-200'
                        }`}>
                        <p className={`text-sm font-medium ${customer.balance > 0
                            ? 'text-orange-700'
                            : customer.balance < 0
                                ? 'text-purple-700'
                                : 'text-blue-700'
                            }`}>
                            {customer.balance < 0 ? 'Khách trả thừa' : 'Còn lại'}
                        </p>
                        <p className={`text-2xl font-bold mt-2 ${customer.balance > 0
                            ? 'text-orange-900'
                            : customer.balance < 0
                                ? 'text-purple-900'
                                : 'text-blue-900'
                            }`}>
                            {customer.balance < 0 ? `+${formatCurrency(Math.abs(customer.balance))}` : formatCurrency(customer.balance)}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push(`/debt?customer=${customerId}`)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Ghi nợ
                        </button>
                        <button
                            onClick={() => router.push(`/payment?customer=${customerId}`)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Thanh toán
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">📜 Lịch sử giao dịch ({transactions?.length || 0})</h2>

                    {!transactions || transactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg">Chưa có giao dịch nào</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((txn) => (
                                <div
                                    key={txn.id}
                                    className={`flex items-start gap-4 p-4 rounded-lg border-l-4 transition-colors hover:bg-gray-50 ${txn.type === 'debt'
                                        ? 'border-red-500 bg-red-50/50'
                                        : 'border-green-500 bg-green-50/50'
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'debt' ? 'bg-red-100' : 'bg-green-100'
                                        }`}>
                                        {txn.type === 'debt' ? (
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`font-semibold ${txn.type === 'debt' ? 'text-red-700' : 'text-green-700'
                                                }`}>
                                                {txn.type === 'debt' ? 'Ghi nợ' : 'Thanh toán'}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <p className={`text-lg font-bold ${txn.type === 'debt' ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {txn.type === 'debt' ? '+' : '-'}{formatCurrency(txn.amount)}
                                                </p>
                                                <button
                                                    onClick={() => setEditingTransaction(txn)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Sửa giao dịch"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formatDate(txn.transaction_date)}
                                        </p>
                                        {txn.description && (
                                            <p className="text-sm text-gray-700 mt-2 bg-white px-3 py-2 rounded border border-gray-200">
                                                {txn.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Transaction Modal */}
                {editingTransaction && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Sửa giao dịch</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={editingTransaction.amount}
                                        onChange={(e) => setEditingTransaction({
                                            ...editingTransaction,
                                            amount: parseFloat(e.target.value) || 0
                                        })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giao dịch</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={editingTransaction.transaction_date.split('T')[0]}
                                        onChange={(e) => setEditingTransaction({
                                            ...editingTransaction,
                                            transaction_date: e.target.value
                                        })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        value={editingTransaction.description || ''}
                                        onChange={(e) => setEditingTransaction({
                                            ...editingTransaction,
                                            description: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditingTransaction(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleUpdateTransaction}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}
