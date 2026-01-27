// Format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(date))
}

// Format datetime
export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

// Phone number validation
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Format phone number
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\s/g, '')
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
    }
    return phone
}
