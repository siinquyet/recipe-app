package com.example.cook.data.api

import com.example.cook.data.model.ApiResponse
import com.example.cook.data.model.CongThuc
import com.example.cook.data.model.DanhSachCongThuc
import com.example.cook.data.model.DangKyRequest
import com.example.cook.data.model.DangNhapRequest
import com.example.cook.data.model.DangNhapResponse
import com.example.cook.data.model.NguoiDung
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // Auth
    @POST("/auth/register")
    suspend fun dangKy(@Body request: DangKyRequest): Response<DangNhapResponse>

    @POST("/auth/login")
    suspend fun dangNhap(@Body request: DangNhapRequest): Response<DangNhapResponse>

    @POST("/auth/refresh")
    suspend fun lamMoiToken(@Body request: LamMoiTokenRequest): Response<DangNhapResponse>

    @GET("/auth/me")
    suspend fun layThongTinNguoiDung(): Response<ApiResponse<NguoiDung>>

    // Recipes
    @GET("/recipes")
    suspend fun layDanhSachCongThuc(
        @Query("page") trang: Int = 0,
        @Query("size") kichThuoc: Int = 10,
        @Query("search") tuKhoa: String? = null,
        @Query("category") danhMuc: String? = null,
        @Query("cuisine") amThuc: String? = null,
        @Query("diet") cheDoAn: String? = null,
        @Query("minCookTime") thoiGianMin: Int? = null,
        @Query("maxCookTime") thoiGianMax: Int? = null,
        @Query("servings") khauPhan: Int? = null,
        @Query("sort") sapXep: String? = null
    ): Response<ApiResponse<DanhSachCongThuc>>

    @GET("/recipes/{id}")
    suspend fun layChiTietCongThuc(@Path("id") id: String): Response<ApiResponse<CongThuc>>

    @GET("/recipes/{id}/similar")
    suspend fun layCongThucTuongTu(@Path("id") id: String): Response<ApiResponse<DanhSachCongThuc>>

    @GET("/recipes/search/by-ingredients")
    suspend fun timKiemTheoNguyenLieu(
        @Query("ingredients") nguyenLieu: String,
        @Query("number") soLuong: Int = 10
    ): Response<ApiResponse<DanhSachCongThuc>>

    // Favorites
    @POST("/recipes/{id}/favorite")
    suspend fun themYeuThich(@Path("id") id: String): Response<ApiResponse<Unit>>

    @DELETE("/recipes/{id}/favorite")
    suspend fun xoaYeuThich(@Path("id") id: String): Response<ApiResponse<Unit>>

    // Ratings
    @POST("/recipes/{id}/rating")
    suspend fun danhGia(@Path("id") id: String, @Body request: DanhGiaRequest): Response<ApiResponse<DanhGiaResponse>>

    // Comments
    @GET("/recipes/{id}/comments")
    suspend fun layBinhLuan(
        @Path("id") id: String,
        @Query("page") trang: Int = 0,
        @Query("size") kichThuoc: Int = 20
    ): Response<ApiResponse<DanhSachBinhLuan>>

    @POST("/recipes/{id}/comments")
    suspend fun taoBinhLuan(@Path("id") id: String, @Body request: TaoBinhLuanRequest): Response<ApiResponse<BinhLuan>>

    // Meal Plans
    @GET("/meal-plans")
    suspend fun layDanhSachKeHoachAn(
        @Query("page") trang: Int = 0,
        @Query("size") kichThuoc: Int = 10
    ): Response<ApiResponse<DanhSachKeHoachAn>>

    @POST("/meal-plans")
    suspend fun taoKeHoachAn(@Body request: TaoKeHoachAnRequest): Response<ApiResponse<KeHoachAn>>

    @GET("/meal-plans/{id}")
    suspend fun layChiTietKeHoachAn(@Path("id") id: String): Response<ApiResponse<KeHoachAn>>

    // Shopping Lists
    @GET("/shopping-lists")
    suspend fun layDanhSachDiCho(
        @Query("page") trang: Int = 0,
        @Query("size") kichThuoc: Int = 10
    ): Response<ApiResponse<DanhSachDiCho>>

    @POST("/shopping-lists")
    suspend fun taoDanhSachDiCho(@Body request: TaoDanhSachDiChoRequest): Response<ApiResponse<DanhSachDiCho>>

    @GET("/shopping-lists/{id}")
    suspend fun layChiTietDanhSachDiCho(@Path("id") id: String): Response<ApiResponse<DanhSachDiCho>>
}

@Serializable
data class LamMoiTokenRequest(val refreshToken: String)

@Serializable
data class DanhGiaRequest(val diem: Int, val binhLuan: String? = null)

@Serializable
data class DanhGiaResponse(val diemTrungBinh: Double, val tongSoDanhGia: Int)

@Serializable
data class TaoBinhLuanRequest(val noiDung: String, val chaId: String? = null)

@Serializable
data class BinhLuan(
    val id: String,
    val noiDung: String,
    val tacGia: NguoiDung,
    val thoiGianTao: String,
    val soLuongPhanHoi: Int
)

@Serializable
data class DanhSachBinhLuan(
    val noiDung: List<BinhLuan>,
    val tongSoPhanTu: Int,
    val tongSoTrang: Int
)

@Serializable
data class KeHoachAn(
    val id: String,
    val ten: String,
    val ngayBatDau: String,
    val ngayKetThuc: String,
    val kichHoat: Boolean,
    val cacMon: List<MonTrongKeHoach>
)

@Serializable
data class MonTrongKeHoach(
    val id: String,
    val ngay: String,
    val loaiBuoiAn: String,
    val khauPhan: Int,
    val thuTu: Int,
    val congThuc: CongThuc?
)

@Serializable
data class DanhSachKeHoachAn(
    val noiDung: List<KeHoachAn>,
    val tongSoPhanTu: Int,
    val tongSoTrang: Int
)

@Serializable
data class TaoKeHoachAnRequest(
    val ten: String,
    val ngayBatDau: String,
    val ngayKetThuc: String
)

@Serializable
data class DanhSachDiCho(
    val id: String,
    val ten: String,
    val loaiNguon: String,
    val nguonId: String?,
    val trangThai: String,
    val cacMon: List<MonTrongDanhSachDiCho>
)

@Serializable
data class MonTrongDanhSachDiCho(
    val id: String,
    val nguyenLieuId: String?,
    val tenGoc: String,
    val dinhLuong: String,
    val donVi: String,
    val daChon: Boolean,
    val thuTu: Int
)

@Serializable
data class TaoDanhSachDiChoRequest(
    val ten: String,
    val loaiNguon: String,
    val nguonId: String?
)