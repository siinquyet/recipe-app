package com.example.cook.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val HeMauToi = darkColorScheme(
    primary = Tim80,
    secondary = TimXam80,
    tertiary = Hong80
)

private val HeMauSang = lightColorScheme(
    primary = Tim40,
    secondary = TimXam40,
    tertiary = Hong40
)

@Composable
fun CookTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val heMau = if (darkTheme) HeMauToi else HeMauSang

    MaterialTheme(
        colorScheme = heMau,
        typography = BoKyTu,
        content = content
    )
}