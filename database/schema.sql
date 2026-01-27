-- ================================================
-- HỆ THỐNG QUẢN LÝ CÔNG NỢ - DATABASE SCHEMA
-- ================================================

-- 1. Bảng khách hàng
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 2. Bảng giao dịch
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('debt', 'payment')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho query nhanh
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- 3. Function: Tính số dư khách hàng
CREATE OR REPLACE FUNCTION get_customer_balance(customer_uuid UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  phone VARCHAR,
  notes TEXT,
  total_debt DECIMAL,
  total_paid DECIMAL,
  balance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.phone,
    c.notes,
    COALESCE(SUM(CASE WHEN t.type = 'debt' THEN t.amount ELSE 0 END), 0) as total_debt,
    COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN t.type = 'debt' THEN t.amount ELSE -t.amount END), 0) as balance
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
  WHERE c.id = customer_uuid
  GROUP BY c.id, c.name, c.phone, c.notes;
END;
$$ LANGUAGE plpgsql;

-- 4. Function: Lấy danh sách khách hàng với số dư (có phân trang và tìm kiếm)
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
    COALESCE(SUM(CASE WHEN t.type = 'debt' THEN t.amount ELSE 0 END), 0) as total_debt,
    COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN t.type = 'debt' THEN t.amount ELSE -t.amount END), 0) as balance,
    c.created_at
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
  WHERE 
    search_term = '' OR
    c.name ILIKE '%' || search_term || '%' OR
    c.phone ILIKE '%' || search_term || '%'
  GROUP BY c.id, c.name, c.phone, c.notes, c.created_at
  ORDER BY balance DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- 5. Function: Tổng hợp công nợ toàn hệ thống
CREATE OR REPLACE FUNCTION get_debt_summary()
RETURNS TABLE (
  total_customers BIGINT,
  customers_with_debt BIGINT,
  total_debt DECIMAL,
  total_paid DECIMAL,
  total_balance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_balances AS (
    SELECT 
      c.id,
      COALESCE(SUM(CASE WHEN t.type = 'debt' THEN t.amount ELSE 0 END), 0) as debt,
      COALESCE(SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END), 0) as paid,
      COALESCE(SUM(CASE WHEN t.type = 'debt' THEN t.amount ELSE -t.amount END), 0) as balance
    FROM customers c
    LEFT JOIN transactions t ON c.id = t.customer_id
    GROUP BY c.id
  )
  SELECT 
    COUNT(*)::BIGINT as total_customers,
    COUNT(CASE WHEN balance > 0 THEN 1 END)::BIGINT as customers_with_debt,
    COALESCE(SUM(debt), 0) as total_debt,
    COALESCE(SUM(paid), 0) as total_paid,
    COALESCE(SUM(balance), 0) as total_balance
  FROM customer_balances;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger: Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- DỮ LIỆU MẪU (Tùy chọn - xóa nếu không cần)
-- ================================================

-- Thêm khách hàng mẫu
INSERT INTO customers (name, phone, notes) VALUES
  ('Nguyễn Văn A', '0912345678', 'Khách quen'),
  ('Trần Thị B', '0987654321', 'Mua hàng định kỳ'),
  ('Lê Văn C', '0901234567', NULL)
ON CONFLICT (phone) DO NOTHING;

-- Thêm giao dịch mẫu
DO $$
DECLARE
  customer_a_id UUID;
  customer_b_id UUID;
BEGIN
  SELECT id INTO customer_a_id FROM customers WHERE phone = '0912345678';
  SELECT id INTO customer_b_id FROM customers WHERE phone = '0987654321';
  
  IF customer_a_id IS NOT NULL THEN
    INSERT INTO transactions (customer_id, type, amount, description, transaction_date) VALUES
      (customer_a_id, 'debt', 500000, 'Mua hàng tháng 1', '2026-01-15'),
      (customer_a_id, 'debt', 300000, 'Mua hàng tháng 1 (lần 2)', '2026-01-20'),
      (customer_a_id, 'payment', 200000, 'Trả nợ', '2026-01-25');
  END IF;
  
  IF customer_b_id IS NOT NULL THEN
    INSERT INTO transactions (customer_id, type, amount, description, transaction_date) VALUES
      (customer_b_id, 'debt', 1000000, 'Mua hàng số lượng lớn', '2026-01-10'),
      (customer_b_id, 'payment', 500000, 'Trả một phần', '2026-01-22');
  END IF;
END $$;

-- ================================================
-- KIỂM TRA DỮ LIỆU
-- ================================================

-- Xem danh sách khách hàng với số dư
SELECT * FROM get_customers_with_balance('', 1, 50);

-- Xem tổng hợp công nợ
SELECT * FROM get_debt_summary();

-- Xem số dư của một khách hàng cụ thể
-- SELECT * FROM get_customer_balance('uuid-của-khách-hàng');
