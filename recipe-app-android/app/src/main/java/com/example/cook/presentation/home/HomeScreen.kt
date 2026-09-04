package com.example.cook.presentation.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.example.cook.data.session.AuthGate
import com.example.cook.data.session.TrangThaiXacThuc
import com.example.cook.presentation.navigation.BannerKhach
import com.example.cook.presentation.navigation.BottomNavigationBar
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.CongThucCard
import com.example.cook.presentation.ui.components.TrangThaiDangTai
import com.example.cook.presentation.ui.components.TrangThaiLoi
import com.example.cook.presentation.ui.components.TrangThaiRong
import com.example.cook.presentation.ui.components.TitleText

private const val ROUTE_DANG_NHAP = "dang_nhap"

private val danhMuc = listOf("Tất cả", "Việt Nam", "Châu Á", "Phương Tây", "Chay", "Tráng miệng", "Nhanh")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavHostController,
    authGate: AuthGate,
    viewModel: HomeViewModel
) {
    val trangThai by authGate.trangThai.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { TitleText(text = "Cookbook") },
                actions = {
                    IconButton(onClick = { /* TODO notifications */ }) {
                        Icon(
                            imageVector = Icons.Filled.Notifications,
                            contentDescription = "Thông báo"
                        )
                    }
                },
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
            if (trangThai == TrangThaiXacThuc.Khach) {
                BannerKhach(onDangNhap = { navController.navigate(ROUTE_DANG_NHAP) })
            }
            NoiDungTrangChu(
                uiState = uiState,
                onThuLai = { viewModel.taiDanhSach() },
                onBamCongThuc = { id ->
                    navController.navigate("chi_tiet_cong_thuc/$id/local")
                }
            )
        }
    }
}

@Composable
private fun NoiDungTrangChu(
    uiState: HomeUiState,
    onThuLai: () -> Unit,
    onBamCongThuc: (String) -> Unit
) {
    when (uiState) {
        is HomeUiState.DangTai -> TrangThaiDangTai()
        is HomeUiState.Loi -> TrangThaiLoi(
            thongDiep = uiState.thongDiep,
            maLoi = uiState.maLoi,
            khiThuLai = onThuLai
        )
        is HomeUiState.Trong -> TrangThaiRong(
            tieuDe = "Chưa có công thức",
            thongDiep = uiState.thongDiep,
            hanhDong = "Tải lại",
            khiBamHanhDong = onThuLai
        )
        is HomeUiState.ThanhCong -> LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 16.dp)
        ) {
            item {
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                    BodyText(text = "Chào buổi sáng", kichThuoc = 24.sp, dam = true)
                    BodyText(
                        text = "Hôm nay bạn muốn nấu món gì?",
                        kichThuoc = 14.sp,
                        mau = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(danhMuc) { ten ->
                        AssistChip(
                            onClick = { /* TODO filter */ },
                            label = { Text(ten) },
                            colors = AssistChipDefaults.assistChipColors()
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    BodyText(text = "Công thức nổi bật", kichThuoc = 18.sp, dam = true)
                    TextButton(onClick = { /* TODO xem tất cả */ }) {
                        Text("Xem tất cả")
                    }
                }
            }
            items(uiState.danhSach) { congThuc ->
                CongThucCard(
                    duLieu = congThuc,
                    khiBam = { onBamCongThuc(congThuc.id) }
                )
            }
        }
    }
}
