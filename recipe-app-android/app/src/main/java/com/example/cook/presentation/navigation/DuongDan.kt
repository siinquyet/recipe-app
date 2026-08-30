package com.example.cook.presentation.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.composable

sealed interface DuongDan {
    data object TrangChu : DuongDan
    data object TimKiem : DuongDan
    data object KeHoachAn : DuongDan
    data object DanhSachDiCho : DuongDan
    data object HoSo : DuongDan
    data class ChiTietCongThuc(
        val id: String,
        val nguon: String = "local"
    ) : DuongDan
    data class TaoCongThuc(
        val idChinhSua: String? = null
    ) : DuongDan
    data class DangNhap : DuongDan
    data class DangKy : DuongDan
    data class QuenMatKhau : DuongDan
}

fun NavGraphBuilder.themDuongDan() {
    composable(route = "trang_chu") { TrangChuScreen() }
    composable(route = "tim_kiem") { TimKiemScreen() }
    composable(route = "ke_hoach_an") { KeHoachAnScreen() }
    composable(route = "danh_sach_di_cho") { DanhSachDiChoScreen() }
    composable(route = "ho_so") { HoSoScreen() }
    composable(
        route = "chi_tiet_cong_thuc/{id}/{nguon}",
        arguments = listOf(navArgument("id") { type = NavType.StringType }, navArgument("nguon") { type = NavType.StringType })
    ) {
        val id = getString("id")!!
        val nguon = getString("nguon")!!
        ChiTietCongThucScreen(id = id, nguon = nguon)
    }
    composable(
        route = "tao_cong_thuc?chinh_sua_id={idChinhSua}",
        arguments = listOf(navArgument("idChinhSua") { type = NavType.StringType; nullable = true })
    ) {
        val idChinhSua = getString("idChinhSua")
        TaoCongThucScreen(idChinhSua = idChinhSua)
    }
    composable(route = "dang_nhap") { DangNhapScreen() }
    composable(route = "dang_ky") { DangKyScreen() }
    composable(route = "quen_mat_khau") { QuenMatKhauScreen() }
}