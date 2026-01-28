import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Customer {
    id: string
    name: string
    phone: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    customer_id: string
    type: 'debt' | 'payment'
    amount: number
    description: string | null
    transaction_date: string
    created_at: string
}

export interface CustomerBalance extends Customer {
    total_debt: number
    total_paid: number
    balance: number
    oldest_debt_date?: string | null
}
