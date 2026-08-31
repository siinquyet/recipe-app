package com.example.cook.presentation.ui.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.sp

@Composable
fun NumberText(
    value: Long,
    donVi: String = "",
    modifier: Modifier = Modifier,
    kichThuoc: androidx.compose.ui.unit.TextUnit = 16.sp,
    canLe: TextAlign = TextAlign.End,
    mau: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.onSurface
) {
    Text(
        text = "${value.formatVn()} $donVi".trim(),
        modifier = modifier,
        textAlign = canLe,
        fontSize = kichThuoc,
        color = mau
    )
}

@Composable
fun NumberText(
    value: Double,
    donVi: String = "",
    modifier: Modifier = Modifier,
    kichThuoc: androidx.compose.ui.unit.TextUnit = 16.sp,
    canLe: TextAlign = TextAlign.End,
    mau: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.onSurface
) {
    Text(
        text = "${value.formatVn()} $donVi".trim(),
        modifier = modifier,
        textAlign = canLe,
        fontSize = kichThuoc,
        color = mau
    )
}

@Composable
fun NumberText(
    value: String,
    donVi: String = "",
    modifier: Modifier = Modifier,
    kichThuoc: androidx.compose.ui.unit.TextUnit = 16.sp,
    canLe: TextAlign = TextAlign.End,
    mau: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.onSurface
) {
    Text(
        text = "${value} $donVi".trim(),
        modifier = modifier,
        textAlign = canLe,
        fontSize = kichThuoc,
        color = mau
    )
}

fun Long.formatVn(): String = java.text.NumberFormat.getNumberInstance(java.util.Locale("vi", "VN")).format(this)

fun Double.formatVn(): String = java.text.NumberFormat.getNumberInstance(java.util.Locale("vi", "VN")).format(this)