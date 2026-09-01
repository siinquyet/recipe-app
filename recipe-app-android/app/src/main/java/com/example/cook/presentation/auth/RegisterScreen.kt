package com.example.cook.presentation.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.TitleText

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onDangKyThanhCong: () -> Unit,
    onQuayLaiDangNhap: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var matKhau by remember { mutableStateOf("") }
    var tenHienThi by remember { mutableStateOf("") }
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        TitleText(text = "Tạo tài khoản", kichThuoc = 28.sp)
        BodyText(text = "Bắt đầu hành trình nấu ăn", mau = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = tenHienThi,
            onValueChange = { tenHienThi = it },
            label = { Text("Tên hiển thị") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = matKhau,
            onValueChange = { matKhau = it },
            label = { Text("Mật khẩu") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation()
        )
        Spacer(modifier = Modifier.height(16.dp))

        when (uiState) {
            is AuthUiState.DangXuLy -> CircularProgressIndicator()
            is AuthUiState.Loi -> {
                val loi = uiState as AuthUiState.Loi
                BodyText(text = loi.thongDiep, mau = MaterialTheme.colorScheme.error)
            }
            is AuthUiState.ThanhCong -> onDangKyThanhCong()
            else -> {}
        }

        Button(
            onClick = { viewModel.dangKy(email, matKhau, tenHienThi) },
            modifier = Modifier.fillMaxWidth(),
            enabled = uiState !is AuthUiState.DangXuLy
        ) {
            Text("Đăng ký")
        }
        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onQuayLaiDangNhap) {
            Text("Đã có tài khoản? Đăng nhập")
        }
    }
}
