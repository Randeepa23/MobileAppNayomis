package com.nayomis.waterfront.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CloudOff
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.HourglassEmpty
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.LockClock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.nayomis.waterfront.core.designsystem.theme.UnavailableGrey
import com.nayomis.waterfront.core.designsystem.token.Spacing
import com.nayomis.waterfront.core.designsystem.token.TouchTarget

@Composable
fun BrandedButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
    Button(
        onClick = onClick,
        modifier = modifier.heightIn(min = TouchTarget.minimum),
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
    ) { Text(text) }
}

@Composable
fun BrandedLoadingIndicator(message: String = "Loading", modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.semantics { contentDescription = message },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        CircularProgressIndicator(strokeWidth = 3.dp)
        Text(message, style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
private fun StatePanel(
    title: String,
    message: String,
    icon: ImageVector,
    contentDescription: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    ElevatedCard(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(Spacing.md),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            Icon(icon, contentDescription, modifier = Modifier.size(40.dp), tint = MaterialTheme.colorScheme.primary)
            Text(title, style = MaterialTheme.typography.titleLarge)
            Text(message, style = MaterialTheme.typography.bodyLarge)
            if (actionLabel != null && onAction != null) {
                Spacer(Modifier.size(Spacing.xs))
                BrandedButton(actionLabel, onAction)
            }
        }
    }
}

@Composable
fun ErrorPanel(message: String, onRetry: (() -> Unit)? = null, modifier: Modifier = Modifier) = StatePanel(
    title = "Something went wrong",
    message = message,
    icon = Icons.Outlined.ErrorOutline,
    contentDescription = "Error",
    modifier = modifier,
    actionLabel = if (onRetry == null) null else "Retry",
    onAction = onRetry,
)

@Composable
fun EmptyStatePanel(title: String, message: String, modifier: Modifier = Modifier) = StatePanel(
    title, message, Icons.Outlined.HourglassEmpty, "Empty state", modifier,
)

@Composable
fun OfflineStatePanel(onRetry: (() -> Unit)? = null, modifier: Modifier = Modifier) = StatePanel(
    title = "You’re offline",
    message = "Check your connection and try again. A connection does not guarantee the service is reachable.",
    icon = Icons.Outlined.CloudOff,
    contentDescription = "Offline",
    modifier = modifier,
    actionLabel = if (onRetry == null) null else "Retry",
    onAction = onRetry,
)

@Composable
fun SessionExpiredPanel(onSignIn: () -> Unit, modifier: Modifier = Modifier) = StatePanel(
    title = "Session expired",
    message = "Your session has expired. Please sign in again.",
    icon = Icons.Outlined.LockClock,
    contentDescription = "Session expired",
    modifier = modifier,
    actionLabel = "Continue",
    onAction = onSignIn,
)
