package com.example.cook.presentation.recipe

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.cook.R
import com.example.cook.data.model.BuocNauAn
import com.example.cook.data.model.CongThuc
import com.example.cook.data.model.DinhDuong
import com.example.cook.data.model.NguyenLieuCongThuc
import com.example.cook.presentation.ui.components.BodyText
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
    var yeuThich by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(onClick = onQuayLai) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Quay lại",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { yeuThich = !yeuThich }) {
                        Icon(
                            imageVector = if (yeuThich) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = if (yeuThich) "Bỏ yêu thích" else "Yêu thích",
                            tint = if (yeuThich) Color(0xFFFF6B6B) else Color.White
                        )
                    }
                    IconButton(onClick = { /* TODO share */ }) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "Chia sẻ",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent,
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            if (uiState is RecipeDetailUiState.ThanhCong) {
                ThanhHanhDong()
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
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
        item { AnhVaThongTin(congThuc) }

        item {
            TabRow(
                selectedTabIndex = tabDangChon,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary
            ) {
                TabChitiet.values().forEachIndexed { index, tab ->
                    Tab(
                        selected = tabDangChon == index,
                        onClick = { onChonTab(index) },
                        text = {
                            Text(
                                text = tab.nhan,
                                fontWeight = if (tabDangChon == index) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }
        }

        when (TabChitiet.values()[tabDangChon]) {
            TabChitiet.NguyenLieu -> item { TabNguyenLieu(congThuc.nguyenLieu) }
            TabChitiet.BuocNau -> item { TabBuocNau(congThuc.cacBuoc) }
            TabChitiet.DinhDuong -> item { TabDinhDuong(congThuc.dinhDuong) }
        }
    }
}

@Composable
private fun AnhVaThongTin(congThuc: CongThuc) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(360.dp)
    ) {
        AsyncImage(
            model = congThuc.anhThumbnail,
            contentDescription = congThuc.ten,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            placeholder = painterResource(id = R.drawable.ic_launcher_background),
            error = painterResource(id = R.drawable.ic_launcher_background)
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.4f),
                            Color.Transparent,
                            Color.Black.copy(alpha = 0.7f)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                BadgeChip(text = "Việt Nam")
                BadgeChip(text = "Đã duyệt")
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = congThuc.ten,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            if (!congThuc.moTa.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = congThuc.moTa,
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.9f),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                TacGiaAvatar(congThuc)
                MetaInline(
                    icon = Icons.Filled.AccessTime,
                    text = "${congThuc.thoiGianNauPhut}p"
                )
                MetaInline(
                    icon = Icons.Filled.Restaurant,
                    text = "${congThuc.khauPhan}p"
                )
                MetaInline(
                    icon = Icons.Filled.Star,
                    text = "4.5"
                )
            }
        }
    }
}

@Composable
private fun BadgeChip(text: String) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = Color.White.copy(alpha = 0.9f)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF1A1A2E),
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
private fun TacGiaAvatar(congThuc: CongThuc) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        if (congThuc.tacGia.anhDaiDien.isNullOrBlank()) {
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.3f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Person,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
        } else {
            AsyncImage(
                model = congThuc.tacGia.anhDaiDien,
                contentDescription = congThuc.tacGia.tenHienThi,
                modifier = Modifier
                    .size(24.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        }
        Text(
            text = congThuc.tacGia.tenHienThi,
            fontSize = 13.sp,
            color = Color.White,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun MetaInline(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(14.dp)
        )
        Text(
            text = text,
            fontSize = 13.sp,
            color = Color.White,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun TabNguyenLieu(danhSach: List<NguyenLieuCongThuc>) {
    if (danhSach.isEmpty()) {
        TrangThaiRongTab(message = "Chưa có thông tin nguyên liệu")
        return
    }
    Column(modifier = Modifier.padding(top = 8.dp)) {
        danhSach.forEach { nl ->
            NguyenLieuRow(nl)
        }
    }
}

@Composable
private fun TabBuocNau(danhSach: List<BuocNauAn>) {
    if (danhSach.isEmpty()) {
        TrangThaiRongTab(message = "Chưa có các bước nấu")
        return
    }
    Column(modifier = Modifier.padding(top = 8.dp)) {
        danhSach.forEach { buoc ->
            BuocNauRow(buoc)
        }
    }
}

@Composable
private fun TabDinhDuong(dinhDuong: DinhDuong?) {
    if (dinhDuong == null) {
        TrangThaiRongTab(message = "Chưa có thông tin dinh dưỡng")
        return
    }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "${dinhDuong.calo}",
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Text(
                    text = "kcal / khẩu phần",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            NutrientChip(
                modifier = Modifier.weight(1f),
                label = "Protein",
                value = dinhDuong.protein,
                unit = "g",
                color = Color(0xFFE57373)
            )
            NutrientChip(
                modifier = Modifier.weight(1f),
                label = "Carb",
                value = dinhDuong.carb,
                unit = "g",
                color = Color(0xFFFFB74D)
            )
            NutrientChip(
                modifier = Modifier.weight(1f),
                label = "Béo",
                value = dinhDuong.chatBeo,
                unit = "g",
                color = Color(0xFF81C784)
            )
        }
    }
}

@Composable
private fun NutrientChip(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    unit: String,
    color: Color
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.15f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "$value$unit",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = label,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
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
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary)
            )
            BodyText(text = nl.ten, kichThuoc = 15.sp)
        }
        BodyText(
            text = "${nl.dinhLuong} ${nl.donVi}",
            kichThuoc = 14.sp,
            mau = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun BuocNauRow(buoc: BuocNauAn) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${buoc.thuTu}",
                color = MaterialTheme.colorScheme.onPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }
        BodyText(
            text = buoc.noiDung,
            kichThuoc = 15.sp,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun TrangThaiRongTab(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = message,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 14.sp
        )
    }
}

@Composable
private fun ThanhHanhDong() {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = { /* TODO add to meal plan */ },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.AccessTime,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Kế hoạch", fontSize = 13.sp)
            }

            OutlinedButton(
                onClick = { /* TODO add to shopping list */ },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.ShoppingCart,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Đi chợ", fontSize = 13.sp)
            }

            Button(
                onClick = { /* TODO start cooking */ },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Nấu", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
