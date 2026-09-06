package com.example.cook.presentation.mealplan

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.FreeBreakfast
import androidx.compose.material.icons.filled.LunchDining
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.example.cook.data.api.KeHoachAn
import com.example.cook.data.api.MonTrongKeHoach
import com.example.cook.presentation.navigation.BottomNavigationBar
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.TitleText
import com.example.cook.presentation.ui.components.TrangThaiDangTai
import com.example.cook.presentation.ui.components.TrangThaiLoi
import com.example.cook.presentation.ui.components.TrangThaiRong
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.TemporalAdjusters

private enum class BuoiAn(
    val nhan: String,
    val icon: ImageVector
) {
    Sang("Sáng", Icons.Filled.FreeBreakfast),
    Trua("Trưa", Icons.Filled.LunchDining),
    Toi("Tối", Icons.Filled.Bedtime)
}

private data class MonTrongKeHoachRong(
    val buoi: BuoiAn,
    val congThuc: MonTrongKeHoach? = null
)

private data class NgayTrongTuan(
    val ngay: LocalDate,
    val dsMon: Map<BuoiAn, MonTrongKeHoachRong>
)

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
    var buoiDangChon by remember { mutableStateOf<Pair<LocalDate, BuoiAn>?>(null) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var keHoachDangChonId by remember { mutableStateOf<String?>(null) }
    var tuanBatDau by remember { mutableStateOf(LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))) }

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
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
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
                is MealPlanUiState.ThanhCong -> {
                    val keHoachHienTai = state.danhSach.firstOrNull { it.id == keHoachDangChonId }
                        ?: state.danhSach.firstOrNull()

                    if (keHoachHienTai == null) {
                        TrangThaiRong(
                            tieuDe = "Chưa có kế hoạch",
                            thongDiep = "Bấm nút bên dưới để tạo",
                            hanhDong = "Tạo ngay",
                            khiBamHanhDong = { hienForm = true }
                        )
                    } else {
                        NoiDungKeHoach(
                            keHoach = keHoachHienTai,
                            danhSachKeHoach = state.danhSach,
                            keHoachDangChonId = keHoachHienTai.id,
                            onChonKeHoach = { keHoachDangChonId = it },
                            tuanBatDau = tuanBatDau,
                            onDoiTuan = { tuanBatDau = it },
                            onBamCell = { ngay, buoi ->
                                buoiDangChon = ngay to buoi
                            }
                        )
                    }
                }
            }
        }
    }

    if (hienForm) {
        ModalBottomSheet(
            onDismissRequest = { hienForm = false },
            sheetState = sheetState,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
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

    buoiDangChon?.let { (ngay, buoi) ->
        ModalBottomSheet(
            onDismissRequest = { buoiDangChon = null },
            sheetState = sheetState,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            ChonCongThucChoBuoi(
                buoi = buoi,
                ngay = ngay,
                onChon = { /* TODO thêm vào buoi */ },
                onDong = { buoiDangChon = null }
            )
        }
    }
}

@Composable
private fun NoiDungKeHoach(
    keHoach: KeHoachAn,
    danhSachKeHoach: List<KeHoachAn>,
    keHoachDangChonId: String,
    onChonKeHoach: (String) -> Unit,
    tuanBatDau: LocalDate,
    onDoiTuan: (LocalDate) -> Unit,
    onBamCell: (LocalDate, BuoiAn) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        if (danhSachKeHoach.size > 1) {
            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(danhSachKeHoach) { kh ->
                        FilterChip(
                            selected = kh.id == keHoachDangChonId,
                            onClick = { onChonKeHoach(kh.id) },
                            label = { Text(kh.ten) }
                        )
                    }
                }
            }
        }

        item {
            ThanhDieuHuongTuan(
                tuanBatDau = tuanBatDau,
                onDoiTuan = onDoiTuan
            )
        }

        val dsNgay = (0..6).map { offset ->
            val ngay = tuanBatDau.plusDays(offset.toLong())
            val dsMonTheoBuoi = BuoiAn.values().associateWith { buoi ->
                val mon = keHoach.cacMon.firstOrNull { mon ->
                    mon.ngay == ngay.toString() && mon.loaiBuoiAn == buoi.name
                }
                if (mon != null) MonTrongKeHoachRong(buoi, mon) else MonTrongKeHoachRong(buoi)
            }
            NgayTrongTuan(ngay, dsMonTheoBuoi)
        }

        items(dsNgay) { ngayTrongTuan ->
            HangNgay(
                ngay = ngayTrongTuan.ngay,
                dsMon = ngayTrongTuan.dsMon,
                onBamCell = onBamCell
            )
        }
    }
}

@Composable
private fun ThanhDieuHuongTuan(
    tuanBatDau: LocalDate,
    onDoiTuan: (LocalDate) -> Unit
) {
    val tuanKetThuc = tuanBatDau.plusDays(6)
    val formatter = DateTimeFormatter.ofPattern("dd/MM")
    val isTuanNay = tuanBatDau == LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        IconButton(onClick = { onDoiTuan(tuanBatDau.minusWeeks(1)) }) {
            Icon(
                imageVector = Icons.Filled.ChevronLeft,
                contentDescription = "Tuần trước"
            )
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            BodyText(
                text = "${tuanBatDau.format(formatter)} – ${tuanKetThuc.format(formatter)}",
                kichThuoc = 16.sp,
                dam = true
            )
            TextButton(onClick = { onDoiTuan(LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))) }) {
                Text(
                    text = if (isTuanNay) "Tuần này" else "Về tuần này",
                    fontSize = 12.sp
                )
            }
        }

        IconButton(onClick = { onDoiTuan(tuanBatDau.plusWeeks(1)) }) {
            Icon(
                imageVector = Icons.Filled.ChevronRight,
                contentDescription = "Tuần sau"
            )
        }
    }
}

@Composable
private fun HangNgay(
    ngay: LocalDate,
    dsMon: Map<BuoiAn, MonTrongKeHoachRong>,
    onBamCell: (LocalDate, BuoiAn) -> Unit
) {
    val today = LocalDate.now()
    val isToday = ngay == today
    val dayFormatter = DateTimeFormatter.ofPattern("EEEE")
    val dateFormatter = DateTimeFormatter.ofPattern("dd/MM")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                shape = CircleShape,
                color = if (isToday) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
            ) {
                Box(
                    modifier = Modifier.size(40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${ngay.dayOfMonth}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isToday) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Column {
                BodyText(
                    text = ngay.format(dayFormatter),
                    kichThuoc = 14.sp,
                    dam = true
                )
                Text(
                    text = ngay.format(dateFormatter),
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            BuoiAn.values().forEach { buoi ->
                CellBuoiAn(
                    buoi = buoi,
                    mon = dsMon[buoi] ?: MonTrongKeHoachRong(buoi),
                    modifier = Modifier.weight(1f),
                    onClick = { onBamCell(ngay, buoi) }
                )
            }
        }

        HorizontalDivider(
            modifier = Modifier.padding(vertical = 8.dp),
            color = MaterialTheme.colorScheme.outlineVariant
        )
    }
}

@Composable
private fun CellBuoiAn(
    buoi: BuoiAn,
    mon: MonTrongKeHoachRong,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(80.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (mon.congThuc != null)
                MaterialTheme.colorScheme.primaryContainer
            else
                MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    imageVector = buoi.icon,
                    contentDescription = null,
                    tint = if (mon.congThuc != null)
                        MaterialTheme.colorScheme.onPrimaryContainer
                    else
                        MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(14.dp)
                )
                Text(
                    text = buoi.nhan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (mon.congThuc != null)
                        MaterialTheme.colorScheme.onPrimaryContainer
                    else
                        MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (mon.congThuc != null) {
                Text(
                    text = mon.congThuc.id.take(8),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            } else {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = null,
                        modifier = Modifier.size(12.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Thêm",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
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
    var ngayBatDau by remember { mutableStateOf(LocalDate.now().toString()) }
    var ngayKetThuc by remember { mutableStateOf(LocalDate.now().plusDays(6).toString()) }

    val coTheXacNhan = ten.isNotBlank() && ngayBatDau.isNotBlank() && ngayKetThuc.isNotBlank()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
    ) {
        TitleText(text = "Tạo kế hoạch ăn", kichThuoc = 22.sp)
        Spacer(modifier = Modifier.height(20.dp))
        OutlinedTextField(
            value = ten,
            onValueChange = { ten = it },
            label = { Text("Tên kế hoạch") },
            placeholder = { Text("VD: Tuần ăn healthy") },
            leadingIcon = {
                Icon(imageVector = Icons.Filled.CalendarMonth, contentDescription = null)
            },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = ngayBatDau,
            onValueChange = { ngayBatDau = it },
            label = { Text("Ngày bắt đầu") },
            placeholder = { Text("YYYY-MM-DD") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = ngayKetThuc,
            onValueChange = { ngayKetThuc = it },
            label = { Text("Ngày kết thúc") },
            placeholder = { Text("YYYY-MM-DD") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )
        Spacer(modifier = Modifier.height(24.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            androidx.compose.material3.OutlinedButton(
                onClick = onHuy,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
            ) { Text("Hủy") }
            androidx.compose.material3.Button(
                onClick = { onXacNhan(ten.trim(), ngayBatDau.trim(), ngayKetThuc.trim()) },
                modifier = Modifier.weight(1f),
                enabled = coTheXacNhan,
                shape = RoundedCornerShape(12.dp)
            ) { Text("Tạo") }
        }
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChonCongThucChoBuoi(
    buoi: BuoiAn,
    ngay: LocalDate,
    onChon: (String) -> Unit,
    onDong: () -> Unit
) {
    val congThucGanDay = remember {
        listOf(
            "Phở bò Hà Nội",
            "Bún chả Hà Nội",
            "Cơm tấm sườn bì chả",
            "Gỏi cuốn",
            "Bánh mì",
            "Chè ba màu"
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = buoi.icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Column {
                Text(
                    text = buoi.nhan,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = ngay.format(DateTimeFormatter.ofPattern("EEEE, dd/MM/yyyy")),
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        BodyText(
            text = "Gợi ý",
            kichThuoc = 14.sp,
            dam = true,
            mau = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        congThucGanDay.forEach { ten ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { onChon(ten) },
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Filled.Restaurant,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = ten,
                        fontSize = 14.sp,
                        modifier = Modifier.weight(1f)
                    )
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = "Chọn",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            androidx.compose.material3.OutlinedButton(
                onClick = onDong,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
            ) { Text("Đóng") }
        }
    }
}
