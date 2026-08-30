package com.example.cook.presentation.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.ui.theme.CookTheme

@Composable
fun TrangThaiLoi(
    modifier: Modifier = Modifier,
    thongDiep: String = "Có lỗi xảy ra",
    maLoi: String = "",
    khiThuLai: () -> Unit
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Default.ErrorOutline,
                contentDescription = "Lỗi",
                tint = CookTheme.colorScheme.error,
                modifier = Modifier.size(64.dp)
            )
            BodyText(
                text = thongDiep,
                kichThuoc = 18.sp,
                dam = true,
                canLe = androidx.compose.ui.text.TextAlign.Center
            )
            if (maLoi.isNotBlank()) {
                CaptionText(text = "Mã lỗi: $maLoi", mau = CookTheme.colorScheme.onSurfaceVariant)
            }
            Button(
                onClick = khiThuLai,
                colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = CookTheme.colorScheme.error)
            ) {
                Text(text = "Thử lại", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = CookTheme.colorScheme.onError)
            }
        }
    }
}

@Composable
fun TrangThaiLoiNho(
    modifier: Modifier = Modifier,
    thongDiep: String = "Có lỗi xảy ra",
    khiThuLai: () -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp)
            .background(
                color = CookTheme.colorScheme.errorContainer,
                shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp)
            )
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.ErrorOutline,
                    contentDescription = "Lỗi",
                    tint = CookTheme.colorScheme.onErrorContainer
                )
                BodyText(text = thongDiep, mau = CookTheme.colorScheme.onErrorContainer)
            }
            Button(
                onClick = khiThuLai,
                colors = androidx.compose.material3.ButtonDefaults.textButtonColors(contentColor = CookTheme.colorScheme.onErrorContainer)
            ) {
                Text(text = "Thử lại", fontWeight = FontWeight.Medium)
            }
        }
    }
}