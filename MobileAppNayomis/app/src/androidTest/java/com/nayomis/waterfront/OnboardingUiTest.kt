package com.nayomis.waterfront

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.nayomis.waterfront.core.designsystem.theme.NayomisTheme
import com.nayomis.waterfront.feature.onboarding.OnboardingContent
import org.junit.Rule
import org.junit.Test

class OnboardingUiTest {
    @get:Rule val composeRule = createComposeRule()

    @Test fun nextMovesToSecondOnboardingPage() {
        composeRule.setContent {
            NayomisTheme { OnboardingContent(onFinish = {}, reducedMotion = true) }
        }
        composeRule.onNodeWithText("Browse fresh meals").assertIsDisplayed()
        composeRule.onNodeWithText("Next").performClick()
        composeRule.onNodeWithText("Pre-order school breakfast").assertIsDisplayed()
    }
}
