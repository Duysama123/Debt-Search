'use client'

import { useState, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import { formatCurrency, formatDate, debounce } from '@/lib/utils'

interface Customer {
    id: string
    name: string
    phone: string
}

interface Transaction {
    id: string
    customer: {
        name: string
        phone: string | null
    }
    amount: number
    description: string | null
    transaction_date: string
}

export default function DebtPage() {
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [showResults, setShowResults] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [recentDebts, setRecentDebts] = useState<Transaction[]>([])

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
    })

    const searchRef = useRef<HTMLDivElement>(null)

    // Close search results when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const searchCustomers = async (term: string) => {
        if (term.length < 2) {
            setCustomers([])
            return
        }
        try {
            const res = await fetch(`/api/customers?search=${encodeURIComponent(term)}&limit=5`)
            const data = await res.json()
            if (data.success) {
                setCustomers(data.data)
                setShowResults(true)
            }
        } catch (error) {
            console.error('Error searching customers:', error)
        }
    }

    // Debounced search
    useEffect(() => {
        const debouncedSearch = debounce(() => searchCustomers(searchTerm), 300)
        debouncedSearch()
    }, [searchTerm])

    const fetchRecentDebts = async () => {
        try {
            const res = await fetch('/api/transactions?limit=10')
            const data = await res.json()
            if (data.success) {
                // Filter only debts locally or update API to support type filter
                // Ideally API should support type filter, but for now we filter here if mixed
                const debts = data.data.filter((t: any) => t.type === 'debt')
                setRecentDebts(debts)
            }
        } catch (error) {
            console.error('Error fetching recent debts:', error)
        }
    }

    useEffect(() => {
        fetchRecentDebts()
    }, [])

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer)
        setSearchTerm(customer.name)
        setShowResults(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCustomer) {
            alert('Vui lòng chọn khách hàng')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: selectedCustomer.id,
                    type: 'debt',
                    amount: formData.amount,
                    description: formData.description,
                    transaction_date: formData.transaction_date
                })
            })
            const data = await res.json()

            if (data.success) {
                alert('Ghi nợ thành công!')
                setFormData({
                    amount: '',
                    description: '',
                    transaction_date: new Date().toISOString().split('T')[0]
                })
                setSelectedCustomer(null)
                setSearchTerm('')
                fetchRecentDebts()
            } else {
                alert(data.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error creating debt:', error)
            alert('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ghi nợ</h1>
                    <p className="text-gray-600 mt-1 text-lg">Ghi nhận khoản nợ mới của khách hàng</p>
                </div>

                <div className="card max-w-3xl border-2 border-red-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div ref={searchRef} className="relative">
                            <label className="block text-lg font-bold text-gray-700 mb-2">
                                Khách hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Nhập tên hoặc số điện thoại..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    if (!e.target.value) setSelectedCustomer(null)
                                }}
                                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                            />
                            {showResults && customers.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {customers.map((customer) => (
                                        <div
                                            key={customer.id}
                                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                            onClick={() => handleSelectCustomer(customer)}
                                        >
                                            <p className="font-bold text-gray-900">{customer.name}</p>
                                            <p className="text-sm text-gray-600">{customer.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedCustomer && (
                            <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3 border border-green-200">
                                <span className="text-green-600 text-xl font-bold">✓</span>
                                <div>
                                    <p className="font-bold text-gray-900">{selectedCustomer.name}</p>
                                    <p className="text-gray-600">{selectedCustomer.phone}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-2">
                                Số tiền nợ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1000"
                                    step="1000"
                                    className="input-field pr-12 text-2xl font-bold text-red-600"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">
                                    ₫
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-2">
                                Ngày ghi nợ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                className="input-field"
                                value={formData.transaction_date}
                                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-2">
                                Nội dung
                            </label>
                            <textarea
                                className="input-field"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Mua hàng, dịch vụ..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-danger flex-1"
                            >
                                {loading ? 'Đang xử lý...' : 'Ghi Nợ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, amount: '', description: '' })
                                    setSelectedCustomer(null)
                                    setSearchTerm('')
                                }}
                                className="btn-secondary"
                            >
                                Làm mới
                            </button>
                        </div>
                    </form>
                </div>

                {/* Recent Debts */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Các khoản nợ gần đây</h2>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header">Ngày</th>
                                    <th className="table-header">Khách hàng</th>
                                    <th className="table-header">Nội dung</th>
                                    <th className="table-header text-right">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDebts.length > 0 ? (
                                    recentDebts.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50">
                                            <td className="table-cell">{formatDate(txn.transaction_date)}</td>
                                            <td className="table-cell font-medium">
                                                {txn.customer?.name}
                                                <div className="text-sm text-gray-500">{txn.customer?.phone}</div>
                                            </td>
                                            <td className="table-cell">{txn.description || '-'}</td>
                                            <td className="table-cell text-right text-red-600 font-bold text-xl">
                                                {formatCurrency(txn.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="table-cell text-center py-8 text-gray-500">
                                            Chưa có khoản nợ nào gần đây
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
