package com.crispcv.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val CrispLight = lightColorScheme(primary=Color(0xFFB23A2E), onPrimary=Color.White, background=Color(0xFFFAFAF8), surface=Color(0xFFFFFFFF), primaryContainer=Color(0xFFF7DDD7))
private val CrispDark = darkColorScheme(primary=Color(0xFFE98272), primaryContainer=Color(0xFF6E2A22))

@Composable fun CrispCVTheme(content: @Composable () -> Unit) { MaterialTheme(colorScheme=if(isSystemInDarkTheme()) CrispDark else CrispLight, typography=Typography(), shapes=Shapes(small=androidx.compose.foundation.shape.RoundedCornerShape(12.dp),medium=androidx.compose.foundation.shape.RoundedCornerShape(18.dp),large=androidx.compose.foundation.shape.RoundedCornerShape(24.dp)), content=content) }
