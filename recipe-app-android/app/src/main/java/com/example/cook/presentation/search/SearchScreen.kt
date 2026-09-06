package com.example.cook.presentation.search

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.InputChip
import androidx.compose.material3.InputChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
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
import com.example.cook.presentation.navigation.BottomNavigationBar
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.CardVariant
import com.example.cook.presentation.ui.components.CongThucCard
import com.example.cook.presentation.ui.components.TitleText
import com.example.cook.presentation.ui.components.TrangThaiDangTai
import com.example.cook.presentation.ui.components.TrangThaiLoi
import com.example.cook.presentation.ui.components.TrangThaiRong

private val goiYPhoBien = listOf("Phở", "Bún chả", "Cơm tấm", "Bánh mì", "Chè", "Gỏi cuốn", "Bún bò")
private val nguyenLieuThinhHanh = listOf("Thịt gà", "Thịt bò", "Tôm", "Rau muống", "Trứng", "Đậu phụ")

private data class FilterState(
    val danhMuc: Set<String> = emptySet(),
    val amThuc: Set<String> = emptySet(),
    val cheDoAn: String? = null,
    val thoiGianToiDa: Int = 240,
    val khauPhan: Int = 4
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    navController: NavHostController,
    viewModel: SearchViewModel
) {
    val truyVan by viewModel.truyVan.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    var hienBoLoc by remember { mutableStateOf(false) }
    var filter by remember { mutableStateOf(FilterState()) }

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
            ThanhTimKiem(
                truyVan = truyVan,
                onTruyVanThayDoi = { viewModel.capNhatTruyVan(it) },
                onBamBoLoc = { hienBoLoc = true },
                boLocDangApDung = filter.danhMuc.size + filter.amThuc.size + (if (filter.cheDoAn != null) 1 else 0)
            )

            LocDangApDung(
                filter = filter,
                onXoa = { filter = FilterState() }
            )

            when (uiState) {
                is SearchUiState.BanDau -> GoiYBanDau(
                    ganDay = viewModel.timKiemGanDay,
                    phoBien = goiYPhoBien,
                    nguyenLieu = nguyenLieuThinhHanh,
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

    if (hienBoLoc) {
        BoLocBottomSheet(
            filter = filter,
            onDong = { hienBoLoc = false },
            onApDung = { moi ->
                filter = moi
                hienBoLoc = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ThanhTimKiem(
    truyVan: String,
    onTruyVanThayDoi: (String) -> Unit,
    onBamBoLoc: () -> Unit,
    boLocDangApDung: Int
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = truyVan,
            onValueChange = onTruyVanThayDoi,
            modifier = Modifier.weight(1f),
            placeholder = { Text("Tìm công thức...") },
            leadingIcon = {
                Icon(imageVector = Icons.Filled.Search, contentDescription = null)
            },
            trailingIcon = {
                if (truyVan.isNotEmpty()) {
                    IconButton(onClick = { onTruyVanThayDoi("") }) {
                        Icon(imageVector = Icons.Filled.Close, contentDescription = "Xóa")
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(24.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
        )

        Box {
            IconButton(
                onClick = onBamBoLoc,
                modifier = Modifier.size(48.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Tune,
                    contentDescription = "Bộ lọc",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
            if (boLocDangApDung > 0) {
                Surface(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                        .size(16.dp),
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primary
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "$boLocDangApDung",
                            color = MaterialTheme.colorScheme.onPrimary,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LocDangApDung(
    filter: FilterState,
    onXoa: () -> Unit
) {
    val danhSach = buildList {
        addAll(filter.danhMuc)
        addAll(filter.amThuc)
        filter.cheDoAn?.let { add(it) }
    }

    if (danhSach.isEmpty()) return

    LazyRow(
        modifier = Modifier.padding(vertical = 4.dp),
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            AssistChip(
                onClick = onXoa,
                label = { Text("Xóa tất cả", fontSize = 12.sp) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp)
                    )
                }
            )
        }
        items(danhSach) { muc ->
            AssistChip(
                onClick = { },
                label = { Text(muc, fontSize = 12.sp) },
                trailingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Xóa",
                        modifier = Modifier.size(14.dp)
                    )
                }
            )
        }
    }
}

@Composable
private fun GoiYBanDau(
    ganDay: List<String>,
    phoBien: List<String>,
    nguyenLieu: List<String>,
    onChon: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(vertical = 16.dp)
    ) {
        if (ganDay.isNotEmpty()) {
            item {
                TieuDePhan(
                    icon = Icons.Filled.History,
                    tieuDe = "Tìm kiếm gần đây"
                )
            }
            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(ganDay) { tuKhoa ->
                        AssistChip(
                            onClick = { onChon(tuKhoa) },
                            label = { Text(tuKhoa) },
                            colors = AssistChipDefaults.assistChipColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
        }

        item {
            TieuDePhan(
                icon = Icons.Filled.LocalFireDepartment,
                tieuDe = "Phổ biến"
            )
        }

        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(phoBien) { mon ->
                    AssistChip(
                        onClick = { onChon(mon) },
                        label = { Text(mon) }
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        item {
            TieuDePhan(
                icon = Icons.Filled.Restaurant,
                tieuDe = "Nguyên liệu thịnh hành"
            )
        }

        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(nguyenLieu) { nl ->
                    FilterChip(
                        selected = false,
                        onClick = { onChon(nl) },
                        label = { Text(nl) },
                        colors = FilterChipDefaults.filterChipColors()
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                BodyText(
                    text = "💡 Gợi ý: Bấm vào thẻ để tìm nhanh",
                    kichThuoc = 13.sp,
                    mau = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun TieuDePhan(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tieuDe: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(18.dp)
        )
        BodyText(
            text = tieuDe,
            kichThuoc = 15.sp,
            dam = true,
            mau = MaterialTheme.colorScheme.onSurface
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
        item {
            BodyText(
                text = "${ds.size} kết quả",
                kichThuoc = 13.sp,
                mau = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        items(ds) { congThuc ->
            CongThucCard(
                duLieu = congThuc,
                khiBam = { onBamCongThuc(congThuc.id) },
                variant = CardVariant.LARGE
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BoLocBottomSheet(
    filter: FilterState,
    onDong: () -> Unit,
    onApDung: (FilterState) -> Unit
) {
    var nhapChinh by remember { mutableStateOf(filter) }

    androidx.compose.material3.ModalBottomSheet(
        onDismissRequest = onDong,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    BodyText(
                        text = "Bộ lọc",
                        kichThuoc = 20.sp,
                        dam = true
                    )
                    Text(
                        text = "Đặt lại",
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 14.sp,
                        modifier = Modifier
                            .padding(8.dp)
                            .then(
                                Modifier
                            )
                    )
                }
            }

            item {
                BoLocSectionTieuDe("Danh mục")
            }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val ds = listOf("Món chính", "Tráng miệng", "Canh", "Salad", "Lẩu", "Nướng")
                    items(ds) { ten ->
                        FilterChip(
                            selected = ten in nhapChinh.danhMuc,
                            onClick = {
                                nhapChinh = nhapChinh.copy(
                                    danhMuc = if (ten in nhapChinh.danhMuc)
                                        nhapChinh.danhMuc - ten
                                    else
                                        nhapChinh.danhMuc + ten
                                )
                            },
                            label = { Text(ten) }
                        )
                    }
                }
            }

            item {
                BoLocSectionTieuDe("Ẩm thực")
            }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val ds = listOf("Việt Nam", "Châu Á", "Phương Tây", "Ý", "Nhật", "Hàn", "Thái")
                    items(ds) { ten ->
                        FilterChip(
                            selected = ten in nhapChinh.amThuc,
                            onClick = {
                                nhapChinh = nhapChinh.copy(
                                    amThuc = if (ten in nhapChinh.amThuc)
                                        nhapChinh.amThuc - ten
                                    else
                                        nhapChinh.amThuc + ten
                                )
                            },
                            label = { Text(ten) }
                        )
                    }
                }
            }

            item {
                BoLocSectionTieuDe("Chế độ ăn")
            }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val ds = listOf("Bình thường", "Chay", "Thuần chay", "Keto", "Ít carb")
                    items(ds) { ten ->
                        FilterChip(
                            selected = nhapChinh.cheDoAn == ten,
                            onClick = {
                                nhapChinh = nhapChinh.copy(
                                    cheDoAn = if (nhapChinh.cheDoAn == ten) null else ten
                                )
                            },
                            label = { Text(ten) }
                        )
                    }
                }
            }

            item {
                BoLocSectionTieuDe("Thời gian nấu (tối đa)")
            }
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(15, 30, 60, 120, 240).forEach { phut ->
                        FilterChip(
                            selected = nhapChinh.thoiGianToiDa == phut,
                            onClick = { nhapChinh = nhapChinh.copy(thoiGianToiDa = phut) },
                            label = { Text(if (phut < 60) "${phut}p" else "${phut / 60}h") }
                        )
                    }
                }
            }

            item {
                BoLocSectionTieuDe("Khẩu phần")
            }
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(1, 2, 4, 6, 8).forEach { nguoi ->
                        FilterChip(
                            selected = nhapChinh.khauPhan == nguoi,
                            onClick = { nhapChinh = nhapChinh.copy(khauPhan = nguoi) },
                            label = { Text("${nguoi}ng") }
                        )
                    }
                }
            }

            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    androidx.compose.material3.OutlinedButton(
                        onClick = onDong,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Hủy")
                    }
                    androidx.compose.material3.Button(
                        onClick = { onApDung(nhapChinh) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Áp dụng")
                    }
                }
            }
        }
    }
}

@Composable
private fun BoLocSectionTieuDe(text: String) {
    BodyText(
        text = text,
        kichThuoc = 14.sp,
        dam = true,
        mau = MaterialTheme.colorScheme.onSurface
    )
}
