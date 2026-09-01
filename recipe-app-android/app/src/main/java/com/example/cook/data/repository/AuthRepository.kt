package com.example.cook.data.repository

import com.example.cook.data.api.ApiService
import com.example.cook.data.api.LamMoiTokenRequest
import com.example.cook.data.local.TokenStorage
import com.example.cook.data.model.DangKyRequest
import com.example.cook.data.model.DangNhapRequest
import com.example.cook.data.model.DangNhapResponse
import kotlinx.coroutines.flow.first

class AuthRepository(
    private val api: ApiService,
    private val tokenStorage: TokenStorage
) {

    sealed class KetQua<out T> {
        data class ThanhCong<T>(val duLieu: T) : KetQua<T>()
        data class Loi(val maLoi: String, val thongDiep: String) : KetQua<Nothing>()
    }

    suspend fun dangNhap(email: String, matKhau: String): KetQua<DangNhapResponse> {
        return try {
            val response = api.dangNhap(DangNhapRequest(email, matKhau))
            if (response.isSuccessful && response.body() != null) {
                val duLieu = response.body()!!
                tokenStorage.luuToken(duLieu.accessToken, duLieu.refreshToken)
                KetQua.ThanhCong(duLieu)
            } else {
                val maLoi = xuLyMaLoi(response.code())
                KetQua.Loi(maLoi, layThongDiepLoi(maLoi))
            }
        } catch (e: Exception) {
            KetQua.Loi("AUTH-00", e.message ?: "Lỗi kết nối")
        }
    }

    suspend fun dangKy(email: String, matKhau: String, tenHienThi: String): KetQua<DangNhapResponse> {
        return try {
            val response = api.dangKy(DangKyRequest(email, matKhau, tenHienThi))
            if (response.isSuccessful && response.body() != null) {
                val duLieu = response.body()!!
                tokenStorage.luuToken(duLieu.accessToken, duLieu.refreshToken)
                KetQua.ThanhCong(duLieu)
            } else {
                val maLoi = xuLyMaLoi(response.code())
                KetQua.Loi(maLoi, layThongDiepLoi(maLoi))
            }
        } catch (e: Exception) {
            KetQua.Loi("AUTH-00", e.message ?: "Lỗi kết nối")
        }
    }

    suspend fun lamMoiToken(): KetQua<DangNhapResponse> {
        val refreshToken = tokenStorage.refreshToken.first() ?: return KetQua.Loi("AUTH-03", "Refresh token không tồn tại")
        return try {
            val response = api.lamMoiToken(LamMoiTokenRequest(refreshToken))
            if (response.isSuccessful && response.body() != null) {
                val duLieu = response.body()!!
                tokenStorage.luuToken(duLieu.accessToken, duLieu.refreshToken)
                KetQua.ThanhCong(duLieu)
            } else {
                KetQua.Loi("AUTH-03", "Refresh token không hợp lệ hoặc đã hết hạn")
            }
        } catch (e: Exception) {
            KetQua.Loi("AUTH-00", e.message ?: "Lỗi kết nối")
        }
    }

    suspend fun dangXuat() {
        tokenStorage.xoaToken()
    }

    private fun xuLyMaLoi(code: Int): String = when (code) {
        400 -> "AUTH-05"
        401 -> "AUTH-02"
        409 -> "AUTH-01"
        429 -> "AUTH-06"
        else -> "AUTH-00"
    }

    private fun layThongDiepLoi(maLoi: String): String = when (maLoi) {
        "AUTH-01" -> "[AUTH-01] Email đã được sử dụng"
        "AUTH-02" -> "[AUTH-02] Email hoặc mật khẩu không chính xác"
        "AUTH-05" -> "[AUTH-05] Mật khẩu không đủ mạnh"
        "AUTH-06" -> "[AUTH-06] Quá nhiều yêu cầu, vui lòng thử lại sau"
        else -> "[$maLoi] Đã có lỗi xảy ra"
    }
}
