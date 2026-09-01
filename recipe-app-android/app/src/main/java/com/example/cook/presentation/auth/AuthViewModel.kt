package com.example.cook.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cook.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface AuthUiState {
    data object ChuaDangNhap : AuthUiState
    data object DangXuLy : AuthUiState
    data class ThanhCong(val thongDiep: String = "Thành công") : AuthUiState
    data class Loi(val maLoi: String, val thongDiep: String) : AuthUiState
}

class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.ChuaDangNhap)
    val uiState: StateFlow<AuthUiState> = _uiState

    fun dangNhap(email: String, matKhau: String) {
        if (!kiemTraEmail(email) || !kiemTraMatKhau(matKhau)) {
            _uiState.value = AuthUiState.Loi("AUTH-00", "[AUTH-00] Email hoặc mật khẩu không hợp lệ")
            return
        }
        viewModelScope.launch {
            _uiState.value = AuthUiState.DangXuLy
            when (val ketQua = authRepository.dangNhap(email, matKhau)) {
                is AuthRepository.KetQua.ThanhCong -> _uiState.value = AuthUiState.ThanhCong("Đăng nhập thành công")
                is AuthRepository.KetQua.Loi -> _uiState.value = AuthUiState.Loi(ketQua.maLoi, ketQua.thongDiep)
            }
        }
    }

    fun dangKy(email: String, matKhau: String, tenHienThi: String) {
        if (!kiemTraEmail(email)) {
            _uiState.value = AuthUiState.Loi("AUTH-00", "[AUTH-00] Email không hợp lệ")
            return
        }
        if (!kiemTraMatKhauManh(matKhau)) {
            _uiState.value = AuthUiState.Loi("AUTH-05", "[AUTH-05] Mật khẩu tối thiểu 8 ký tự, có hoa/thường/số")
            return
        }
        if (tenHienThi.length !in 2..50) {
            _uiState.value = AuthUiState.Loi("AUTH-00", "[AUTH-00] Tên hiển thị 2-50 ký tự")
            return
        }
        viewModelScope.launch {
            _uiState.value = AuthUiState.DangXuLy
            when (val ketQua = authRepository.dangKy(email, matKhau, tenHienThi)) {
                is AuthRepository.KetQua.ThanhCong -> _uiState.value = AuthUiState.ThanhCong("Đăng ký thành công")
                is AuthRepository.KetQua.Loi -> _uiState.value = AuthUiState.Loi(ketQua.maLoi, ketQua.thongDiep)
            }
        }
    }

    fun dangXuat() {
        viewModelScope.launch {
            authRepository.dangXuat()
            _uiState.value = AuthUiState.ChuaDangNhap
        }
    }

    fun datLaiTrangThai() {
        _uiState.value = AuthUiState.ChuaDangNhap
    }

    private fun kiemTraEmail(email: String): Boolean {
        return email.contains("@") && email.contains(".")
    }

    private fun kiemTraMatKhau(matKhau: String): Boolean {
        return matKhau.length >= 8
    }

    private fun kiemTraMatKhauManh(matKhau: String): Boolean {
        if (matKhau.length < 8) return false
        val coHoa = matKhau.any { it.isUpperCase() }
        val coThuong = matKhau.any { it.isLowerCase() }
        val coSo = matKhau.any { it.isDigit() }
        return coHoa && coThuong && coSo
    }
}
