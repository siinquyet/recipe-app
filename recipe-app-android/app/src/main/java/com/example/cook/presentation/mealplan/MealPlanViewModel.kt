package com.example.cook.presentation.mealplan

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cook.data.api.KeHoachAn
import com.example.cook.data.repository.RecipeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface MealPlanUiState {
    data object DangTai : MealPlanUiState
    data class ThanhCong(val danhSach: List<KeHoachAn>) : MealPlanUiState
    data class Trong(val thongDiep: String = "Chưa có kế hoạch ăn nào") : MealPlanUiState
    data class Loi(val maLoi: String, val thongDiep: String) : MealPlanUiState
}

sealed interface MealPlanAction {
    data object None : MealPlanAction
    data class Loi(val maLoi: String, val thongDiep: String) : MealPlanAction
}

class MealPlanViewModel(
    private val recipeRepository: RecipeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<MealPlanUiState>(MealPlanUiState.DangTai)
    val uiState: StateFlow<MealPlanUiState> = _uiState

    private val _thongBao = MutableStateFlow<MealPlanAction>(MealPlanAction.None)
    val thongBao: StateFlow<MealPlanAction> = _thongBao

    init {
        taiDanhSach()
    }

    fun taiDanhSach() {
        viewModelScope.launch {
            _uiState.value = MealPlanUiState.DangTai
            when (val ketQua = recipeRepository.layDanhSachKeHoachAn()) {
                is RecipeRepository.KetQua.ThanhCong -> {
                    val ds = ketQua.duLieu
                    _uiState.value = if (ds.isEmpty()) MealPlanUiState.Trong() else MealPlanUiState.ThanhCong(ds)
                }
                is RecipeRepository.KetQua.Loi -> {
                    _uiState.value = MealPlanUiState.Loi(ketQua.maLoi, ketQua.thongDiep)
                }
            }
        }
    }

    fun taoKeHoachAn(ten: String, ngayBatDau: String, ngayKetThuc: String) {
        viewModelScope.launch {
            when (val ketQua = recipeRepository.taoKeHoachAn(ten, ngayBatDau, ngayKetThuc)) {
                is RecipeRepository.KetQua.ThanhCong -> {
                    taiDanhSach()
                }
                is RecipeRepository.KetQua.Loi -> {
                    _thongBao.value = MealPlanAction.Loi(ketQua.maLoi, ketQua.thongDiep)
                }
            }
        }
    }

    fun daXuLyThongBao() {
        _thongBao.value = MealPlanAction.None
    }
}
