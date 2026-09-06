package com.example.cook.presentation.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.ui.theme.ButtonDark
import com.example.cook.ui.theme.ButtonOnDark

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onDangNhapThanhCong: () -> Unit,
    onChuyenDangKy: () -> Unit,
    onQuenMatKhau: () -> Unit,
    onDungThu: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var matKhau by remember { mutableStateOf("") }
    var hienMatKhau by remember { mutableStateOf(false) }
    val uiState by viewModel.uiState.collectAsState()

    AuthScaffold {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(40.dp))

            LogoHeader()

            Spacer(modifier = Modifier.height(48.dp))

            FormCard {
                Text(
                    text = "Chào mừng trở lại",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Đăng nhập để tiếp tục nấu ăn",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Filled.Email, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = matKhau,
                    onValueChange = { matKhau = it },
                    label = { Text("Mật khẩu") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Filled.Lock, contentDescription = null)
                    },
                    trailingIcon = {
                        IconButton(onClick = { hienMatKhau = !hienMatKhau }) {
                            Icon(
                                imageVector = if (hienMatKhau) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                contentDescription = if (hienMatKhau) "Ẩn mật khẩu" else "Hiện mật khẩu"
                            )
                        }
                    },
                    visualTransformation = if (hienMatKhau) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                TextButton(
                    onClick = onQuenMatKhau,
                    modifier = Modifier
                        .align(Alignment.End)
                        .padding(top = 4.dp)
                ) {
                    Text("Quên mật khẩu?", fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.height(8.dp))

                when (uiState) {
                    is AuthUiState.DangXuLy -> {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(54.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(strokeWidth = 2.dp)
                        }
                    }
                    is AuthUiState.Loi -> {
                        val loi = uiState as AuthUiState.Loi
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp),
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.errorContainer
                        ) {
                            Text(
                                text = loi.thongDiep,
                                color = MaterialTheme.colorScheme.onErrorContainer,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                    is AuthUiState.ThanhCong -> onDangNhapThanhCong()
                    else -> {}
                }

                Button(
                    onClick = { viewModel.dangNhap(email, matKhau) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ButtonDark,
                        contentColor = ButtonOnDark
                    ),
                    enabled = uiState !is AuthUiState.DangXuLy
                ) {
                    Text("Đăng nhập", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(16.dp))

                DividerWithText(text = "Hoặc tiếp tục với")

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    SocialButton(icon = "G", label = "Google", modifier = Modifier.weight(1f))
                    SocialButton(icon = "f", label = "Facebook", modifier = Modifier.weight(1f))
                    SocialButton(icon = "", label = "Apple", modifier = Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedButton(
                    onClick = onDungThu,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    enabled = uiState !is AuthUiState.DangXuLy
                ) {
                    Text("Dùng thử không cần đăng nhập", fontSize = 14.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Chưa có tài khoản? ",
                    color = Color.White,
                    fontSize = 14.sp
                )
                Text(
                    text = "Đăng ký",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clickable { onChuyenDangKy() }
                        .padding(vertical = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
