import { supabase, Customer, Transaction, CustomerBalance } from './supabase'

// Customer operations
export async function getCustomers(search?: string, page = 1, limit = 50) {
    let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('name')
        .range((page - 1) * limit, page * limit - 1)

    if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { customers: data as Customer[], total: count || 0 }
}

export async function getCustomersWithBalance(search?: string, page = 1, limit = 50) {
    let query = supabase.rpc('get_customers_with_balance', {
        search_term: search || '',
        page_number: page,
        page_size: limit
    })

    const { data, error } = await query
    if (error) throw error
    return data as CustomerBalance[]
}

export async function getCustomerById(id: string) {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Customer
}

export async function getCustomerBalance(id: string) {
    const { data, error } = await supabase.rpc('get_customer_balance', {
        customer_uuid: id
    })

    if (error) throw error
    return data as CustomerBalance
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single()

    if (error) throw error
    return data as Customer
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
    const { data, error } = await supabase
        .from('customers')
        .update({ ...customer, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Customer
}

export async function deleteCustomer(id: string) {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Transaction operations
export async function getTransactions(customerId?: string, page = 1, limit = 50) {
    let query = supabase
        .from('transactions')
        .select('*, customers(name, phone)', { count: 'exact' })
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (customerId) {
        query = query.eq('customer_id', customerId)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { transactions: data as Transaction[], total: count || 0 }
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single()

    if (error) throw error
    return data as Transaction
}

// Summary operations
export async function getDebtSummary() {
    const { data, error } = await supabase.rpc('get_debt_summary')
    if (error) throw error
    return data as {
        total_customers: number
        customers_with_debt: number
        total_debt: number
        total_paid: number
        total_balance: number
    }
}
