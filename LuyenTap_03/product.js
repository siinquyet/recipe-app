const danhSachSanPham = [
  { maSanPham: "SP01", tenSanPham: "iPhone 15 Pro", giaBan: 28000000, conHang: true },
  { maSanPham: "SP02", tenSanPham: "Samsung Galaxy S24", giaBan: 22000000, conHang: false },
  { maSanPham: "SP03", tenSanPham: "Tai nghe Sony WH-1000XM5", giaBan: 8500000, conHang: true },
  { maSanPham: "SP04", tenSanPham: "Bàn phím cơ Keychron Q1", giaBan: 4200000, conHang: true },
  { maSanPham: "SP05", tenSanPham: "Chuột Logitech MX Master 3S", giaBan: 2500000, conHang: false },
];

const danhSachTenSanPham = danhSachSanPham.map((sanPham) => sanPham.tenSanPham);

const danhSachSanPhamConHang = danhSachSanPham.filter((sanPham) => sanPham.conHang === true);

const tongGiaTriTatCaSanPham = danhSachSanPham.reduce(
  (tongTien, sanPhamHienTai) => tongTien + sanPhamHienTai.giaBan,
  0
);

const tongGiaTriSanPhamConHang = danhSachSanPhamConHang.reduce(
  (tongTien, sanPhamHienTai) => tongTien + sanPhamHienTai.giaBan,
  0
);

console.log("=== KẾT QUẢ BÀI TẬP 3 (product.js) ===");

console.log("1. Danh sách tên sản phẩm (map):");
danhSachTenSanPham.forEach((ten, viTri) => {
  console.log(`   ${viTri + 1}. ${ten}`);
});

console.log("\n2. Danh sách sản phẩm còn hàng (filter):");
danhSachSanPhamConHang.forEach((sanPham) => {
  console.log(`   - [${sanPham.maSanPham}] ${sanPham.tenSanPham} | Giá: ${sanPham.giaBan.toLocaleString("vi-VN")} đ`);
});

console.log("\n3. Thống kê giá trị (reduce):");
console.log(`   - Tổng giá trị tất cả sản phẩm : ${tongGiaTriTatCaSanPham.toLocaleString("vi-VN")} đ`);
console.log(`   - Tổng giá trị sản phẩm còn hàng: ${tongGiaTriSanPhamConHang.toLocaleString("vi-VN")} đ`);
