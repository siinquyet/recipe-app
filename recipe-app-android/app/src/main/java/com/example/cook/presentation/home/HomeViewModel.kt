package com.example.cook.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cook.data.model.CongThuc
import com.example.cook.data.repository.RecipeRepository
import com.example.cook.presentation.ui.components.CongThucCardData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface HomeUiState {
    data object DangTai : HomeUiState
    data class ThanhCong(val danhSach: List<CongThucCardData>) : HomeUiState
    data class Trong(val thongDiep: String = "Chưa có công thức nào") : HomeUiState
    data class Loi(val maLoi: String, val thongDiep: String) : HomeUiState
}

class HomeViewModel(
    private val recipeRepository: RecipeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.DangTai)
    val uiState: StateFlow<HomeUiState> = _uiState

    init {
        taiDanhSach()
    }

    fun taiDanhSach() {
        viewModelScope.launch {
            _uiState.value = HomeUiState.DangTai
            when (val ketQua = recipeRepository.layDanhSachCongThuc()) {
                is RecipeRepository.KetQua.ThanhCong -> {
                    val ds = ketQua.duLieu.map { it.sangCardData() }
                    _uiState.value = if (ds.isEmpty()) HomeUiState.Trong() else HomeUiState.ThanhCong(ds)
                }
                is RecipeRepository.KetQua.Loi -> {
                    _uiState.value = HomeUiState.Loi(ketQua.maLoi, ketQua.thongDiep)
                }
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
}
