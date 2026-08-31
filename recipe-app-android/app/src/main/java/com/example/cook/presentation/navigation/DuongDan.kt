package com.example.cook.presentation.navigation

import androidx.navigation.NavType
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.navArgument

sealed interface DuongDan {
    object TrangChu : DuongDan
    object TimKiem : DuongDan
    object KeHoachAn : DuongDan
    object DanhSachDiCho : DuongDan
    object HoSo : DuongDan
    data class ChiTietCongThuc(
        val id: String,
        val nguon: String = "local"
    ) : DuongDan
    data class TaoCongThuc(
        val idChinhSua: String? = null
    ) : DuongDan
    data class DangNhap(val dummy: String = "") : DuongDan
    data class DangKy(val dummy: String = "") : DuongDan
    data class QuenMatKhau(val dummy: String = "") : DuongDan
}

fun NavGraphBuilder.themDuongDan(navController: androidx.navigation.NavHostController) {
    composable(route = "trang_chu") { TrangChuScreen(navController = navController) }
    composable(route = "tim_kiem") { TimKiemScreen(navController = navController) }
    composable(route = "ke_hoach_an") { KeHoachAnScreen(navController = navController) }
    composable(route = "danh_sach_di_cho") { DanhSachDiChoScreen(navController = navController) }
    composable(route = "ho_so") { HoSoScreen(navController = navController) }
    composable(
        route = "chi_tiet_cong_thuc/{id}/{nguon}",
        arguments = listOf(navArgument("id") { type = NavType.StringType }, navArgument("nguon") { type = NavType.StringType })
    ) { backStackEntry ->
        val id = backStackEntry.arguments?.getString("id")!!
        val nguon = backStackEntry.arguments?.getString("nguon")!!
        ChiTietCongThucScreen(id = id, nguon = nguon, navController = navController)
    }
    composable(
        route = "tao_cong_thuc?chinh_sua_id={idChinhSua}",
        arguments = listOf(navArgument("idChinhSua") { type = NavType.StringType; nullable = true })
    ) { backStackEntry ->
        val idChinhSua = backStackEntry.arguments?.getString("idChinhSua")
        TaoCongThucScreen(idChinhSua = idChinhSua, navController = navController)
    }
    composable(route = "dang_nhap") { DangNhapScreen(navController = navController) }
    composable(route = "dang_ky") { DangKyScreen(navController = navController) }
    composable(route = "quen_mat_khau") { QuenMatKhauScreen(navController = navController) }
}