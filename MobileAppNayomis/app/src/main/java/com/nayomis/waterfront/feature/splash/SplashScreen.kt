package com.nayomis.waterfront.feature.splash

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nayomis.waterfront.core.designsystem.theme.DarkBlue
import com.nayomis.waterfront.core.designsystem.theme.DeepBlue
import com.nayomis.waterfront.core.designsystem.theme.Gold
import com.nayomis.waterfront.core.designsystem.token.Spacing

@Composable
fun SplashRoute(
    onDecision: (SplashDecision) -> Unit,
    viewModel: SplashViewModel = hiltViewModel(),
) {
    val decision = viewModel.decision.collectAsStateWithLifecycle().value
    LaunchedEffect(decision) {
        if (decision != SplashDecision.LOADING) onDecision(decision)
    }
    SplashScreen()
}

@Composable
fun SplashScreen() {
    Box(
        modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(DeepBlue, DarkBlue))),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.padding(Spacing.lg),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            Text(
                text = "Nayomi’s Waterfront",
                style = MaterialTheme.typography.displaySmall,
                color = Color.White,
                textAlign = TextAlign.Center,
            )
            Text(
                text = "Plan Ahead. Eat Fresh. Stress Less.",
                style = MaterialTheme.typography.titleLarge,
                color = Gold,
                textAlign = TextAlign.Center,
            )
            CircularProgressIndicator(color = Gold, strokeWidth = 3.dp)
            Text("Preparing your experience", color = Color.White)
        }
    }
}
