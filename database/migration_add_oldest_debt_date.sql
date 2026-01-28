-- Migration: Add oldest_debt_date to get_customers_with_balance function
-- This allows tracking debt age for highlighting old debts (>30 days)

DROP FUNCTION IF EXISTS get_customers_with_balance(TEXT, INT, INT);

CREATE OR REPLACE FUNCTION get_customers_with_balance(
  search_term TEXT DEFAULT '',
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  phone VARCHAR,
  notes TEXT,
  total_debt DECIMAL,
  total_paid DECIMAL,
  balance DECIMAL,
  oldest_debt_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.phone,
    c.notes,
    COALESCE(SUM(CASE WHEN t.type = 'debt' AND t.deleted_at IS NULL THEN t.amount ELSE 0 END), 0) as total_debt,
    COALESCE(SUM(CASE WHEN t.type = 'payment' AND t.deleted_at IS NULL THEN t.amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN t.type = 'debt' AND t.deleted_at IS NULL THEN t.amount 
                      WHEN t.type = 'payment' AND t.deleted_at IS NULL THEN -t.amount 
                      ELSE 0 END), 0) as balance,
    MIN(CASE WHEN t.type = 'debt' AND t.deleted_at IS NULL THEN t.transaction_date END) as oldest_debt_date,
    c.created_at
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
  WHERE 
    (c.deleted_at IS NULL) AND
    (search_term = '' OR
     c.name ILIKE '%' || search_term || '%' OR
     c.phone ILIKE '%' || search_term || '%')
  GROUP BY c.id, c.name, c.phone, c.notes, c.created_at
  ORDER BY balance DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;
