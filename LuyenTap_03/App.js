import thongTinSinhVien, { danhSachSinhVienPhu } from "./student.js";

const { hoTen, lop, nganhHoc, namHoc } = thongTinSinhVien;

console.log("=== KẾT QUẢ BÀI TẬP 2 (App.js) ===");
console.log("Thông tin sinh viên (sử dụng Destructuring):");
console.log("- Họ và tên :", hoTen);
console.log("- Lớp       :", lop);
console.log("- Ngành học :", nganhHoc);
console.log("- Năm học   :", namHoc);

const [sinhVienPhu] = danhSachSinhVienPhu;
console.log("\nThông tin sinh viên phụ (Named Export & Array Destructuring):");
console.log(`- ${sinhVienPhu.hoTen} (${sinhVienPhu.lop}) - Ngành: ${sinhVienPhu.nganhHoc}`);
