package com.example.cook.presentation.home

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import androidx.compose.material.icons.filled.Star
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
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
                            contentDescription = "Thông báo",
                            tint = MaterialTheme.colorScheme.onSurface
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
        is HomeUiState.ThanhCong -> NoiDungThanhCong(
            danhSach = uiState.danhSach,
            onBamCongThuc = onBamCongThuc
        )
    }
}

@Composable
private fun NoiDungThanhCong(
    danhSach: List<com.example.cook.presentation.ui.components.CongThucCardData>,
    onBamCongThuc: (String) -> Unit
) {
    var danhMucDaChon by remember { mutableStateOf("Tất cả") }

    val trending = danhSach.take(5)
    val recommended = danhSach.drop(5).take(6)
    val ganDay = danhSach.takeLast(3).reversed()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item { ChaoHoi() }

        item {
            HanhDongNhanh(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        item {
            TieuDeSection(
                tieuDe = "Danh mục",
                modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp)
            )
        }

        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(danhMuc) { ten ->
                    FilterChip(
                        selected = ten == danhMucDaChon,
                        onClick = { danhMucDaChon = ten },
                        label = { Text(ten) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                }
            }
        }

        if (trending.isNotEmpty()) {
            item {
                TieuDeSection(
                    tieuDe = "Thịnh hành tuần này",
                    hanhDongXemTatCa = true,
                    modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 24.dp, bottom = 8.dp)
                )
            }

            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(trending) { congThuc ->
                        CongThucCard(
                            duLieu = congThuc,
                            khiBam = { onBamCongThuc(congThuc.id) },
                            variant = com.example.cook.presentation.ui.components.CardVariant.COMPACT
                        )
                    }
                }
            }
        }

        if (recommended.isNotEmpty()) {
            item {
                TieuDeSection(
                    tieuDe = "Gợi ý cho bạn",
                    hanhDongXemTatCa = true,
                    modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 24.dp, bottom = 8.dp)
                )
            }

            items(recommended.chunked(2)) { hang ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    hang.forEach { congThuc ->
                        Box(modifier = Modifier.weight(1f)) {
                            CongThucCard(
                                duLieu = congThuc,
                                khiBam = { onBamCongThuc(congThuc.id) },
                                variant = com.example.cook.presentation.ui.components.CardVariant.GRID
                            )
                        }
                    }
                    if (hang.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }

        if (ganDay.isNotEmpty()) {
            item {
                TieuDeSection(
                    tieuDe = "Tiếp tục nấu",
                    hanhDongXemTatCa = true,
                    modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 24.dp, bottom = 8.dp)
                )
            }

            items(ganDay) { congThuc ->
                CongThucCard(
                    duLieu = congThuc,
                    khiBam = { onBamCongThuc(congThuc.id) },
                    variant = com.example.cook.presentation.ui.components.CardVariant.LARGE
                )
            }
        }
    }
}

@Composable
private fun ChaoHoi() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        BodyText(
            text = "Chào buổi sáng",
            kichThuoc = 28.sp,
            dam = true,
            mau = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(4.dp))
        BodyText(
            text = "Hôm nay bạn muốn nấu món gì?",
            kichThuoc = 14.sp,
            mau = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun HanhDongNhanh(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        HanhDongChip(label = "Kế hoạch", icon = "📅")
        HanhDongChip(label = "Đi chợ", icon = "🛒")
        HanhDongChip(label = "Yêu thích", icon = "❤️")
    }
}

@Composable
private fun HanhDongChip(label: String, icon: String) {
    AssistChip(
        onClick = { },
        label = { Text(label) },
        leadingIcon = {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = icon, fontSize = 12.sp)
            }
        },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    )
}

@Composable
private fun TieuDeSection(
    tieuDe: String,
    hanhDongXemTatCa: Boolean = false,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        BodyText(
            text = tieuDe,
            kichThuoc = 18.sp,
            dam = true,
            mau = MaterialTheme.colorScheme.onSurface
        )
        if (hanhDongXemTatCa) {
            TextButton(onClick = { /* TODO view all */ }) {
                Text(
                    text = "Xem tất cả",
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
