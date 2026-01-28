# Hướng dẫn chạy Migration: Highlight Old Debt

## Bước 1: Mở Supabase SQL Editor
1. Truy cập: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Click "New query"

## Bước 2: Copy và chạy SQL
Copy toàn bộ nội dung file `migration_add_oldest_debt_date.sql` và paste vào SQL Editor, sau đó click "Run".

## Bước 3: Verify
Chạy query sau để kiểm tra:
```sql
SELECT * FROM get_customers_with_balance('', 1, 10);
```

Kết quả phải có cột `oldest_debt_date`.

## Bước 4: Test trên UI
1. Vào trang Reports (`/reports`)
2. Kiểm tra xem các khoản nợ >30 ngày có:
   - Background màu đỏ nhạt
   - Border trái màu đỏ
   - Badge "⚠️ Quá hạn X ngày"
   - Số tiền in đậm hơn

## Lưu ý
- Migration này sẽ DROP và tạo lại function `get_customers_with_balance`
- Không ảnh hưởng đến dữ liệu hiện có
- Chỉ thêm field mới vào kết quả trả về
