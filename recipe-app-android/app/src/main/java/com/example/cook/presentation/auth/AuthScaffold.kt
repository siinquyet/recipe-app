package com.example.cook.presentation.auth

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.example.cook.ui.theme.TealBackground
import com.example.cook.ui.theme.TealPatternStroke

// BR-AUTH-08: Background Recipely — Teal + pattern sóng trang trí
@Composable
fun AuthScaffold(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(TealBackground)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val strokeWidth = 2.dp.toPx()
            val stroke = Stroke(width = strokeWidth)
            val mau = TealPatternStroke

            val w = size.width
            val h = size.height

            val song1 = Path().apply {
                moveTo(-40f, h * 0.85f)
                cubicTo(w * 0.2f, h * 0.7f, w * 0.4f, h * 1.05f, w * 0.6f, h * 0.9f)
                cubicTo(w * 0.8f, h * 0.75f, w * 1.05f, h * 0.95f, w + 40f, h * 0.8f)
            }
            drawPath(song1, mau, style = stroke)

            val song2 = Path().apply {
                moveTo(-40f, h * 0.12f)
                cubicTo(w * 0.15f, h * 0.18f, w * 0.3f, h * 0.02f, w * 0.5f, h * 0.1f)
                cubicTo(w * 0.7f, h * 0.18f, w * 0.9f, h * 0.0f, w + 40f, h * 0.08f)
            }
            drawPath(song2, mau, style = stroke)

            val song3 = Path().apply {
                moveTo(-40f, h * 0.55f)
                cubicTo(w * 0.2f, h * 0.45f, w * 0.35f, h * 0.62f, w * 0.55f, h * 0.52f)
                cubicTo(w * 0.75f, h * 0.42f, w * 0.9f, h * 0.58f, w + 40f, h * 0.5f)
            }
            drawPath(song3, mau, style = stroke)

            val ringRadius = w * 0.35f
            drawCircle(
                color = mau,
                radius = ringRadius,
                center = Offset(w * 0.15f, h * 0.2f),
                style = stroke
            )
            drawCircle(
                color = mau,
                radius = ringRadius * 0.55f,
                center = Offset(w * 0.85f, h * 0.78f),
                style = stroke
            )
        }
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
        ) {
            content()
        }
    }
}
