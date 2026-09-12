const tinhTong = (soThuNhat, soThuHai) => soThuNhat + soThuHai;

const tinhBinhPhuong = (soCanTinh) => soCanTinh * soCanTinh;

const kiemTraLonHon10 = (soKiemTra) => soKiemTra > 10;

console.log("=== KẾT QUẢ BÀI TẬP 1 (basic.js) ===");
console.log("1. Tổng của 5 và 7:", tinhTong(5, 7));
console.log("2. Bình phương của 6:", tinhBinhPhuong(6));
console.log("3. Kiểm tra số 8 có lớn hơn 10 không:", kiemTraLonHon10(8));
console.log("4. Kiểm tra số 15 có lớn hơn 10 không:", kiemTraLonHon10(15));
