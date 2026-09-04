package com.example.cook.presentation.auth

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.ui.theme.ButtonDark
import com.example.cook.ui.theme.ButtonOnDark

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

    AuthScaffold {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 32.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Tạo tài khoản",
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 16.dp)
                )
                Text(
                    text = "Bắt đầu hành trình nấu ăn",
                    color = Color.White.copy(alpha = 0.85f),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )

                Spacer(modifier = Modifier.height(32.dp))

                val fieldColors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color.White,
                    unfocusedBorderColor = Color.White.copy(alpha = 0.7f),
                    cursorColor = Color.White,
                    focusedLabelColor = Color.White,
                    unfocusedLabelColor = Color.White.copy(alpha = 0.7f)
                )

                OutlinedTextField(
                    value = tenHienThi,
                    onValueChange = { tenHienThi = it },
                    label = { Text("Tên hiển thị") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = fieldColors
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = fieldColors
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = matKhau,
                    onValueChange = { matKhau = it },
                    label = { Text("Mật khẩu") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    shape = RoundedCornerShape(16.dp),
                    colors = fieldColors
                )
                Spacer(modifier = Modifier.height(24.dp))

                when (uiState) {
                    is AuthUiState.DangXuLy -> CircularProgressIndicator(color = Color.White)
                    is AuthUiState.Loi -> {
                        val loi = uiState as AuthUiState.Loi
                        Text(
                            text = loi.thongDiep,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }
                    is AuthUiState.ThanhCong -> onDangKyThanhCong()
                    else -> {}
                }

                Button(
                    onClick = { viewModel.dangKy(email, matKhau, tenHienThi) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ButtonDark,
                        contentColor = ButtonOnDark
                    ),
                    enabled = uiState !is AuthUiState.DangXuLy,
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("Đăng ký", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Đã có tài khoản? Đăng nhập",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier
                        .clickable { onQuayLaiDangNhap() }
                        .padding(vertical = 8.dp)
                )
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}
