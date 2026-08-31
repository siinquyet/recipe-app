package com.example.cook.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ApiResponse<T>(
    val success: Boolean = true,
    val data: T? = null,
    val error: ApiError? = null
)

@Serializable
data class ApiError(
    val code: String,
    val message: String,
    val details: String? = null
)

@Serializable
data class NguoiDung(
    val id: String,
    val email: String,
    val tenHienThi: String,
    val anhDaiDien: String? = null,
    val vaiTro: String,
    val trangThai: String
)

@Serializable
data class CongThuc(
    val id: String,
    val ten: String,
    val moTa: String?,
    val anhThumbnail: String?,
    val thoiGianNauPhut: Int,
    val thoiGianChuanBiPhut: Int? = null,
    val khauPhan: Int,
    val tacGia: NguoiDung,
    val nguyenLieu: List<NguyenLieuCongThuc>,
    val cacBuoc: List<BuocNauAn>,
    val dinhDuong: DinhDuong?,
    val ngayTao: String,
    val ngayCapNhat: String
)

@Serializable
data class NguyenLieuCongThuc(
    val ten: String,
    val dinhLuong: String,
    val donVi: String
)

@Serializable
data class BuocNauAn(
    val thuTu: Int,
    val noiDung: String,
    val anhBuoc: String? = null
)

@Serializable
data class DinhDuong(
    val calo: Int,
    val protein: String,
    val carb: String,
    val chatBeo: String
)

@Serializable
data class DanhSachCongThuc(
    val noiDung: List<CongThuc>,
    val tongSoPhanTu: Int,
    val tongSoTrang: Int
)

@Serializable
data class DangKyRequest(
    val email: String,
    val matKhau: String,
    val tenHienThi: String
)

@Serializable
data class DangNhapRequest(
    val email: String,
    val matKhau: String
)

@Serializable
data class DangNhapResponse(
    val accessToken: String,
    val refreshToken: String,
    val thoiGianHetHan: Int
)