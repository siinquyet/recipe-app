package com.example.cook.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.koin.androidx.viewmodel.compose.viewModel

@Composable
fun AppNavHost(
    modifier: androidx.compose.ui.Modifier = androidx.compose.ui.Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = "trang_chu"
) {
    NavHost(navController, startDestination = startDestination, modifier = modifier) {
        themDuongDan()
    }
}

@Composable
fun TrangChuScreen() = androidx.compose.material3.Text(text = "Trang Chủ", style = androidx.compose.material3.Typography.h5)

@Composable
fun TimKiemScreen() = androidx.compose.material3.Text(text = "Tìm Kiếm", style = androidx.compose.material3.Typography.h5)

@Composable
fun KeHoachAnScreen() = androidx.compose.material3.Text(text = "Kế Hoạch Ăn", style = androidx.compose.material3.Typography.h5)

@Composable
fun DanhSachDiChoScreen() = androidx.compose.material3.Text(text = "Danh Sách Đi Chợ", style = androidx.compose.material3.Typography.h5)

@Composable
fun HoSoScreen() = androidx.compose.material3.Text(text = "Hồ Sơ", style = androidx.compose.material3.Typography.h5)

@Composable
fun ChiTietCongThucScreen(id: String, nguon: String) = androidx.compose.material3.Text(text = "Chi Tiết: $id ($nguon)", style = androidx.compose.material3.Typography.h5)

@Composable
fun TaoCongThucScreen(idChinhSua: String?) = androidx.compose.material3.Text(text = "Tạo Công Thức${idChinhSua?.let { " (chỉnh sửa $it)" } ?: ""}", style = androidx.compose.material3.Typography.h5)

@Composable
fun DangNhapScreen() = androidx.compose.material3.Text(text = "Đăng Nhập", style = androidx.compose.material3.Typography.h5)

@Composable
fun DangKyScreen() = androidx.compose.material3.Text(text = "Đăng Ký", style = androidx.compose.material3.Typography.h5)

@Composable
fun QuenMatKhauScreen() = androidx.compose.material3.Text(text = "Quên Mật Khẩu", style = androidx.compose.material3.Typography.h5)