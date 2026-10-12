package com.nayomis.waterfront.feature.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nayomis.waterfront.core.designsystem.component.BrandedButton
import com.nayomis.waterfront.core.designsystem.component.BrandedLoadingIndicator
import com.nayomis.waterfront.core.designsystem.component.ErrorPanel
import com.nayomis.waterfront.core.designsystem.component.SessionExpiredPanel
import com.nayomis.waterfront.core.designsystem.token.Spacing
import com.nayomis.waterfront.feature.auth.domain.Customer

@Composable
fun ProfileRoute(
    onSignedOut: () -> Unit,
    onSignIn: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state = viewModel.state.collectAsStateWithLifecycle().value
    var confirmLogout by remember { mutableStateOf(false) }
    ProfileScreen(state, viewModel::retry, { confirmLogout = true }, onSignIn)
    if (confirmLogout) {
        AlertDialog(
            onDismissRequest = { confirmLogout = false },
            title = { Text("Sign out of Nayomi’s Waterfront?") },
            text = { Text("You can continue browsing as a guest after signing out.") },
            confirmButton = { TextButton(onClick = { confirmLogout = false; viewModel.logout(onSignedOut) }) { Text("Sign out") } },
            dismissButton = { TextButton(onClick = { confirmLogout = false }) { Text("Cancel") } },
        )
    }
}

@Composable
fun ProfileScreen(state: ProfileUiState, onRetry: () -> Unit, onLogout: () -> Unit, onSignIn: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.md, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        when (state) {
            ProfileUiState.Loading -> BrandedLoadingIndicator("Loading your account")
            is ProfileUiState.Content -> ProfileCard(state.customer, onLogout)
            is ProfileUiState.Error -> ErrorPanel(state.message, onRetry)
            ProfileUiState.SessionExpired -> SessionExpiredPanel(onSignIn)
        }
    }
}

@Composable
private fun ProfileCard(customer: Customer, onLogout: () -> Unit) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(Spacing.md), verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            Text(customer.fullName, style = MaterialTheme.typography.headlineSmall)
            Text(customer.email, style = MaterialTheme.typography.bodyLarge)
            Text("Account active", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            customer.createdAt?.let { Text("Member since ${it.take(10)}", style = MaterialTheme.typography.bodyMedium) }
            BrandedButton("Sign out", onLogout, Modifier.fillMaxWidth())
        }
    }
}
