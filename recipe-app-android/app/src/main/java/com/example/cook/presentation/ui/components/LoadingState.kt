package com.example.cook.presentation.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.ui.theme.CookTheme

@Composable
fun TrangThaiDangTai(
    modifier: Modifier = Modifier,
    thongDiep: String = "Đang tải...",
    kichThuoc: androidx.compose.ui.unit.Dp = 48.dp
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(kichThuoc),
                color = CookTheme.colorScheme.primary,
                strokeWidth = 4.dp
            )
            BodyText(text = thongDiep, kichThuoc = 16.sp, mau = CookTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun TrangThaiDangTaiNho(
    modifier: Modifier = Modifier,
    thongDiep: String = ""
) {
    Row(
        modifier = modifier.padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(24.dp),
            color = CookTheme.colorScheme.primary,
            strokeWidth = 3.dp
        )
        if (thongDiep.isNotBlank()) {
            BodyText(text = thongDiep, kichThuoc = 14.sp, mau = CookTheme.colorScheme.onSurfaceVariant)
        }
    }
}