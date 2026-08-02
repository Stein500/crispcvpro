package com.crispcv.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val CrispLight = lightColorScheme(primary=Color(0xFFB23A2E), onPrimary=Color.White, background=Color(0xFFFAFAF8), surface=Color(0xFFFFFFFF), primaryContainer=Color(0xFFF7DDD7))
private val CrispDark = darkColorScheme(primary=Color(0xFFE98272), primaryContainer=Color(0xFF6E2A22))

@Composable fun CrispCVTheme(content: @Composable () -> Unit) { MaterialTheme(colorScheme=if(isSystemInDarkTheme()) CrispDark else CrispLight, typography=Typography(), content=content) }
