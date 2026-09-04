package com.example.cook.data.repository

import com.example.cook.data.api.ApiService
import com.example.cook.data.model.CongThuc

class RecipeRepository(
    private val api: ApiService
) {

    sealed class KetQua<out T> {
        data class ThanhCong<T>(val duLieu: T) : KetQua<T>()
        data class Loi(val maLoi: String, val thongDiep: String) : KetQua<Nothing>()
    }

    suspend fun layDanhSachCongThuc(trang: Int = 0, kichThuoc: Int = 10): KetQua<List<CongThuc>> {
        return try {
            val response = api.layDanhSachCongThuc(trang = trang, kichThuoc = kichThuoc)
            val body = response.body()
            if (response.isSuccessful && body != null && body.success && body.data != null) {
                KetQua.ThanhCong(body.data.noiDung)
            } else {
                val maLoi = body?.error?.code ?: xuLyMaLoi(response.code())
                val thongDiep = body?.error?.message ?: "Không thể tải danh sách công thức"
                KetQua.Loi(maLoi, thongDiep)
            }
        } catch (e: Exception) {
            KetQua.Loi("REC-00", e.message ?: "Lỗi kết nối")
        }
    }

    suspend fun timKiem(tuKhoa: String, trang: Int = 0, kichThuoc: Int = 20): KetQua<List<CongThuc>> {
        return try {
            val response = api.layDanhSachCongThuc(trang = trang, kichThuoc = kichThuoc, tuKhoa = tuKhoa)
            val body = response.body()
            if (response.isSuccessful && body != null && body.success && body.data != null) {
                KetQua.ThanhCong(body.data.noiDung)
            } else {
                val maLoi = body?.error?.code ?: xuLyMaLoi(response.code())
                val thongDiep = body?.error?.message ?: "Không thể tìm kiếm"
                KetQua.Loi(maLoi, thongDiep)
            }
        } catch (e: Exception) {
            KetQua.Loi("REC-00", e.message ?: "Lỗi kết nối")
        }
    }

    suspend fun layChiTiet(id: String): KetQua<CongThuc> {
        return try {
            val response = api.layChiTietCongThuc(id)
            val body = response.body()
            if (response.isSuccessful && body != null && body.success && body.data != null) {
                KetQua.ThanhCong(body.data)
            } else {
                val maLoi = body?.error?.code ?: xuLyMaLoi(response.code())
                val thongDiep = body?.error?.message ?: "Không thể tải chi tiết công thức"
                KetQua.Loi(maLoi, thongDiep)
            }
        } catch (e: Exception) {
            KetQua.Loi("REC-00", e.message ?: "Lỗi kết nối")
        }
    }

    private fun xuLyMaLoi(code: Int): String = when (code) {
        401 -> "REC-01"
        403 -> "REC-02"
        500 -> "REC-03"
        else -> "REC-00"
    }
}
