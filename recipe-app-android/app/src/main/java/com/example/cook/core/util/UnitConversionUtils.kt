package com.example.cook.core.util

// BR-03: Cộng gộp khi cùng internalIngredientId và cùng đơn vị hoặc quy đổi được
// BR-04: Scaled Quantity = Original × (MealPlan Servings / Recipe Base Servings)

enum class NhomDonVi {
    KHOI_LUONG,
    THE_TICH,
    DEM
}

data class DinhNghiaDonVi(
    val ten: String,
    val nhom: NhomDonVi,
    val heSoVeCoSo: Double
)

private val BANG_DON_VI: Map<String, DinhNghiaDonVi> = mapOf(
    "g" to DinhNghiaDonVi("g", NhomDonVi.KHOI_LUONG, 1.0),
    "kg" to DinhNghiaDonVi("kg", NhomDonVi.KHOI_LUONG, 1000.0),
    "mg" to DinhNghiaDonVi("mg", NhomDonVi.KHOI_LUONG, 0.001),
    "ml" to DinhNghiaDonVi("ml", NhomDonVi.THE_TICH, 1.0),
    "l" to DinhNghiaDonVi("l", NhomDonVi.THE_TICH, 1000.0),
    "muỗng cà phê" to DinhNghiaDonVi("muỗng cà phê", NhomDonVi.THE_TICH, 5.0),
    "muỗng canh" to DinhNghiaDonVi("muỗng canh", NhomDonVi.THE_TICH, 15.0),
    "chén" to DinhNghiaDonVi("chén", NhomDonVi.THE_TICH, 200.0),
    "bát" to DinhNghiaDonVi("bát", NhomDonVi.THE_TICH, 300.0),
    "cái" to DinhNghiaDonVi("cái", NhomDonVi.DEM, 1.0),
    "quả" to DinhNghiaDonVi("quả", NhomDonVi.DEM, 1.0),
    "lát" to DinhNghiaDonVi("lát", NhomDonVi.DEM, 1.0),
    "nhánh" to DinhNghiaDonVi("nhánh", NhomDonVi.DEM, 1.0),
    "cọng" to DinhNghiaDonVi("cọng", NhomDonVi.DEM, 1.0),
    "gói" to DinhNghiaDonVi("gói", NhomDonVi.DEM, 1.0),
    "hộp" to DinhNghiaDonVi("hộp", NhomDonVi.DEM, 1.0),
    "lon" to DinhNghiaDonVi("lon", NhomDonVi.DEM, 1.0),
    "chai" to DinhNghiaDonVi("chai", NhomDonVi.DEM, 1.0)
)

fun layThongTinDonVi(donVi: String): DinhNghiaDonVi? {
    val chuanHoa = donVi.lowercase().trim()
    return BANG_DON_VI[chuanHoa]
}

fun coTheQuyDoi(donVi1: String, donVi2: String): Boolean {
    val thongTin1 = layThongTinDonVi(donVi1) ?: return false
    val thongTin2 = layThongTinDonVi(donVi2) ?: return false
    return thongTin1.nhom == thongTin2.nhom
}

data class KetQuaQuyDoi(val giaTri: Double, val donViCoSo: String)

fun quyDoiVeCoSo(giaTri: Double, donVi: String): KetQuaQuyDoi? {
    val thongTin = layThongTinDonVi(donVi) ?: return null
    val tenCoSo = when (thongTin.nhom) {
        NhomDonVi.KHOI_LUONG -> "g"
        NhomDonVi.THE_TICH -> "ml"
        NhomDonVi.DEM -> "cái"
    }
    return KetQuaQuyDoi(giaTri * thongTin.heSoVeCoSo, tenCoSo)
}

fun quyDoiTuCoSo(giaTriCoSo: Double, donViDich: String): Double? {
    val thongTin = layThongTinDonVi(donViDich) ?: return null
    return giaTriCoSo / thongTin.heSoVeCoSo
}

fun dinhDangDinhLuong(giaTri: Double, donVi: String): String {
    return "${giaTri.dinhDangVn()} $donVi"
}

data class MonDinhLuong(
    val idNguyenLieuNoiBo: String? = null,
    val vanBanGoc: String,
    val dinhLuong: Double,
    val donVi: String
)

data class DinhLuongGop(
    val dinhLuong: Double,
    val donVi: String,
    val danhSachVanBanGoc: MutableList<String>
)

// BR-03: Cộng gộp định lượng
fun gopDinhLuong(cacMon: List<MonDinhLuong>): Map<String, DinhLuongGop> {
    val nhom = mutableMapOf<String, DinhLuongGop>()

    for (mon in cacMon) {
        val khoa = mon.idNguyenLieuNoiBo ?: "unmapped_${mon.vanBanGoc}"
        val hienCo = nhom[khoa]

        if (hienCo != null) {
            if (coTheQuyDoi(hienCo.donVi, mon.donVi)) {
                val coSo1 = quyDoiVeCoSo(hienCo.dinhLuong, hienCo.donVi)!!
                val coSo2 = quyDoiVeCoSo(mon.dinhLuong, mon.donVi)!!
                val tongCoSo = coSo1.giaTri + coSo2.giaTri
                val dinhLuongMoi = quyDoiTuCoSo(tongCoSo, hienCo.donVi)!!
                hienCo.danhSachVanBanGoc.add(mon.vanBanGoc)
                nhom[khoa] = hienCo.copy(dinhLuong = dinhLuongMoi)
            } else {
                val khoaMoi = "${khoa}_${mon.donVi}"
                nhom[khoaMoi] = DinhLuongGop(mon.dinhLuong, mon.donVi, mutableListOf(mon.vanBanGoc))
            }
        } else {
            nhom[khoa] = DinhLuongGop(mon.dinhLuong, mon.donVi, mutableListOf(mon.vanBanGoc))
        }
    }

    return nhom
}

data class KetQuaScale(val dinhLuong: Double, val canhBao: String? = null)

// BR-04: Scaled Quantity = Original × (MealPlan Servings / Recipe Base Servings)
fun scaleDinhLuong(
    dinhLuongGoc: Double,
    khauPhanGoc: Int,
    khauPhanMucTieu: Int
): KetQuaScale {
    if (khauPhanGoc <= 0) {
        return KetQuaScale(dinhLuongGoc, "RECIPE_BASE_SERVINGS_INVALID: Không có khẩu phần cơ sở, giữ nguyên định lượng")
    }
    val daScale = dinhLuongGoc * (khauPhanMucTieu.toDouble() / khauPhanGoc.toDouble())
    return KetQuaScale(daScale)
}

fun taoDanhSachDiCho(
    nguyenLieuCongThuc: List<MonDinhLuong>,
    khauPhanGoc: Int,
    khauPhanMucTieu: Int
): Map<String, DinhLuongGop> {
    val daScale = nguyenLieuCongThuc.map { mon ->
        val ketQua = scaleDinhLuong(mon.dinhLuong, khauPhanGoc, khauPhanMucTieu)
        mon.copy(dinhLuong = ketQua.dinhLuong)
    }
    return gopDinhLuong(daScale)
}
