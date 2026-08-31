package com.example.cook.presentation.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cook.ui.theme.CookTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.ui.text.font.FontWeight

@Composable
fun TrangThaiRong(
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector = Icons.Filled.Inbox,
    tieuDe: String = "Không có dữ liệu",
    thongDiep: String = "Hiện tại không có nội dung để hiển thị",
    hanhDong: String? = null,
    khiBamHanhDong: (() -> Unit)? = null
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
                imageVector = icon,
                contentDescription = "",
                tint = CookTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                modifier = Modifier.size(80.dp)
            )
            BodyText(
                text = tieuDe,
                kichThuoc = 20.sp,
                dam = true,
                canLe = TextAlign.Center,
                mau = CookTheme.colorScheme.onSurface
            )
            BodyText(
                text = thongDiep,
                kichThuoc = 15.sp,
                canLe = TextAlign.Center,
                mau = CookTheme.colorScheme.onSurfaceVariant
            )
            hanhDong?.let { text ->
                khiBamHanhDong?.let { onClick ->
                    Button(onClick = onClick) {
                        Text(text = text, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
fun TrangThaiRongNho(
    modifier: Modifier = Modifier,
    thongDiep: String = "Không có dữ liệu"
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp)
            .background(
                color = CookTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(8.dp)
            )
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.Inbox,
                contentDescription = "",
                tint = CookTheme.colorScheme.onSurfaceVariant
            )
            BodyText(text = thongDiep, mau = CookTheme.colorScheme.onSurfaceVariant)
        }
    }
}