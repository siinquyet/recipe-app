package com.example.cook.presentation.search

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AssistChip
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.example.cook.presentation.navigation.BottomNavigationBar
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.CongThucCard
import com.example.cook.presentation.ui.components.TitleText
import com.example.cook.presentation.ui.components.TrangThaiDangTai
import com.example.cook.presentation.ui.components.TrangThaiLoi
import com.example.cook.presentation.ui.components.TrangThaiRong

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    navController: NavHostController,
    viewModel: SearchViewModel
) {
    val truyVan by viewModel.truyVan.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { TitleText(text = "Tìm kiếm") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = { BottomNavigationBar(navController) }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            OutlinedTextField(
                value = truyVan,
                onValueChange = { viewModel.capNhatTruyVan(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Tìm công thức...") },
                leadingIcon = {
                    Icon(imageVector = Icons.Filled.Search, contentDescription = null)
                },
                trailingIcon = {
                    if (truyVan.isNotEmpty()) {
                        IconButton(onClick = { viewModel.capNhatTruyVan("") }) {
                            Icon(imageVector = Icons.Filled.Close, contentDescription = "Xóa")
                        }
                    }
                },
                singleLine = true
            )

            when (uiState) {
                is SearchUiState.BanDau -> GoiYBanDau(
                    ganDay = viewModel.timKiemGanDay,
                    onChon = { viewModel.chonGanDay(it) }
                )
                is SearchUiState.DangTai -> TrangThaiDangTai()
                is SearchUiState.Trong -> TrangThaiRong(
                    tieuDe = "Không tìm thấy",
                    thongDiep = "Không có công thức nào cho \"${(uiState as SearchUiState.Trong).tuKhoa}\"",
                    hanhDong = null,
                    khiBamHanhDong = null
                )
                is SearchUiState.Loi -> TrangThaiLoi(
                    thongDiep = (uiState as SearchUiState.Loi).thongDiep,
                    maLoi = (uiState as SearchUiState.Loi).maLoi,
                    khiThuLai = { viewModel.capNhatTruyVan(truyVan) }
                )
                is SearchUiState.ThanhCong -> KetQuaTimKiem(
                    ds = (uiState as SearchUiState.ThanhCong).ketQua,
                    onBamCongThuc = { id ->
                        navController.navigate("chi_tiet_cong_thuc/$id/local")
                    }
                )
            }
        }
    }
}

@Composable
private fun GoiYBanDau(
    ganDay: List<String>,
    onChon: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
        BodyText(text = "Tìm kiếm gần đây", kichThuoc = 16.sp, dam = true)
        Spacer(modifier = Modifier.height(12.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(ganDay) { ten ->
                AssistChip(onClick = { onChon(ten) }, label = { Text(ten) })
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
        BodyText(text = "Gợi ý cho bạn", kichThuoc = 16.sp, dam = true)
        Spacer(modifier = Modifier.height(8.dp))
        BodyText(
            text = "Nhập tên món ăn, nguyên liệu hoặc danh mục để bắt đầu",
            kichThuoc = 14.sp,
            mau = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun KetQuaTimKiem(
    ds: List<com.example.cook.presentation.ui.components.CongThucCardData>,
    onBamCongThuc: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(vertical = 8.dp, horizontal = 16.dp)
    ) {
        items(ds) { congThuc ->
            CongThucCard(
                duLieu = congThuc,
                khiBam = { onBamCongThuc(congThuc.id) }
            )
        }
    }
}
