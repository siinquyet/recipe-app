package com.example.cook.presentation.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.presentation.ui.components.BodyText
import com.example.cook.presentation.ui.components.TitleText

@Composable
fun ForgotPasswordScreen(
    onGuiYeuCau: (String) -> Unit,
    onQuayLai: () -> Unit
) {
    var email by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        TitleText(text = "Quên mật khẩu", kichThuoc = 28.sp)
        BodyText(text = "Nhập email để nhận hướng dẫn đặt lại", mau = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = { onGuiYeuCau(email) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Gửi yêu cầu")
        }
        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onQuayLai) {
            Text("Quay lại đăng nhập")
        }
    }
}
