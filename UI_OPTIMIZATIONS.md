# UI/UX Optimizations for Cashier

## 🎯 Thay đổi chính

### 1. Trang chủ = Tra cứu nhanh
- ✅ Search bar **to gấp đôi** (text-2xl)
- ✅ **Auto-focus** vào ô tìm kiếm khi load trang
- ✅ **Instant search** - hiển thị kết quả ngay khi gõ (debounce 300ms)
- ✅ **Enter to select** - nhấn Enter chọn kết quả đầu tiên
- ✅ **Auto-select** - nếu chỉ 1 kết quả thì tự động chọn

### 2. Kết quả hiển thị rõ ràng
- ✅ Dropdown kết quả **to và rõ**
- ✅ Tên khách hàng: **text-xl font-semibold**
- ✅ Số nợ: **text-2xl font-bold**
- ✅ Màu sắc: Nợ = đỏ, Trả = xanh lá

### 3. Chi tiết khách hàng
- ✅ Tên khách: **text-3xl**
- ✅ SĐT: **text-xl**
- ✅ Số dư: **text-4xl** (cực to, dễ nhìn)
- ✅ 3 cards: Tổng nợ / Đã trả / Còn lại với màu riêng

### 4. Nút bấm to
- ✅ Nút "Ghi nợ" / "Thanh toán": **py-5 text-xl**
- ✅ Icon to: **w-7 h-7**
- ✅ Màu rõ: Ghi nợ = đỏ, Thanh toán = xanh

### 5. Lịch sử giao dịch
- ✅ Mỗi giao dịch là 1 card riêng
- ✅ Icon emoji to: 📝 (nợ) / 💰 (trả)
- ✅ Số tiền: **text-2xl font-bold**
- ✅ Border màu theo loại giao dịch

### 6. Font size toàn hệ thống
- ✅ Buttons: **text-lg py-3 px-6**
- ✅ Input fields: **text-lg py-3**
- ✅ Table headers: **text-lg py-4**
- ✅ Table cells: **text-lg py-4**
- ✅ Sidebar menu: **text-lg py-4**

### 7. Keyboard shortcuts
- ✅ **Enter**: Chọn kết quả đầu tiên
- ✅ **Auto-focus**: Tự động focus vào search
- ✅ **Esc**: Đóng chi tiết khách hàng (có thể thêm)

### 8. Help text
- ✅ Hướng dẫn rõ ràng ngay trên trang
- ✅ Mẹo sử dụng với icon 💡
- ✅ Font to, dễ đọc

## 📊 So sánh trước/sau

| Tính năng | Trước | Sau |
|-----------|-------|-----|
| Search input | text-base | **text-2xl** |
| Số nợ hiển thị | text-xl | **text-4xl** |
| Nút action | py-2 text-base | **py-5 text-xl** |
| Sidebar menu | text-base | **text-lg** |
| Table text | text-base | **text-lg** |
| Tìm kiếm | Click button | **Instant** |
| Focus | Manual | **Auto** |
| Chọn kết quả | Click | **Enter** |

## 🎨 Màu sắc rõ ràng

- 🔴 **Đỏ**: Nợ, Ghi nợ
- 🟢 **Xanh lá**: Thanh toán, Đã trả
- 🟠 **Cam**: Còn lại
- 🔵 **Xanh dương**: Primary actions

## ⌨️ Workflow thu ngân

1. **Mở app** → Auto-focus vào search
2. **Gõ SĐT** → Kết quả hiển thị ngay
3. **Nhấn Enter** → Chọn khách hàng
4. **Xem số nợ** → To, rõ, dễ đọc
5. **Click "Ghi nợ" hoặc "Thanh toán"** → Nút to, dễ bấm
6. **Hoàn tất** → Quay lại search

⏱️ **Thời gian tra cứu: < 5 giây**

## 🚀 Tính năng có thể thêm

- [ ] Phím tắt: `Ctrl+K` mở search
- [ ] Phím tắt: `Esc` đóng chi tiết
- [ ] Phím tắt: `Ctrl+D` ghi nợ nhanh
- [ ] Phím tắt: `Ctrl+P` thanh toán nhanh
- [ ] Voice search (gõ bằng giọng nói)
- [ ] Barcode scanner (quét mã khách hàng)
- [ ] Print receipt (in phiếu nợ)

## ✅ Đã hoàn thành

- ✅ Trang chủ = Tra cứu nhanh
- ✅ Font size to gấp đôi
- ✅ Instant search
- ✅ Auto-focus
- ✅ Enter to select
- ✅ Nút bấm to
- ✅ Màu sắc rõ ràng
- ✅ Lịch sử giao dịch dễ đọc
