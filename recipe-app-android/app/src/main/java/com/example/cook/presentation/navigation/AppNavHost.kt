package com.example.cook.presentation.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.cook.data.session.AuthGate
import com.example.cook.data.session.TrangThaiXacThuc
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.CaptionText
import com.example.cook.presentation.ui.components.TitleText

private const val ROUTE_DANG_NHAP = "dang_nhap"

@Composable
fun AppNavHost(
    authGate: AuthGate,
    modifier: androidx.compose.ui.Modifier = androidx.compose.ui.Modifier,
    navController: NavHostController = rememberNavController()
) {
    val trangThai by authGate.trangThai.collectAsState()
    val startDestination = when (trangThai) {
        TrangThaiXacThuc.DangChoKhoiTao -> ROUTE_DANG_NHAP
        TrangThaiXacThuc.DaDangNhap -> "trang_chu"
        TrangThaiXacThuc.Khach -> "trang_chu"
        TrangThaiXacThuc.ChuaDangNhap -> ROUTE_DANG_NHAP
    }

    LaunchedEffect(trangThai) {
        when (trangThai) {
            TrangThaiXacThuc.DaDangNhap, TrangThaiXacThuc.Khach -> {
                navController.navigate("trang_chu") {
                    popUpTo(0) { inclusive = true }
                    launchSingleTop = true
                }
            }
            TrangThaiXacThuc.ChuaDangNhap -> {
                navController.navigate(ROUTE_DANG_NHAP) {
                    popUpTo(0) { inclusive = true }
                    launchSingleTop = true
                }
            }
            TrangThaiXacThuc.DangChoKhoiTao -> Unit
        }
    }

    NavHost(navController, startDestination = startDestination, modifier = modifier) {
        themDuongDan(navController, authGate)
    }
}

data class TabItem(
    val route: String,
    val ten: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val iconSelected: androidx.compose.ui.graphics.vector.ImageVector? = null
)

private val bottomTabRoutes = setOf("trang_chu", "tim_kiem", "ke_hoach_an", "danh_sach_di_cho", "ho_so")

fun layRouteTabDangChon(routeHienTai: String?): String {
    if (routeHienTai != null && routeHienTai in bottomTabRoutes) return routeHienTai
    return "trang_chu"
}

@Composable
@OptIn(ExperimentalMaterial3Api::class)
fun BottomNavigationBar(navController: NavHostController) {
    val tabs = listOf(
        TabItem(route = "trang_chu", ten = "Trang chủ", icon = Icons.Filled.Home, iconSelected = Icons.Filled.Home),
        TabItem(route = "tim_kiem", ten = "Tìm kiếm", icon = Icons.Filled.Search, iconSelected = Icons.Filled.Search),
        TabItem(route = "ke_hoach_an", ten = "Kế hoạch", icon = Icons.Filled.CalendarMonth, iconSelected = Icons.Filled.CalendarMonth),
        TabItem(route = "danh_sach_di_cho", ten = "Đi chợ", icon = Icons.Filled.ShoppingCart, iconSelected = Icons.Filled.ShoppingCart),
        TabItem(route = "ho_so", ten = "Hồ sơ", icon = Icons.Filled.Person, iconSelected = Icons.Filled.Person)
    )

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = layRouteTabDangChon(backStackEntry?.destination?.route)

    NavigationBar(
        modifier = Modifier,
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface
    ) {
        tabs.forEach { tab ->
            val isSelected = currentRoute == tab.route
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = if (isSelected) tab.iconSelected ?: tab.icon else tab.icon,
                        contentDescription = tab.ten,
                        tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                label = { CaptionText(text = tab.ten) },
                selected = isSelected,
                onClick = {
                    if (!isSelected) {
                        navController.navigate(tab.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                alwaysShowLabel = true
            )
        }
    }
}

@Composable
fun BannerKhach(onDangNhap: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        color = MaterialTheme.colorScheme.secondaryContainer,
        contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                BodyText(text = "Chế độ khách", kichThuoc = 14.sp, dam = true)
                BodyText(text = "Một số tính năng bị giới hạn", kichThuoc = 12.sp)
            }
            Text(
                text = "Đăng nhập",
                modifier = Modifier
                    .clickable { onDangNhap() }
                    .background(
                        color = MaterialTheme.colorScheme.primary,
                        shape = RoundedCornerShape(8.dp)
                    )
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                color = MaterialTheme.colorScheme.onPrimary,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

// Screen composables
@Composable
fun TrangChuScreen(navController: NavHostController, authGate: AuthGate) {
    val trangThai by authGate.trangThai.collectAsState()
    Scaffold(
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
            BodyText(
                text = "Trang Chủ - Danh sách công thức",
                kichThuoc = 24.sp,
                dam = true,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun TimKiemScreen(navController: NavHostController) {
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            BodyText(
                text = "Tìm Kiếm Công Thức",
                kichThuoc = 24.sp,
                dam = true,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun KeHoachAnScreen(navController: NavHostController) {
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            BodyText(
                text = "Kế Hoạch Ăn Tuần",
                kichThuoc = 24.sp,
                dam = true,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun DanhSachDiChoScreen(navController: NavHostController) {
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            BodyText(
                text = "Danh Sách Đi Chợ",
                kichThuoc = 24.sp,
                dam = true,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun HoSoScreen(navController: NavHostController) {
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            BodyText(
                text = "Hồ Sơ Người Dùng",
                kichThuoc = 24.sp,
                dam = true,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChiTietCongThucScreen(id: String, nguon: String, navController: NavHostController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { TitleText(text = "Chi Tiết Công Thức") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
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
            BodyText(
                text = "Chi Tiết: $id ($nguon)",
                kichThuoc = 18.sp,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaoCongThucScreen(idChinhSua: String?, navController: NavHostController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { TitleText(text = idChinhSua?.let { "Chỉnh Sửa Công Thức" } ?: "Tạo Công Thức Mới") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Quay lại"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            BodyText(
                text = "Màn hình tạo/chỉnh sửa công thức",
                kichThuoc = 18.sp,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun DangNhapScreen(navController: NavHostController) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        BodyText(
            text = "Màn hình Đăng Nhập",
            kichThuoc = 24.sp,
            dam = true
        )
    }
}

@Composable
fun DangKyScreen(navController: NavHostController) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        BodyText(
            text = "Màn hình Đăng Ký",
            kichThuoc = 24.sp,
            dam = true
        )
    }
}

@Composable
fun QuenMatKhauScreen(navController: NavHostController) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        BodyText(
            text = "Màn hình Quên Mật Khẩu",
            kichThuoc = 24.sp,
            dam = true
        )
    }
}
