// BR-LT07: Logic kiểm tra form đăng ký tách riêng để dễ test, không lẫn UI
export function validateDangKy({ hoTen, email, matKhau, xacNhan }) {
  const loi = {};
  if (!hoTen.trim()) {
    loi.hoTen = "Họ tên không được để trống";
  }
  if (!email.trim()) {
    loi.email = "Email không được để trống";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    loi.email = "Email chưa đúng định dạng";
  }
  if (!matKhau) {
    loi.matKhau = "Mật khẩu không được để trống";
  } else if (matKhau.length < 6) {
    loi.matKhau = "Mật khẩu phải từ 6 ký tự trở lên";
  }
  if (!xacNhan) {
    loi.xacNhan = "Chưa nhập lại mật khẩu";
  } else if (xacNhan !== matKhau) {
    loi.xacNhan = "Mật khẩu nhập lại chưa khớp";
  }
  return loi;
}
