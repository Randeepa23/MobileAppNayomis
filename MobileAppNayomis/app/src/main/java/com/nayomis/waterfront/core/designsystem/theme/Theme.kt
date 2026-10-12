package com.nayomis.waterfront.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val LightColors = lightColorScheme(
    primary = DeepBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD6E9FF),
    onPrimaryContainer = DarkBlue,
    secondary = DarkGold,
    onSecondary = Color(0xFF332600),
    tertiary = OrangeAction,
    onTertiary = Color.White,
    error = CriticalRed,
    background = Cream,
    onBackground = Color(0xFF17202A),
    surface = Color.White,
    onSurface = Color(0xFF17202A),
    surfaceVariant = Color(0xFFF0EEE8),
    outline = Color(0xFF74777D),
)

private val NayomisShapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(20.dp),
)

@Composable
fun NayomisTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = NayomisTypography,
        shapes = NayomisShapes,
        content = content,
    )
}
