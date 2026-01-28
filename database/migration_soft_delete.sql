-- 1. Add deleted_at column to customers and transactions
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Update get_customer_balance function to ignore deleted transactions
DROP FUNCTION IF EXISTS get_customer_balance(uuid);

CREATE OR REPLACE FUNCTION get_customer_balance(customer_uuid UUID)
RETURNS json AS $$
DECLARE
  total_debt DECIMAL;
  total_paid DECIMAL;
  customer_record RECORD;
BEGIN
  -- Get customer details
  SELECT * INTO customer_record FROM customers WHERE id = customer_uuid;
  
  -- Calculate totals (ignoring deleted transactions)
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0)
  INTO total_debt, total_paid
  FROM transactions
  WHERE customer_id = customer_uuid AND deleted_at IS NULL;

  RETURN json_build_object(
    'id', customer_record.id,
    'name', customer_record.name,
    'phone', customer_record.phone,
    'total_debt', total_debt,
    'total_paid', total_paid,
    'balance', total_debt - total_paid
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Update get_customers_with_balance to ignore deleted transactions AND deleted customers
DROP FUNCTION IF EXISTS get_customers_with_balance(text, int, int);

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
    c.created_at
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
  WHERE 
    c.deleted_at IS NULL AND
    (search_term = '' OR
    c.name ILIKE '%' || search_term || '%' OR
    c.phone ILIKE '%' || search_term || '%')
  GROUP BY c.id, c.name, c.phone, c.notes, c.created_at
  ORDER BY balance DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- 4. Update get_debt_summary to ignore deleted records
DROP FUNCTION IF EXISTS get_debt_summary();

CREATE OR REPLACE FUNCTION get_debt_summary()
RETURNS json AS $$
DECLARE
  total_customers INT;
  customers_with_debt INT;
  total_debt DECIMAL;
  total_paid DECIMAL;
  total_balance DECIMAL;
BEGIN
  -- Count active customers
  SELECT COUNT(*) INTO total_customers FROM customers WHERE deleted_at IS NULL;

  -- Calculate totals from non-deleted transactions
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'debt' THEN amount ELSE -amount END), 0)
  INTO total_debt, total_paid, total_balance
  FROM transactions
  WHERE deleted_at IS NULL;

  -- Count customers with positive balance (approximate based on current logic, or detailed query)
  -- For speed, we can use a subquery using the logic above or just distinct customer_ids from active debt transactions
  -- Let's stick to the previous robust logic but filter deleted
  SELECT COUNT(*) INTO customers_with_debt
  FROM (
      SELECT c.id
      FROM customers c
      JOIN transactions t ON c.id = t.customer_id
      WHERE c.deleted_at IS NULL AND t.deleted_at IS NULL
      GROUP BY c.id
      HAVING SUM(CASE WHEN t.type = 'debt' THEN t.amount ELSE -t.amount END) > 0
  ) as sub;

  RETURN json_build_object(
    'total_customers', total_customers,
    'customers_with_debt', customers_with_debt,
    'total_debt', total_debt,
    'total_paid', total_paid,
    'total_balance', total_balance
  );
END;
$$ LANGUAGE plpgsql;
