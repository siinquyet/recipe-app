package com.example.cook.presentation.ui.components

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.text.TextOverflow
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.example.cook.ui.theme.CookTheme

@Composable
fun BodyText(
    text: String,
    modifier: Modifier = Modifier,
    kichThuoc: androidx.compose.ui.unit.TextUnit = 16.sp,
    canLe: TextAlign = TextAlign.Start,
    mau: androidx.compose.ui.graphics.Color = CookTheme.colorScheme.onSurface,
    soDongToiDa: Int = Int.MAX_VALUE,
    dam: Boolean = false,
    nghieng: Boolean = false
) {
    Text(
        text = text,
        modifier = modifier,
        textAlign = canLe,
        fontSize = kichThuoc,
        color = mau,
        maxLines = soDongToiDa,
        overflow = TextOverflow.Ellipsis,
        fontWeight = if (dam) FontWeight.Bold else FontWeight.Normal,
        fontStyle = if (nghieng) FontStyle.Italic else FontStyle.Normal
    )
}

@Composable
fun TitleText(
    text: String,
    modifier: Modifier = Modifier,
    kichThuoc: androidx.compose.ui.unit.TextUnit = 22.sp,
    mau: androidx.compose.ui.graphics.Color = CookTheme.colorScheme.onSurface
) {
    Text(
        text = text,
        modifier = modifier,
        textAlign = TextAlign.Start,
        fontSize = kichThuoc,
        color = mau,
        fontWeight = FontWeight.Bold
    )
}

@Composable
fun CaptionText(
    text: String,
    modifier: Modifier = Modifier,
    kichThuoc: androidx.compose.ui.unit.TextUnit = 12.sp,
    mau: androidx.compose.ui.graphics.Color = CookTheme.colorScheme.onSurfaceVariant
) {
    Text(
        text = text,
        modifier = modifier,
        textAlign = TextAlign.Start,
        fontSize = kichThuoc,
        color = mau
    )
}