# Hướng Dẫn Áp Dụng Migration - Tìm Kiếm Không Dấu

## Mục đích
Cho phép tìm kiếm tên khách hàng không cần gõ dấu. Ví dụ: tìm "nguyen van a" sẽ tìm được "Nguyễn Văn A".

## Các bước thực hiện

### Bước 1: Truy cập Supabase SQL Editor

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor** (biểu tượng database ở sidebar bên trái)

### Bước 2: Chạy Migration Script

1. Tạo một query mới (New query)
2. Copy toàn bộ nội dung file `migration_unaccent_search.sql`
3. Paste vào SQL Editor
4. Click **Run** hoặc nhấn `Ctrl + Enter`

### Bước 3: Kiểm tra kết quả

Sau khi chạy migration, bạn sẽ thấy kết quả của 4 test queries:

```sql
-- Test 1: Tìm kiếm không dấu
SELECT * FROM get_customers_with_balance('nguyen van a', 1, 50);

-- Test 2: Tìm kiếm có dấu
SELECT * FROM get_customers_with_balance('nguyễn văn a', 1, 50);

-- Test 3: Tìm kiếm một phần
SELECT * FROM get_customers_with_balance('nguyen', 1, 50);

-- Test 4: Tìm kiếm số điện thoại
SELECT * FROM get_customers_with_balance('0912', 1, 50);
```

Tất cả các query trên đều phải trả về kết quả chứa khách hàng "Nguyễn Văn A".

### Bước 4: Test trên ứng dụng

1. Mở ứng dụng web
2. Vào trang tìm kiếm chính
3. Thử tìm kiếm: `nguyen van a` (không dấu)
4. Kết quả phải hiển thị khách hàng "Nguyễn Văn A"

## Lưu ý

- ✅ Migration này **không ảnh hưởng** đến dữ liệu hiện có
- ✅ Tên khách hàng vẫn được lưu **có dấu** trong database
- ✅ Tìm kiếm có dấu vẫn hoạt động bình thường
- ✅ Tìm kiếm số điện thoại không bị ảnh hưởng
- ✅ Extension `unaccent` có sẵn trong Supabase PostgreSQL

## Troubleshooting

### Nếu gặp lỗi "extension unaccent does not exist"

Chạy lệnh sau trong SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### Nếu vẫn không tìm được

1. Kiểm tra xem function đã được cập nhật chưa:
```sql
\df get_customers_with_balance
```

2. Thử test trực tiếp trong SQL Editor với các query ở Bước 3
