package com.nayomis.waterfront

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertTextContains
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import com.nayomis.waterfront.core.designsystem.theme.NayomisTheme
import com.nayomis.waterfront.feature.auth.ui.LoginScreen
import com.nayomis.waterfront.feature.auth.ui.LoginUiState
import com.nayomis.waterfront.feature.auth.ui.RegistrationScreen
import com.nayomis.waterfront.feature.auth.ui.RegistrationUiState
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class AuthScreensUiTest {
    @get:Rule val compose = createComposeRule()
    @Test fun loginScreenRendersAndCreateAccountNavigates() {
        var create = false
        compose.setContent { NayomisTheme { LoginScreen(LoginUiState(), false, {}, {}, {}, {}, { create = true }, {}) } }
        compose.onNodeWithText("Welcome back").assertIsDisplayed()
        compose.onNodeWithText("Create Account").performClick()
        assertTrue(create)
    }
    @Test fun loginValidationErrorsAreInline() {
        compose.setContent { NayomisTheme { LoginScreen(LoginUiState(emailError = "Email is required.", passwordError = "Password is required."), false, {}, {}, {}, {}, {}, {}) } }
        compose.onNodeWithText("Email is required.").assertIsDisplayed()
        compose.onNodeWithText("Password is required.").assertIsDisplayed()
    }
    @Test fun passwordVisibilityControlIsAccessible() {
        var toggled = false
        compose.setContent { NayomisTheme { LoginScreen(LoginUiState(password = "secret"), false, {}, {}, { toggled = true }, {}, {}, {}) } }
        compose.onNodeWithContentDescription("Show password").performClick()
        assertTrue(toggled)
    }
    @Test fun registrationMismatchIsDisplayed() {
        compose.setContent { NayomisTheme { RegistrationScreen(RegistrationUiState(confirmationError = "Passwords do not match."), {}, {}, {}, {}, {}, {}, {}, {}) } }
        compose.onNodeWithText("Passwords do not match.").assertIsDisplayed()
    }
    @Test fun registeredEmailAndConfirmationRenderOnLogin() {
        compose.setContent { NayomisTheme { LoginScreen(LoginUiState(email = "new@example.com"), true, {}, {}, {}, {}, {}, {}) } }
        compose.onNodeWithText("Account created successfully. Please sign in.").assertIsDisplayed()
        compose.onNodeWithText("new@example.com").assertTextContains("new@example.com")
    }
}
