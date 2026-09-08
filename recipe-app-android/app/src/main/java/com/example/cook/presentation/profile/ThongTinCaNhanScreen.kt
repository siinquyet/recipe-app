package com.example.cook.presentation.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Cake
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.data.session.AuthGate
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.TitleText
import kotlinx.coroutines.launch

// BR-PROFILE: Ngày sinh lưu DD/MM/YYYY, Tên hiển thị 2-50 ký tự
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThongTinCaNhanScreen(
    authGate: AuthGate,
    onBack: () -> Unit
) {
    val nguoiDung = authGate.layNguoiDungHienTai()
    var tenHienThi by remember { mutableStateOf(nguoiDung?.tenHienThi ?: "") }
    var ngaySinh by remember { mutableStateOf("") }
    var loiTen by remember { mutableStateOf<String?>(null) }
    var loiNgaySinh by remember { mutableStateOf<String?>(null) }
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { TitleText(text = "Thông tin cá nhân") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Quay lại"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbar) }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .background(
                        color = MaterialTheme.colorScheme.primary,
                        shape = CircleShape
                    )
                    .align(Alignment.CenterHorizontally),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = (tenHienThi.firstOrNull()?.uppercase() ?: "?"),
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            }

            OutlinedTextField(
                value = tenHienThi,
                onValueChange = {
                    tenHienThi = it
                    loiTen = null
                },
                label = { Text("Tên hiển thị") },
                leadingIcon = {
                    Icon(imageVector = Icons.Filled.Person, contentDescription = null)
                },
                isError = loiTen != null,
                supportingText = { loiTen?.let { BodyText(text = it, kichThuoc = 12.sp, mau = MaterialTheme.colorScheme.error) } },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = nguoiDung?.email ?: "Chưa đăng nhập",
                onValueChange = {},
                label = { Text("Email") },
                leadingIcon = {
                    Icon(imageVector = Icons.Filled.Email, contentDescription = null)
                },
                readOnly = true,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = ngaySinh,
                onValueChange = {
                    ngaySinh = it
                    loiNgaySinh = null
                },
                label = { Text("Ngày sinh (DD/MM/YYYY)") },
                leadingIcon = {
                    Icon(imageVector = Icons.Filled.Cake, contentDescription = null)
                },
                placeholder = { Text("25/08/2000") },
                isError = loiNgaySinh != null,
                supportingText = { loiNgaySinh?.let { BodyText(text = it, kichThuoc = 12.sp, mau = MaterialTheme.colorScheme.error) } },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = {
                    var hopLe = true
                    if (tenHienThi.trim().length !in 2..50) {
                        loiTen = "Tên hiển thị 2-50 ký tự"
                        hopLe = false
                    }
                    if (ngaySinh.isNotBlank() && !kiemTraNgaySinh(ngaySinh)) {
                        loiNgaySinh = "Ngày sinh đúng DD/MM/YYYY"
                        hopLe = false
                    }
                    if (hopLe) {
                        scope.launch { snackbar.showSnackbar("Đã lưu thông tin") }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Lưu", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

private val mauNgaySinh = Regex("""^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}$""")

fun kiemTraNgaySinh(giaTri: String): Boolean = mauNgaySinh.matches(giaTri.trim())
