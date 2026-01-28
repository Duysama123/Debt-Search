'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Layout from '@/components/Layout'
import { formatCurrency, formatPhone, debounce } from '@/lib/utils'

interface Customer {
    id: string
    name: string
    phone: string
    notes: string
    total_debt: number
    total_paid: number
    balance: number
}

export default function CustomersPage() {
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteCustomer, setDeleteCustomer] = useState<{ id: string, name: string } | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        notes: ''
    })

    const fetchCustomers = async (search = '') => {
        setLoading(true)
        try {
            const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}&limit=50`)
            const data = await res.json()
            if (data.success) {
                setCustomers(data.data)
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchCustomers()
    }, [])

    // Debounced search
    useEffect(() => {
        const debouncedFetch = debounce(() => fetchCustomers(searchTerm), 300)
        debouncedFetch()
    }, [searchTerm])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name) {
            toast.error('Vui lòng nhập tên khách hàng')
            return
        }

        // Check for duplicate phone number
        if (formData.phone) {
            const existingCustomer = customers.find(c => c.phone === formData.phone)
            if (existingCustomer) {
                toast.error(`Số điện thoại này dùng cho: ${existingCustomer.name}`, {
                    style: {
                        background: '#FEF2F2', // red-50
                        color: '#991B1B',      // red-800
                        border: '1px solid #FCA5A5', // red-300
                        fontWeight: '500'
                    },
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#FFFAEE',
                    },
                })
                return
            }
        }

        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (data.success) {
                setShowForm(false)
                setFormData({ name: '', phone: '', notes: '' })
                fetchCustomers(searchTerm)
                toast.success('Thêm khách hàng thành công!')
            } else {
                toast.error(data.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error creating customer:', error)
            toast.error('Có lỗi xảy ra khi tạo khách hàng')
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deleteCustomer) return

        try {
            const res = await fetch(`/api/customers/${deleteCustomer.id}`, {
                method: 'DELETE'
            })
            const data = await res.json()

            if (data.success) {
                fetchCustomers(searchTerm)
                toast.success('Đã xóa khách hàng thành công!')
                setDeleteCustomer(null)
            } else {
                toast.error(data.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error deleting customer:', error)
            toast.error('Có lỗi xảy ra khi xóa khách hàng')
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
                        <p className="text-gray-600 mt-1">Danh sách khách hàng và thông tin công nợ</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                    >
                        + Thêm khách hàng
                    </button>
                </div>

                {/* Add Customer Form */}
                {showForm && (
                    <div className="card border-2 border-primary-100">
                        <h2 className="text-xl font-semibold mb-4 text-primary-800">Thêm khách hàng mới</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên khách hàng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên khách hàng"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="0912345678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú
                                </label>
                                <textarea
                                    className="input-field"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Ghi chú về khách hàng..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary">
                                    Lưu khách hàng
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn-secondary"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search */}
                <div className="card">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Customer List */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Danh sách khách hàng ({customers.length})</h2>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header">Tên khách hàng</th>
                                    <th className="table-header">Số điện thoại</th>
                                    <th className="table-header text-right">Tổng nợ</th>
                                    <th className="table-header text-right">Đã trả</th>
                                    <th className="table-header text-right">Còn lại</th>
                                    <th className="table-header text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="table-cell text-center py-8">
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : customers.length > 0 ? (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="table-cell font-medium text-gray-900">
                                                <Link
                                                    href={`/customers/${customer.id}`}
                                                    className="hover:text-primary-600 hover:underline transition-colors"
                                                >
                                                    {customer.name}
                                                </Link>
                                            </td>
                                            <td className="table-cell text-gray-600 font-mono">
                                                {customer.phone ? formatPhone(customer.phone) : '-'}
                                            </td>
                                            <td className="table-cell text-right text-red-600 font-medium">
                                                {formatCurrency(customer.total_debt)}
                                            </td>
                                            <td className="table-cell text-right text-green-600 font-medium">
                                                {formatCurrency(customer.total_paid)}
                                            </td>
                                            <td className={`table-cell text-right font-bold ${customer.balance > 0
                                                ? 'text-orange-600'
                                                : customer.balance < 0
                                                    ? 'text-purple-600'
                                                    : 'text-gray-900'
                                                }`}>
                                                {customer.balance < 0 ? `+${formatCurrency(Math.abs(customer.balance))}` : formatCurrency(customer.balance)}
                                            </td>
                                            <td className="table-cell text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="text-primary-600 hover:text-primary-700 font-medium p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        Chi tiết
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteCustomer({ id: customer.id, name: customer.name })}
                                                        className="text-red-500 hover:text-red-700 font-medium p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa khách hàng"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-xl">Không tìm thấy khách hàng</p>
                                            <p className="text-sm mt-2">Thử tìm kiếm từ khóa khác hoặc thêm mới</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteCustomer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in px-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                            <div className="px-6 py-4 bg-red-600 text-white">
                                <h3 className="text-xl font-bold">⚠️ Xác nhận xóa khách hàng</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 text-lg font-medium mb-2">
                                    Bạn có chắc chắn muốn xóa khách hàng <span className="text-red-600 font-bold">"{deleteCustomer.name}"</span>?
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                    <p className="text-sm text-yellow-800 flex gap-2">
                                        <span className="text-lg">⚠️</span>
                                        <span><strong>Cảnh báo:</strong> Mọi giao dịch liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục!</span>
                                    </p>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => setDeleteCustomer(null)}
                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold shadow-md hover:bg-red-700 transition-transform active:scale-95"
                                >
                                    Xác nhận Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}
