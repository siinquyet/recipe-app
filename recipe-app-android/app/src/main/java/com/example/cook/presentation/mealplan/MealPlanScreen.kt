package com.example.cook.presentation.mealplan

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.example.cook.data.api.KeHoachAn
import com.example.cook.presentation.navigation.BottomNavigationBar
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.TitleText
import com.example.cook.presentation.ui.components.TrangThaiDangTai
import com.example.cook.presentation.ui.components.TrangThaiLoi
import com.example.cook.presentation.ui.components.TrangThaiRong

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MealPlanScreen(
    navController: NavHostController,
    viewModel: MealPlanViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val thongBao by viewModel.thongBao.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var hienForm by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    LaunchedEffect(thongBao) {
        if (thongBao is MealPlanAction.Loi) {
            val loi = thongBao as MealPlanAction.Loi
            snackbarHostState.showSnackbar(loi.thongDiep)
            viewModel.daXuLyThongBao()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { TitleText(text = "Kế hoạch ăn") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = { BottomNavigationBar(navController) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { hienForm = true },
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("Tạo kế hoạch") }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is MealPlanUiState.DangTai -> TrangThaiDangTai()
                is MealPlanUiState.Trong -> TrangThaiRong(
                    tieuDe = "Chưa có kế hoạch",
                    thongDiep = state.thongDiep,
                    hanhDong = "Tạo ngay",
                    khiBamHanhDong = { hienForm = true }
                )
                is MealPlanUiState.Loi -> TrangThaiLoi(
                    thongDiep = state.thongDiep,
                    maLoi = state.maLoi,
                    khiThuLai = { viewModel.taiDanhSach() }
                )
                is MealPlanUiState.ThanhCong -> DanhSachKeHoachAn(state.danhSach)
            }
        }
    }

    if (hienForm) {
        ModalBottomSheet(
            onDismissRequest = { hienForm = false },
            sheetState = sheetState
        ) {
            FormTaoKeHoachAn(
                onHuy = { hienForm = false },
                onXacNhan = { ten, bd, kt ->
                    viewModel.taoKeHoachAn(ten, bd, kt)
                    hienForm = false
                }
            )
        }
    }
}

@Composable
private fun DanhSachKeHoachAn(ds: List<KeHoachAn>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(ds) { keHoach ->
            KeHoachAnCard(keHoach)
        }
    }
}

@Composable
private fun KeHoachAnCard(kh: KeHoachAn) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.CalendarMonth,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.padding(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                BodyText(text = kh.ten, kichThuoc = 16.sp, dam = true)
                BodyText(
                    text = "${kh.ngayBatDau} → ${kh.ngayKetThuc}",
                    kichThuoc = 13.sp,
                    mau = MaterialTheme.colorScheme.onSurfaceVariant
                )
                BodyText(
                    text = "${kh.cacMon.size} món",
                    kichThuoc = 12.sp,
                    mau = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FormTaoKeHoachAn(
    onHuy: () -> Unit,
    onXacNhan: (ten: String, ngayBatDau: String, ngayKetThuc: String) -> Unit
) {
    var ten by remember { mutableStateOf("") }
    var ngayBatDau by remember { mutableStateOf("") }
    var ngayKetThuc by remember { mutableStateOf("") }

    val coTheXacNhan = ten.isNotBlank() && ngayBatDau.isNotBlank() && ngayKetThuc.isNotBlank()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        TitleText(text = "Tạo kế hoạch ăn", kichThuoc = 20.sp)
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = ten,
            onValueChange = { ten = it },
            label = { Text("Tên kế hoạch") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = ngayBatDau,
            onValueChange = { ngayBatDau = it },
            label = { Text("Ngày bắt đầu (YYYY-MM-DD)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = ngayKetThuc,
            onValueChange = { ngayKetThuc = it },
            label = { Text("Ngày kết thúc (YYYY-MM-DD)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(20.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onHuy,
                modifier = Modifier.weight(1f)
            ) { Text("Hủy") }
            Button(
                onClick = { onXacNhan(ten.trim(), ngayBatDau.trim(), ngayKetThuc.trim()) },
                modifier = Modifier.weight(1f),
                enabled = coTheXacNhan
            ) { Text("Tạo") }
        }
        Spacer(modifier = Modifier.height(16.dp))
    }
}
