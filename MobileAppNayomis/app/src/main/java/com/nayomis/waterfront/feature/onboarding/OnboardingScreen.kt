package com.nayomis.waterfront.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardGiftcard
import androidx.compose.material.icons.outlined.DeliveryDining
import androidx.compose.material.icons.outlined.LunchDining
import androidx.compose.material.icons.outlined.School
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nayomis.waterfront.core.designsystem.component.BrandedButton
import com.nayomis.waterfront.core.designsystem.theme.DarkBlue
import com.nayomis.waterfront.core.designsystem.theme.DeepBlue
import com.nayomis.waterfront.core.designsystem.theme.Gold
import com.nayomis.waterfront.core.designsystem.token.Spacing
import kotlinx.coroutines.launch

private data class OnboardingPage(val title: String, val message: String, val icon: ImageVector)

private val pages = listOf(
    OnboardingPage("Browse fresh meals", "Discover the restaurant menu when meal browsing is connected.", Icons.Outlined.LunchDining),
    OnboardingPage("Pre-order school breakfast", "Plan school mornings ahead when student ordering is available.", Icons.Outlined.School),
    OnboardingPage("Track with confidence", "Delivery progress and food-condition tracking will arrive in later phases.", Icons.Outlined.DeliveryDining),
    OnboardingPage("Earn loyalty rewards", "Rewards will be introduced without invented balances or activity.", Icons.Outlined.CardGiftcard),
)

@Composable
fun OnboardingRoute(
    onComplete: () -> Unit,
    viewModel: OnboardingViewModel = hiltViewModel(),
) {
    val reducedMotion = viewModel.reducedMotion.collectAsStateWithLifecycle().value
    OnboardingContent(
        reducedMotion = reducedMotion,
        onFinish = { viewModel.complete(onComplete) },
    )
}

@Composable
fun OnboardingContent(
    onFinish: () -> Unit,
    reducedMotion: Boolean = false,
) {
    val pagerState = rememberPagerState(pageCount = { pages.size })
    val scope = rememberCoroutineScope()
    val lastPage = pagerState.currentPage == pages.lastIndex

    Column(
        modifier = Modifier.fillMaxSize().padding(horizontal = Spacing.md, vertical = Spacing.sm),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            TextButton(onClick = onFinish, modifier = Modifier.height(48.dp)) { Text("Skip") }
        }
        HorizontalPager(state = pagerState, modifier = Modifier.weight(1f)) { page ->
            val item = pages[page]
            Column(
                modifier = Modifier.fillMaxSize().padding(Spacing.sm),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Box(
                    modifier = Modifier.size(180.dp).clip(CircleShape)
                        .background(Brush.linearGradient(listOf(DeepBlue, DarkBlue))),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(item.icon, item.title, modifier = Modifier.size(88.dp), tint = Gold)
                }
                Spacer(Modifier.height(Spacing.lg))
                Text(item.title, style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
                Spacer(Modifier.height(Spacing.sm))
                Text(item.message, style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center)
            }
        }
        Row(
            modifier = Modifier.semantics {
                contentDescription = "Page ${pagerState.currentPage + 1} of ${pages.size}"
            },
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            pages.indices.forEach { index ->
                Box(
                    Modifier.size(if (index == pagerState.currentPage) 12.dp else 8.dp)
                        .clip(CircleShape)
                        .background(if (index == pagerState.currentPage) DeepBlue else Color.LightGray),
                )
            }
        }
        Spacer(Modifier.height(Spacing.md))
        BrandedButton(
            text = if (lastPage) "Get Started" else "Next",
            onClick = {
                if (lastPage) onFinish() else scope.launch {
                    if (reducedMotion) pagerState.scrollToPage(pagerState.currentPage + 1)
                    else pagerState.animateScrollToPage(pagerState.currentPage + 1)
                }
            },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(Spacing.sm))
    }
}
