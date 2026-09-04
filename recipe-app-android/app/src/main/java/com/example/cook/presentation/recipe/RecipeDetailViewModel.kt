package com.example.cook.presentation.recipe

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cook.data.model.CongThuc
import com.example.cook.data.repository.RecipeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed interface RecipeDetailUiState {
    data object DangTai : RecipeDetailUiState
    data class ThanhCong(val congThuc: CongThuc) : RecipeDetailUiState
    data class Loi(val maLoi: String, val thongDiep: String) : RecipeDetailUiState
}

class RecipeDetailViewModel(
    private val recipeRepository: RecipeRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val idCongThuc: String = savedStateHandle.get<String>("id").orEmpty()

    private val _uiState = MutableStateFlow<RecipeDetailUiState>(RecipeDetailUiState.DangTai)
    val uiState: StateFlow<RecipeDetailUiState> = _uiState

    init {
        if (idCongThuc.isBlank()) {
            _uiState.value = RecipeDetailUiState.Loi("REC-04", "Thiếu mã công thức")
        } else {
            taiChiTiet()
        }
    }

    fun taiChiTiet() {
        if (idCongThuc.isBlank()) return
        viewModelScope.launch {
            _uiState.value = RecipeDetailUiState.DangTai
            when (val ketQua = recipeRepository.layChiTiet(idCongThuc)) {
                is RecipeRepository.KetQua.ThanhCong -> {
                    _uiState.value = RecipeDetailUiState.ThanhCong(ketQua.duLieu)
                }
                is RecipeRepository.KetQua.Loi -> {
                    _uiState.value = RecipeDetailUiState.Loi(ketQua.maLoi, ketQua.thongDiep)
                }
            }
        }
    }
}
