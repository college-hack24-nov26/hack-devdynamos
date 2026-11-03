package com.example.jaldrishti.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = DarkGreen80,
    secondary = GreenGrey80,
    tertiary = LightGreen80,
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White,
    primaryContainer = Color(0xFF2E7D32),
    onPrimaryContainer = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = DarkGreen40,
    secondary = GreenGrey40,
    tertiary = LightGreen40,
    background = Color.White,
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFF1B5E20),
    onSurface = Color(0xFF1B5E20),
    primaryContainer = Color(0xFF1B5E20),
    onPrimaryContainer = Color.White
)

@Composable
fun EcoTraceTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color disabled to enforce our green theme
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}