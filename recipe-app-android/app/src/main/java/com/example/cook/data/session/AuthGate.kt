package com.example.cook.data.session

import com.example.cook.data.local.TokenStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first

// BR-AUTH-06: Khởi động app phải kiểm tra accessToken trong DataStore; không có → màn hình Đăng nhập
// BR-AUTH-07: Guest session lưu in-memory, mất khi tắt app (không persist)
enum class TrangThaiXacThuc {
    DangChoKhoiTao,
    ChuaDangNhap,
    DaDangNhap,
    Khach
}

class AuthGate(
    private val tokenStorage: TokenStorage
) {
    private val _trangThai = MutableStateFlow(TrangThaiXacThuc.DangChoKhoiTao)
    val trangThai: StateFlow<TrangThaiXacThuc> = _trangThai.asStateFlow()

    suspend fun khoiTao() {
        val token = tokenStorage.accessToken.first()
        _trangThai.value = if (token.isNullOrBlank()) TrangThaiXacThuc.ChuaDangNhap else TrangThaiXacThuc.DaDangNhap
    }

    fun dangNhap() {
        _trangThai.value = TrangThaiXacThuc.DaDangNhap
    }

    fun vaoKhach() {
        _trangThai.value = TrangThaiXacThuc.Khach
    }

    fun dangXuat() {
        _trangThai.value = TrangThaiXacThuc.ChuaDangNhap
    }
}
