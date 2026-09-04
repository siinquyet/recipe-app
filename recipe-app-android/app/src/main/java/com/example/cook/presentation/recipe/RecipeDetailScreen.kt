package com.example.cook.presentation.recipe

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.cook.R
import com.example.cook.data.model.CongThuc
import com.example.cook.data.model.NguyenLieuCongThuc
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.TitleText
import com.example.cook.presentation.ui.components.TrangThaiDangTai
import com.example.cook.presentation.ui.components.TrangThaiLoi

private enum class TabChitiet(val nhan: String) {
    NguyenLieu("Nguyên liệu"),
    BuocNau("Các bước"),
    DinhDuong("Dinh dưỡng")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecipeDetailScreen(
    onQuayLai: () -> Unit,
    viewModel: RecipeDetailViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    var tabDangChon by remember { mutableIntStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { TitleText(text = "Chi tiết công thức") },
                navigationIcon = {
                    IconButton(onClick = onQuayLai) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Quay lại"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is RecipeDetailUiState.DangTai -> TrangThaiDangTai()
                is RecipeDetailUiState.Loi -> TrangThaiLoi(
                    thongDiep = state.thongDiep,
                    maLoi = state.maLoi,
                    khiThuLai = { viewModel.taiChiTiet() }
                )
                is RecipeDetailUiState.ThanhCong -> NoiDungChiTiet(
                    congThuc = state.congThuc,
                    tabDangChon = tabDangChon,
                    onChonTab = { tabDangChon = it }
                )
            }
        }
    }
}

@Composable
private fun NoiDungChiTiet(
    congThuc: CongThuc,
    tabDangChon: Int,
    onChonTab: (Int) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item { Header(congThuc) }
        item {
            TabRow(selectedTabIndex = tabDangChon) {
                TabChitiet.values().forEachIndexed { index, tab ->
                    Tab(
                        selected = tabDangChon == index,
                        onClick = { onChonTab(index) },
                        text = { Text(tab.nhan) }
                    )
                }
            }
        }
        when (TabChitiet.values()[tabDangChon]) {
            TabChitiet.NguyenLieu -> items(congThuc.nguyenLieu) { nl ->
                NguyenLieuRow(nl)
            }
            TabChitiet.BuocNau -> item {
                Text(
                    text = "${congThuc.cacBuoc.size} bước — xem chi tiết khi các bước được tải từ server.",
                    modifier = Modifier.padding(16.dp),
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            TabChitiet.DinhDuong -> item {
                Text(
                    text = "Thông tin dinh dưỡng sẽ hiển thị khi API trả về.",
                    modifier = Modifier.padding(16.dp),
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = { /* TODO: thêm vào kế hoạch ăn */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(48.dp)
            ) {
                Text("Thêm vào kế hoạch ăn")
            }
        }
    }
}

@Composable
private fun Header(congThuc: CongThuc) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .padding(16.dp)
                .clip(RoundedCornerShape(12.dp))
        ) {
            AsyncImage(
                model = congThuc.anhThumbnail,
                contentDescription = congThuc.ten,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = R.drawable.ic_launcher_background),
                error = painterResource(id = R.drawable.ic_launcher_background)
            )
        }
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            TitleText(text = congThuc.ten, kichThuoc = 24.sp)
            if (!congThuc.moTa.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                BodyText(
                    text = congThuc.moTa,
                    kichThuoc = 14.sp,
                    mau = MaterialTheme.colorScheme.onSurfaceVariant,
                    soDongToiDa = 3
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                MetaItem(icon = Icons.Filled.AccessTime, text = "${congThuc.thoiGianNauPhut} phút")
                MetaItem(icon = Icons.Filled.Restaurant, text = "${congThuc.khauPhan} người")
                MetaItem(icon = Icons.Filled.Person, text = congThuc.tacGia.tenHienThi)
            }
            Spacer(modifier = Modifier.height(8.dp))
            if (congThuc.nguyenLieu.isNotEmpty()) {
                AssistChip(
                    onClick = { },
                    label = { Text("${congThuc.nguyenLieu.size} nguyên liệu") }
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
private fun MetaItem(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.size(4.dp))
        Text(text = text, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun NguyenLieuRow(nl: NguyenLieuCongThuc) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        BodyText(text = nl.ten, kichThuoc = 15.sp, dam = true, modifier = Modifier.weight(1f))
        BodyText(
            text = "${nl.dinhLuong} ${nl.donVi}",
            kichThuoc = 14.sp,
            mau = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
