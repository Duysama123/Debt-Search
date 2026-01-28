'use client'

import { formatCurrency, formatDate } from '@/lib/utils'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    loading?: boolean
    data: {
        customerName: string
        amount: number
        date: string
        description?: string
        type: 'debt' | 'payment'
    }
    warningMessage?: string
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    loading = false,
    data,
    warningMessage
}: ConfirmationModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                {/* Header */}
                <div className={`px-6 py-4 ${data.type === 'payment' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {warningMessage && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm font-medium flex gap-2">
                            <span className="text-xl">⚠️</span>
                            <div>{warningMessage}</div>
                        </div>
                    )}

                    <div className="text-center py-2">
                        <p className="text-gray-500 text-sm uppercase tracking-wide font-semibold">Số tiền xác nhận</p>
                        <p className={`text-4xl font-bold mt-1 ${data.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(data.amount)}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Khách hàng:</span>
                            <span className="font-bold text-gray-900">{data.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngày ghi:</span>
                            <span className="font-medium text-gray-900">{formatDate(data.date)}</span>
                        </div>
                        {data.description && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nội dung:</span>
                                <span className="font-medium text-gray-900 truncate max-w-[200px]">{data.description}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 text-white rounded-lg font-bold shadow-md transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 ${data.type === 'payment'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        {loading ? 'Đang lưu...' : 'Xác nhận Lưu'}
                    </button>
                </div>
            </div>
        </div>
    )
}
