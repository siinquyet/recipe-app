package com.example.cook.presentation.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cook.data.model.CongThuc
import com.example.cook.data.repository.RecipeRepository
import com.example.cook.presentation.ui.components.CongThucCardData
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface SearchUiState {
    data object BanDau : SearchUiState
    data object DangTai : SearchUiState
    data class ThanhCong(val ketQua: List<CongThucCardData>) : SearchUiState
    data class Trong(val tuKhoa: String) : SearchUiState
    data class Loi(val maLoi: String, val thongDiep: String) : SearchUiState
}

class SearchViewModel(
    private val recipeRepository: RecipeRepository
) : ViewModel() {

    private val _truyVan = MutableStateFlow("")
    val truyVan: StateFlow<String> = _truyVan

    private val _uiState = MutableStateFlow<SearchUiState>(SearchUiState.BanDau)
    val uiState: StateFlow<SearchUiState> = _uiState

    private var congViecTim: Job? = null

    val timKiemGanDay = listOf("Phở", "Bún chả", "Cơm tấm", "Bánh mì")

    fun capNhatTruyVan(tuKhoa: String) {
        _truyVan.value = tuKhoa
        congViecTim?.cancel()
        if (tuKhoa.isBlank()) {
            _uiState.value = SearchUiState.BanDau
            return
        }
        _uiState.value = SearchUiState.DangTai
        congViecTim = viewModelScope.launch {
            delay(DEBOUNCE_MS)
            thucHienTimKiem(tuKhoa)
        }
    }

    fun chonGanDay(tuKhoa: String) {
        capNhatTruyVan(tuKhoa)
    }

    private suspend fun thucHienTimKiem(tuKhoa: String) {
        when (val ketQua = recipeRepository.timKiem(tuKhoa)) {
            is RecipeRepository.KetQua.ThanhCong -> {
                val ds = ketQua.duLieu.map { it.sangCardData() }
                _uiState.value = if (ds.isEmpty()) SearchUiState.Trong(tuKhoa) else SearchUiState.ThanhCong(ds)
            }
            is RecipeRepository.KetQua.Loi -> {
                _uiState.value = SearchUiState.Loi(ketQua.maLoi, ketQua.thongDiep)
            }
        }
    }

    private fun CongThuc.sangCardData(): CongThucCardData = CongThucCardData(
        id = id,
        hinhAnh = anhThumbnail,
        tenMon = ten,
        thoiGianNau = thoiGianNauPhut,
        khauPhan = khauPhan,
        tacGia = tacGia.tenHienThi,
        tacGiaAvatar = tacGia.anhDaiDien
    )

    companion object {
        private const val DEBOUNCE_MS = 300L
    }
}
