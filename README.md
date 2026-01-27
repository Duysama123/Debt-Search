# Hệ Thống Quản Lý Công Nợ

Hệ thống tra cứu nợ điện tử đơn giản cho hộ kinh doanh nhỏ, thay thế sổ nợ giấy truyền thống.

## 🎯 Tính năng

- ✅ **Quản lý khách hàng**: Thêm, sửa, xóa thông tin khách hàng
- ✅ **Ghi nợ**: Ghi nhận khoản nợ mới
- ✅ **Thanh toán**: Ghi nhận khoản thanh toán
- ✅ **Tra cứu nhanh**: Tìm kiếm theo tên hoặc SĐT
- ✅ **Báo cáo**: Tổng hợp công nợ và xuất Excel
- ✅ **PWA**: Cài đặt như app desktop

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Icons**: Heroicons

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd "Tra cứu nợ"
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Vào SQL Editor và chạy file `database/schema.sql`
3. Copy Project URL và Anon Key

### 4. Cấu hình environment variables

Tạo file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 🚀 Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Thêm environment variables
4. Deploy!

## 📱 Cài đặt PWA

Sau khi deploy, mở web trên Chrome/Edge:
1. Click icon "Cài đặt" trên thanh địa chỉ
2. Hoặc: Menu → "Cài đặt ứng dụng"
3. Icon sẽ xuất hiện trên Desktop

## 📊 Database Schema

### Tables

- **customers**: Thông tin khách hàng
- **transactions**: Giao dịch nợ/thanh toán

### Functions

- `get_customer_balance(uuid)`: Tính số dư khách hàng
- `get_customers_with_balance()`: Danh sách khách + số dư
- `get_debt_summary()`: Tổng hợp công nợ toàn hệ thống

## 🎨 Tính năng nổi bật

- **Tìm kiếm nhanh**: Gõ SĐT để tìm khách hàng ngay lập tức
- **Font to**: Dễ đọc trên laptop tại quầy
- **Phân trang**: Xử lý 100-1000 khách hàng mượt mà
- **Export Excel**: Backup dữ liệu dễ dàng
- **Responsive**: Hoạt động tốt trên mọi thiết bị

## 📝 License

MIT

## 👨‍💻 Support

Nếu cần hỗ trợ, vui lòng tạo issue trên GitHub.
