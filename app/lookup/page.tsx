'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'

export default function LookupPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tra cứu công nợ</h1>
                    <p className="text-gray-600 mt-1">Tìm kiếm và xem chi tiết công nợ khách hàng</p>
                </div>

                {/* Search Box */}
                <div className="card">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tìm kiếm khách hàng
                    </label>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="input-field pl-12"
                                placeholder="Nhập tên hoặc số điện thoại..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button className="btn-primary px-8">
                            Tìm kiếm
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        💡 Mẹo: Gõ số điện thoại để tìm nhanh hơn
                    </p>
                </div>

                {/* Search Results */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Kết quả tìm kiếm</h2>

                    {/* Empty State */}
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg">Nhập tên hoặc số điện thoại để tra cứu</p>
                        <p className="text-sm mt-1">Hệ thống sẽ tìm kiếm và hiển thị thông tin công nợ</p>
                    </div>

                    {/* Customer Detail (Hidden by default) */}
                    <div className="hidden">
                        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 mb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Nguyễn Văn A</h3>
                                    <p className="text-gray-600 mt-1">📞 0912345678</p>
                                    <p className="text-sm text-gray-500 mt-2">Ghi chú: Khách quen</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Còn nợ</p>
                                    <p className="text-3xl font-bold text-red-600">1,500,000 ₫</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary-200">
                                <div>
                                    <p className="text-sm text-gray-600">Tổng nợ</p>
                                    <p className="text-xl font-semibold text-gray-900">2,000,000 ₫</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Đã trả</p>
                                    <p className="text-xl font-semibold text-green-600">500,000 ₫</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Số giao dịch</p>
                                    <p className="text-xl font-semibold text-gray-900">5</p>
                                </div>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <h3 className="text-lg font-semibold mb-3">Lịch sử giao dịch</h3>
                        <div className="table-container">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="table-header">Ngày</th>
                                        <th className="table-header">Loại</th>
                                        <th className="table-header">Nội dung</th>
                                        <th className="table-header text-right">Số tiền</th>
                                        <th className="table-header text-right">Còn lại</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="table-cell">27/01/2026</td>
                                        <td className="table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Nợ
                                            </span>
                                        </td>
                                        <td className="table-cell">Mua hàng</td>
                                        <td className="table-cell text-right text-red-600 font-semibold">+1,000,000 ₫</td>
                                        <td className="table-cell text-right font-semibold">1,500,000 ₫</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
