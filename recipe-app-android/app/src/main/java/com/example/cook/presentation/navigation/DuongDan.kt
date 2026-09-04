package com.example.cook.presentation.navigation

import androidx.navigation.NavType
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.cook.data.session.AuthGate
import com.example.cook.presentation.auth.AuthViewModel
import com.example.cook.presentation.auth.LoginScreen
import com.example.cook.presentation.auth.RegisterScreen
import org.koin.androidx.compose.koinViewModel

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

fun NavGraphBuilder.themDuongDan(navController: androidx.navigation.NavHostController, authGate: AuthGate) {
    composable(route = "trang_chu") { TrangChuScreen(navController = navController, authGate = authGate) }
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
    composable(route = "dang_nhap") {
        val viewModel: AuthViewModel = koinViewModel()
        LoginScreen(
            viewModel = viewModel,
            onDangNhapThanhCong = { authGate.dangNhap() },
            onChuyenDangKy = { navController.navigate("dang_ky") },
            onQuenMatKhau = { navController.navigate("quen_mat_khau") },
            onDungThu = {
                authGate.vaoKhach()
                navController.navigate("trang_chu") {
                    popUpTo(0) { inclusive = true }
                    launchSingleTop = true
                }
            }
        )
    }
    composable(route = "dang_ky") {
        val viewModel: AuthViewModel = koinViewModel()
        RegisterScreen(
            viewModel = viewModel,
            onDangKyThanhCong = { authGate.dangNhap() },
            onQuayLaiDangNhap = { navController.popBackStack() }
        )
    }
    composable(route = "quen_mat_khau") { QuenMatKhauScreen(navController = navController) }
}
