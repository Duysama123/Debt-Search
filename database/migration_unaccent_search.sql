-- ================================================
-- MIGRATION: Thêm tìm kiếm không dấu (Accent-insensitive search)
-- ================================================
-- Mục đích: Cho phép tìm kiếm tên khách hàng không cần gõ dấu
-- Ví dụ: "nguyen van a" sẽ tìm được "Nguyễn Văn A"
-- ================================================

-- 1. Kích hoạt extension unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Drop function cũ trước khi tạo lại (để tránh lỗi conflict)
DROP FUNCTION IF EXISTS get_customers_with_balance(text, int, int);

-- 3. Cập nhật function get_customers_with_balance để hỗ trợ tìm kiếm không dấu
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
    unaccent(c.name) ILIKE unaccent('%' || search_term || '%') OR
    c.phone ILIKE '%' || search_term || '%')
  GROUP BY c.id, c.name, c.phone, c.notes, c.created_at
  ORDER BY balance DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- KIỂM TRA
-- ================================================

-- Test 1: Tìm kiếm không dấu
SELECT * FROM get_customers_with_balance('nguyen van a', 1, 50);

-- Test 2: Tìm kiếm có dấu (vẫn hoạt động)
SELECT * FROM get_customers_with_balance('nguyễn văn a', 1, 50);

-- Test 3: Tìm kiếm một phần tên
SELECT * FROM get_customers_with_balance('nguyen', 1, 50);

-- Test 4: Tìm kiếm số điện thoại (vẫn hoạt động bình thường)
SELECT * FROM get_customers_with_balance('0912', 1, 50);
