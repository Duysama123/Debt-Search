'use client'

import { useState, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import { formatCurrency, formatDate, debounce } from '@/lib/utils'

interface CustomerBalance {
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

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('')
    const [customers, setCustomers] = useState<CustomerBalance[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerBalance | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Auto-focus search on load
    useEffect(() => {
        searchInputRef.current?.focus()
    }, [])

    // Debounced search
    useEffect(() => {
        if (searchTerm.length >= 2) {
            const debouncedSearch = debounce(() => searchCustomers(), 300)
            debouncedSearch()
        } else {
            setCustomers([])
            setSelectedCustomer(null)
        }
    }, [searchTerm])

    const searchCustomers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}&limit=10`)
            const data = await res.json()
            if (data.success) {
                setCustomers(data.data)
                // Auto-select if only 1 result
                if (data.data.length === 1) {
                    selectCustomer(data.data[0])
                }
            }
        } catch (error) {
            console.error('Error searching:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectCustomer = async (customer: CustomerBalance) => {
        setSelectedCustomer(customer)
        // Fetch transactions
        try {
            const res = await fetch(`/api/transactions?customer_id=${customer.id}&limit=20`)
            const data = await res.json()
            if (data.success) {
                setTransactions(data.data)
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && customers.length > 0 && !selectedCustomer) {
            selectCustomer(customers[0])
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Quick Search - Hero Section */}
                <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tra cứu nhanh</h1>
                        <p className="text-lg text-gray-600">Gõ tên hoặc số điện thoại khách hàng</p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="w-full px-6 py-5 text-2xl border-2 border-primary-300 rounded-xl focus:ring-4 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                placeholder="Nhập tên hoặc SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoComplete="off"
                            />
                            <svg className="w-8 h-8 text-primary-400 absolute right-6 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Quick Results Dropdown */}
                        {searchTerm.length >= 2 && customers.length > 0 && !selectedCustomer && (
                            <div className="mt-4 bg-white border-2 border-primary-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                                {customers.map((customer) => (
                                    <button
                                        key={customer.id}
                                        onClick={() => selectCustomer(customer)}
                                        className="w-full px-6 py-4 text-left hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xl font-semibold text-gray-900">{customer.name}</p>
                                                <p className="text-base text-gray-600">{customer.phone || 'Không có SĐT'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Còn nợ</p>
                                                <p className={`text-2xl font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(customer.balance)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchTerm.length >= 2 && customers.length === 0 && !loading && (
                            <div className="mt-4 text-center py-8 text-gray-500">
                                <p className="text-lg">Không tìm thấy khách hàng</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Customer Detail */}
                {selectedCustomer && (
                    <>
                        <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                                    <p className="text-xl text-gray-600 mt-1">📞 {selectedCustomer.phone || 'Không có SĐT'}</p>
                                    {selectedCustomer.notes && (
                                        <p className="text-base text-gray-500 mt-2">💬 {selectedCustomer.notes}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCustomer(null)
                                        setTransactions([])
                                        setSearchTerm('')
                                        searchInputRef.current?.focus()
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-lg"
                                >
                                    ✕ Đóng
                                </button>
                            </div>

                            {/* Balance Cards - LARGE */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                                    <p className="text-base font-medium text-red-700 mb-2">Tổng nợ</p>
                                    <p className="text-4xl font-bold text-red-900">{formatCurrency(selectedCustomer.total_debt)}</p>
                                </div>
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                                    <p className="text-base font-medium text-green-700 mb-2">Đã trả</p>
                                    <p className="text-4xl font-bold text-green-900">{formatCurrency(selectedCustomer.total_paid)}</p>
                                </div>
                                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center">
                                    <p className="text-base font-medium text-orange-700 mb-2">Còn lại</p>
                                    <p className="text-4xl font-bold text-orange-900">{formatCurrency(selectedCustomer.balance)}</p>
                                </div>
                            </div>

                            {/* Quick Actions - LARGE BUTTONS */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <a
                                    href={`/debt?customer=${selectedCustomer.id}`}
                                    className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-6 rounded-xl transition-colors text-xl"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Ghi nợ
                                </a>
                                <a
                                    href={`/payment?customer=${selectedCustomer.id}`}
                                    className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-6 rounded-xl transition-colors text-xl"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Thanh toán
                                </a>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="card">
                            <h3 className="text-2xl font-bold mb-4">Lịch sử giao dịch</h3>
                            <div className="space-y-3">
                                {transactions.length > 0 ? (
                                    transactions.map((txn) => (
                                        <div
                                            key={txn.id}
                                            className={`flex items-center justify-between p-4 rounded-lg border-2 ${txn.type === 'debt'
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-green-50 border-green-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${txn.type === 'debt' ? 'bg-red-200' : 'bg-green-200'
                                                    }`}>
                                                    {txn.type === 'debt' ? '📝' : '💰'}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {txn.type === 'debt' ? 'Ghi nợ' : 'Thanh toán'}
                                                    </p>
                                                    <p className="text-base text-gray-600">{formatDate(txn.transaction_date)}</p>
                                                    {txn.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{txn.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={`text-2xl font-bold ${txn.type === 'debt' ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {txn.type === 'debt' ? '+' : '-'}{formatCurrency(txn.amount)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-8 text-gray-500 text-lg">Chưa có giao dịch</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Help Text */}
                {!selectedCustomer && (
                    <div className="card bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2 text-lg">💡 Mẹo tra cứu nhanh</h3>
                                <ul className="text-base text-blue-800 space-y-1">
                                    <li>• Gõ <strong>số điện thoại</strong> để tìm chính xác nhất</li>
                                    <li>• Gõ <strong>tên</strong> (ít nhất 2 ký tự) để tìm theo tên</li>
                                    <li>• Nhấn <strong>Enter</strong> để chọn kết quả đầu tiên</li>
                                    <li>• Kết quả hiển thị ngay khi gõ (không cần click Tìm)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}
