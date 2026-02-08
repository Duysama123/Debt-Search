'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Layout from '@/components/Layout'
import ConfirmationModal from '@/components/ConfirmationModal'
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

    // Quick Create State
    const [isCreating, setIsCreating] = useState(false)
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', notes: '' })
    const [createLoading, setCreateLoading] = useState(false)

    // Modal State
    const [showConfirm, setShowConfirm] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

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
        if (!selectedCustomer && !isCreating) {
            const debouncedSearch = debounce(() => searchCustomers(searchTerm), 300)
            debouncedSearch()
        }
    }, [searchTerm, selectedCustomer, isCreating])

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
        setIsCreating(false)
    }

    const startCreating = () => {
        setIsCreating(true)
        setNewCustomer({ name: searchTerm, phone: '', notes: '' })
        setShowResults(false)
    }

    const cancelCreating = () => {
        setIsCreating(false)
        setShowResults(true)
    }

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateLoading(true)
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer)
            })
            const data = await res.json()
            if (data.success) {
                handleSelectCustomer(data.data)
                setNewCustomer({ name: '', phone: '', notes: '' })
                toast.success('Đã tạo khách hàng thành công!')
            } else {
                toast.error(data.error || 'Có lỗi xảy ra khi tạo khách hàng')
            }
        } catch (error) {
            console.error('Error creating customer:', error)
            toast.error('Lỗi kết nối mạng')
        } finally {
            setCreateLoading(false)
        }
    }

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCustomer) {
            toast.error('Vui lòng chọn khách hàng')
            return
        }

        const amount = parseFloat(formData.amount)
        if (!amount || amount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ')
            return
        }

        setShowConfirm(true)
    }

    const handleConfirmSubmit = async () => {
        if (!selectedCustomer) return

        setLoading(true)
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: selectedCustomer.id,
                    type: 'debt',
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    transaction_date: formData.transaction_date
                })
            })
            const data = await res.json()

            if (data.success) {
                toast.success('Ghi nợ thành công!')
                setFormData({
                    amount: '',
                    description: '',
                    transaction_date: new Date().toISOString().split('T')[0]
                })
                setSelectedCustomer(null)
                setSearchTerm('')
                setShowConfirm(false)
                fetchRecentDebts()
            } else {
                toast.error(data.error || 'Có lỗi xảy ra')
                setShowConfirm(false)
            }
        } catch (error) {
            console.error('Error creating debt:', error)
            toast.error('Lỗi kết nối mạng')
        } finally {
            setLoading(false)
        }
    }


    const handleDeleteDebt = async () => {
        if (!deleteId) return

        try {
            const res = await fetch(`/api/transactions?id=${deleteId}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Đã xóa giao dịch thành công!')
                fetchRecentDebts()
                setDeleteId(null)
            } else {
                toast.error(data.error || 'Có lỗi xảy ra khi xóa')
            }
        } catch (error) {
            console.error('Error deleting debt:', error)
            toast.error('Lỗi kết nối mạng')
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
                    <form onSubmit={handlePreSubmit} className="space-y-6">
                        <div ref={searchRef} className="relative">
                            <label className="block text-lg font-bold text-gray-700 mb-2">
                                Khách hàng <span className="text-red-500">*</span>
                            </label>

                            {!isCreating ? (
                                <>
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
                                    {showResults && searchTerm.length >= 2 && (
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
                                            <div
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-t border-gray-200 text-blue-600 font-bold flex items-center gap-2"
                                                onClick={startCreating}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Thêm khách hàng mới: "{searchTerm}"
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-fade-in-down">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-blue-900">Thêm khách hàng mới</h3>
                                        <button type="button" onClick={cancelCreating} className="text-gray-500 hover:text-gray-700">✕ Hủy</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                                            <input
                                                type="text"
                                                required
                                                className="input-field py-2"
                                                value={newCustomer.name}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                className="input-field py-2"
                                                value={newCustomer.phone}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCreateCustomer}
                                            disabled={createLoading || !newCustomer.name}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                                        >
                                            {createLoading ? 'Đang tạo...' : 'Tạo & Chọn'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedCustomer && !isCreating && (
                                <div className="mt-3 bg-green-50 p-4 rounded-lg flex items-center justify-between border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{selectedCustomer.name}</p>
                                            <p className="text-gray-600">{selectedCustomer.phone}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCustomer(null)
                                            setSearchTerm('')
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-2">
                                Số tiền nợ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1"
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
                                disabled={loading || !selectedCustomer}
                                className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang xử lý...' : 'Ghi Nợ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, amount: '', description: '' })
                                    setSelectedCustomer(null)
                                    setSearchTerm('')
                                    setIsCreating(false)
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
                                    <th className="table-header w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDebts.length > 0 ? (
                                    recentDebts.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50 group">
                                            <td className="table-cell">{formatDate(txn.transaction_date)}</td>
                                            <td className="table-cell font-medium">
                                                {txn.customer?.name}
                                                <div className="text-sm text-gray-500">{txn.customer?.phone}</div>
                                            </td>
                                            <td className="table-cell">{txn.description || '-'}</td>
                                            <td className="table-cell text-right text-red-600 font-bold text-xl">
                                                {formatCurrency(txn.amount)}
                                            </td>
                                            <td className="table-cell text-right">
                                                <button
                                                    onClick={() => setDeleteId(txn.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity p-2"
                                                    title="Xóa khoản nợ này"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="table-cell text-center py-8 text-gray-500">
                                            Chưa có khoản nợ nào gần đây
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmSubmit}
                loading={loading}
                title="Xác nhận Ghi Nợ"
                data={{
                    customerName: selectedCustomer?.name || '',
                    amount: parseFloat(formData.amount) || 0,
                    date: formData.transaction_date,
                    description: formData.description,
                    type: 'debt'
                }}
            />

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 bg-red-600 text-white">
                            <h3 className="text-xl font-bold">⚠️ Xác nhận xóa</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">
                                Bạn có chắc chắn muốn xóa giao dịch này không?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Hành động này sẽ ẩn giao dịch khỏi danh sách và cập nhật lại số dư.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleDeleteDebt}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold shadow-md hover:bg-red-700 transition-transform active:scale-95"
                            >
                                Xác nhận Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}
