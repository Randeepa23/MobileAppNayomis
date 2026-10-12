package com.nayomis.waterfront.feature.auth.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nayomis.waterfront.core.designsystem.component.BrandedButton
import com.nayomis.waterfront.core.designsystem.theme.SuccessGreen
import com.nayomis.waterfront.core.designsystem.token.Spacing

@Composable
fun LoginRoute(
    registrationSucceeded: Boolean,
    onAuthenticated: () -> Unit,
    onCreateAccount: () -> Unit,
    onClose: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel(),
) {
    val state = viewModel.state.collectAsStateWithLifecycle().value
    LaunchedEffect(viewModel) { viewModel.events.collect { onAuthenticated() } }
    LoginScreen(state, registrationSucceeded, viewModel::onEmailChanged, viewModel::onPasswordChanged,
        viewModel::togglePasswordVisibility, viewModel::submit, onCreateAccount, onClose)
}

@Composable
fun LoginScreen(
    state: LoginUiState,
    registrationSucceeded: Boolean = false,
    onEmailChanged: (String) -> Unit,
    onPasswordChanged: (String) -> Unit,
    onTogglePassword: () -> Unit,
    onSubmit: () -> Unit,
    onCreateAccount: () -> Unit,
    onClose: () -> Unit,
) {
    AuthContainer(title = "Welcome back", subtitle = "Sign in to your Nayomi’s Waterfront account", onBack = onClose) {
        if (registrationSucceeded) {
            Text("Account created successfully. Please sign in.", color = SuccessGreen, style = MaterialTheme.typography.bodyMedium)
        }
        AuthTextField("Email", state.email, onEmailChanged, state.emailError, ImeAction.Next,
            KeyboardOptions(autoCorrectEnabled = false, keyboardType = androidx.compose.ui.text.input.KeyboardType.Email, imeAction = ImeAction.Next))
        AuthPasswordField("Password", state.password, onPasswordChanged, state.passwordError, state.passwordVisible,
            onTogglePassword, ImeAction.Done)
        state.message?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium) }
        BrandedButton(
            text = if (state.submitting) "Signing in…" else "Sign In",
            onClick = onSubmit,
            modifier = Modifier.fillMaxWidth().testTag("login_submit"),
            enabled = !state.submitting,
        )
        if (state.submitting) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
            CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
            Text("Signing in securely")
        }
        TextButton(onClick = onCreateAccount, modifier = Modifier.fillMaxWidth()) { Text("Create Account") }
    }
}

@Composable
fun RegistrationRoute(
    onRegistered: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: RegistrationViewModel = hiltViewModel(),
) {
    val state = viewModel.state.collectAsStateWithLifecycle().value
    LaunchedEffect(viewModel) { viewModel.events.collect { event ->
        if (event is RegistrationEvent.Registered) onRegistered(event.email)
    } }
    RegistrationScreen(state, viewModel::onFullNameChanged, viewModel::onEmailChanged,
        viewModel::onPasswordChanged, viewModel::onConfirmationChanged, viewModel::togglePasswordVisibility,
        viewModel::toggleConfirmationVisibility, viewModel::submit, onBack)
}

@Composable
fun RegistrationScreen(
    state: RegistrationUiState,
    onFullNameChanged: (String) -> Unit,
    onEmailChanged: (String) -> Unit,
    onPasswordChanged: (String) -> Unit,
    onConfirmationChanged: (String) -> Unit,
    onTogglePassword: () -> Unit,
    onToggleConfirmation: () -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit,
) {
    AuthContainer("Create your account", "Register to securely access your account", onBack) {
        AuthTextField("Full name", state.fullName, onFullNameChanged, state.fullNameError, ImeAction.Next)
        AuthTextField("Email", state.email, onEmailChanged, state.emailError, ImeAction.Next,
            KeyboardOptions(autoCorrectEnabled = false, keyboardType = androidx.compose.ui.text.input.KeyboardType.Email, imeAction = ImeAction.Next))
        AuthPasswordField("Password", state.password, onPasswordChanged, state.passwordError, state.passwordVisible, onTogglePassword, ImeAction.Next)
        AuthPasswordField("Confirm password", state.confirmation, onConfirmationChanged, state.confirmationError,
            state.confirmationVisible, onToggleConfirmation, ImeAction.Done)
        state.message?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium) }
        BrandedButton(if (state.submitting) "Creating account…" else "Create Account", onSubmit,
            Modifier.fillMaxWidth().testTag("register_submit"), enabled = !state.submitting)
        if (state.submitting) CircularProgressIndicator(Modifier.size(24.dp), strokeWidth = 2.dp)
    }
}

@Composable
private fun AuthContainer(title: String, subtitle: String, onBack: () -> Unit, content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.md),
    ) {
        IconButton(onClick = onBack, modifier = Modifier.size(48.dp)) { Icon(Icons.Outlined.ArrowBack, "Back") }
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text("Nayomi’s Waterfront", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
            Text(title, style = MaterialTheme.typography.headlineMedium)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium)
        }
        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(Spacing.md), verticalArrangement = Arrangement.spacedBy(Spacing.sm), content = { content() })
        }
    }
}

@Composable
private fun AuthTextField(
    label: String,
    value: String,
    onValueChanged: (String) -> Unit,
    error: String?,
    imeAction: ImeAction,
    keyboardOptions: KeyboardOptions = KeyboardOptions(imeAction = imeAction),
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = value, onValueChange = onValueChanged, label = { Text(label) }, modifier = modifier.fillMaxWidth(),
        singleLine = true, isError = error != null, supportingText = error?.let { { Text(it) } },
        keyboardOptions = keyboardOptions,
    )
}

@Composable
private fun AuthPasswordField(
    label: String,
    value: String,
    onValueChanged: (String) -> Unit,
    error: String?,
    visible: Boolean,
    onToggle: () -> Unit,
    imeAction: ImeAction,
) {
    OutlinedTextField(
        value = value, onValueChange = onValueChanged, label = { Text(label) }, modifier = Modifier.fillMaxWidth(),
        singleLine = true, isError = error != null, supportingText = error?.let { { Text(it) } },
        visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Password, imeAction = imeAction),
        trailingIcon = {
            IconButton(onClick = onToggle, modifier = Modifier.size(48.dp)) {
                Icon(if (visible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                    if (visible) "Hide password" else "Show password")
            }
        },
    )
}
