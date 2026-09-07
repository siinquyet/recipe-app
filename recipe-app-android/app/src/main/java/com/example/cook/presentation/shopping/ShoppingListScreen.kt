package com.example.cook.presentation.shopping

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.cook.data.api.DanhSachDiCho
import com.example.cook.data.api.MonTrongDanhSachDiCho
import org.koin.androidx.compose.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShoppingListScreen(
    onBack: () -> Unit,
    onXemChiTiet: (String) -> Unit = {},
    vm: ShoppingListViewModel = koinViewModel()
) {
    val trangThai by vm.trangThai.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var hienModalTao by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { vm.taiLai() }

    LaunchedEffect(trangThai.thongBao) {
        trangThai.thongBao?.let {
            snackbar.showSnackbar(it)
            vm.xoaThongBao()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Danh sách đi chợ") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Quay lại")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { hienModalTao = true },
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("Tạo danh sách") }
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                trangThai.dangTai && trangThai.danhSach.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                trangThai.danhSach.isEmpty() -> {
                    TrangRong(modifier = Modifier.fillMaxSize())
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(trangThai.danhSach, key = { it.id }) { ds ->
                            TheDanhSach(
                                ds = ds,
                                onClick = { onXemChiTiet(ds.id) }
                            )
                        }
                        item { Spacer(modifier = Modifier.height(80.dp)) }
                    }
                }
            }
        }
    }

    if (hienModalTao) {
        ModalTaoDanhSach(
            onDong = { hienModalTao = false },
            onXacNhan = { ten, loaiNguon ->
                vm.taoMoi(ten, loaiNguon)
                hienModalTao = false
            }
        )
    }
}

@Composable
private fun TrangRong(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Filled.ShoppingCart,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.outline,
            modifier = Modifier.size(96.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "Chưa có danh sách đi chợ",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        // BR-UI: Chữ căn trái (TextAlign.Start), cụm căn giữa bằng Column
        Text(
            "Tạo danh sách từ công thức hoặc kế hoạch ăn",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.outline,
            textAlign = TextAlign.Start,
            modifier = Modifier.padding(horizontal = 32.dp)
        )
    }
}

@Composable
private fun TheDanhSach(ds: DanhSachDiCho, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Filled.ShoppingCart,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        ds.ten,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        "${ds.cacMon.size} món",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline
                    )
                }
                TrangThaiBadge(trangThai = ds.trangThai)
            }
            if (ds.cacMon.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(8.dp))
                ds.cacMon.take(3).forEach { mon ->
                    MonMini(mon = mon)
                }
                if (ds.cacMon.size > 3) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "+ ${ds.cacMon.size - 3} món khác",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline
                    )
                }
            }
        }
    }
}

@Composable
private fun TrangThaiBadge(trangThai: String) {
    val (mau, chu) = when (trangThai.uppercase()) {
        "DANG_MUA" -> MaterialTheme.colorScheme.tertiaryContainer to "Đang mua"
        "HOAN_THANH" -> MaterialTheme.colorScheme.secondaryContainer to "Hoàn thành"
        else -> MaterialTheme.colorScheme.errorContainer to "Nháp"
    }
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(mau)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            chu,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 11.sp
        )
    }
}

@Composable
private fun MonMini(mon: MonTrongDanhSachDiCho) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            if (mon.daChon) Icons.Filled.CheckCircle else Icons.Filled.ShoppingCart,
            contentDescription = null,
            tint = if (mon.daChon) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            "${mon.tenGoc} - ${mon.dinhLuong} ${mon.donVi}",
            style = MaterialTheme.typography.bodySmall,
            color = if (mon.daChon) MaterialTheme.colorScheme.outline else MaterialTheme.colorScheme.onSurface,
            textDecoration = if (mon.daChon) androidx.compose.ui.text.style.TextDecoration.LineThrough else null
        )
    }
}

@Composable
private fun ModalTaoDanhSach(
    onDong: () -> Unit,
    onXacNhan: (ten: String, loaiNguon: String) -> Unit
) {
    var ten by remember { mutableStateOf("") }
    // BR-SHOP: loaiNguon gửi backend phải là MANUAL/RECIPE/MEAL_PLAN
    var loaiNguon by remember { mutableStateOf("MANUAL") }

    AlertDialog(
        onDismissRequest = onDong,
        title = { Text("Tạo danh sách mới") },
        text = {
            Column {
                OutlinedTextField(
                    value = ten,
                    onValueChange = { ten = it },
                    label = { Text("Tên danh sách") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text("Loại nguồn", style = MaterialTheme.typography.labelMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ChonLoai("Thủ công", "MANUAL", loaiNguon == "MANUAL") { loaiNguon = it }
                    ChonLoai("Công thức", "RECIPE", loaiNguon == "RECIPE") { loaiNguon = it }
                    ChonLoai("Kế hoạch", "MEAL_PLAN", loaiNguon == "MEAL_PLAN") { loaiNguon = it }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = { if (ten.isNotBlank()) onXacNhan(ten.trim(), loaiNguon) },
                enabled = ten.isNotBlank()
            ) { Text("Tạo") }
        },
        dismissButton = { TextButton(onClick = onDong) { Text("Hủy") } }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChonLoai(label: String, giaTri: String, dangChon: Boolean, onChon: (String) -> Unit) {
    androidx.compose.material3.FilterChip(
        selected = dangChon,
        onClick = { onChon(giaTri) },
        label = { Text(label, fontSize = 12.sp) }
    )
}
