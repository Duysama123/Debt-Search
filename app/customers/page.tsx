'use client'

import { useState, useEffect } from 'react'
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
                fetchCustomers(searchTerm) // Reload list
                alert('Thêm khách hàng thành công!')
            } else {
                alert(data.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error creating customer:', error)
            alert('Có lỗi xảy ra khi tạo khách hàng')
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?
Mọi giao dịch liên quan sẽ bị xóa vĩnh viễn.`)) {
            return
        }

        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: 'DELETE'
            })
            const data = await res.json()

            if (data.success) {
                fetchCustomers(searchTerm)
                alert('Đã xóa khách hàng')
            } else {
                alert(data.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error deleting customer:', error)
            alert('Có lỗi xảy ra khi xóa khách hàng')
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
                                            <td className="table-cell font-medium text-gray-900">{customer.name}</td>
                                            <td className="table-cell text-gray-600 font-mono">
                                                {customer.phone ? formatPhone(customer.phone) : '-'}
                                            </td>
                                            <td className="table-cell text-right text-red-600 font-medium">
                                                {formatCurrency(customer.total_debt)}
                                            </td>
                                            <td className="table-cell text-right text-green-600 font-medium">
                                                {formatCurrency(customer.total_paid)}
                                            </td>
                                            <td className={`table-cell text-right font-bold ${customer.balance > 0 ? 'text-orange-600' : 'text-gray-900'
                                                }`}>
                                                {formatCurrency(customer.balance)}
                                            </td>
                                            <td className="table-cell text-center">
                                                <button
                                                    onClick={() => handleDelete(customer.id, customer.name)}
                                                    className="text-red-500 hover:text-red-700 font-medium p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa khách hàng"
                                                >
                                                    Xóa
                                                </button>
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
            </div>
        </Layout>
    )
}
