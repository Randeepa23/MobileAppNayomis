package com.nayomis.waterfront.app.navigation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.nayomis.waterfront.core.designsystem.component.NayomisTopAppBar
import com.nayomis.waterfront.core.designsystem.token.Spacing
import com.nayomis.waterfront.feature.auth.domain.AuthenticationState
import com.nayomis.waterfront.feature.profile.ProfileRoute

@Composable
fun MainShell(
    authState: AuthenticationState,
    requestedDestination: String?,
    onDestinationConsumed: () -> Unit,
    onProtectedDestination: (String) -> Unit,
    onSignedOut: () -> Unit,
) {
    val navController = rememberNavController()
    val snackbarHostState = remember { SnackbarHostState() }
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = backStackEntry?.destination
    val selected = TopLevelDestination.entries.firstOrNull { destination ->
        currentDestination?.hierarchy?.any { it.route == destination.route } == true
    } ?: TopLevelDestination.HOME

    fun navigateTopLevel(destination: TopLevelDestination) {
        if (ProtectedDestinationGuard.requiresAuthentication(destination, authState)) {
            onProtectedDestination(destination.route)
        } else navController.navigate(destination.route) {
            popUpTo(TopLevelDestination.HOME.route) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    LaunchedEffect(requestedDestination, authState) {
        requestedDestination?.let { route ->
            val destination = TopLevelDestination.entries.firstOrNull { it.route == route }
            if (destination != null && (destination != TopLevelDestination.PROFILE || authState is AuthenticationState.Authenticated)) {
                navigateTopLevel(destination)
                onDestinationConsumed()
            }
        }
    }
    LaunchedEffect(authState) {
        if (authState == AuthenticationState.SessionExpired) {
            snackbarHostState.showSnackbar("Your session has expired. Please sign in again.")
        }
    }

    Scaffold(
        topBar = { NayomisTopAppBar(selected.title) },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = { NavigationBar {
            TopLevelDestination.entries.forEach { destination ->
                NavigationBarItem(
                    selected = currentDestination?.hierarchy?.any { it.route == destination.route } == true,
                    onClick = { navigateTopLevel(destination) },
                    icon = { Icon(destination.icon, contentDescription = destination.title) },
                    label = { Text(destination.title) },
                )
            }
        } },
    ) { padding ->
        NavHost(navController, TopLevelDestination.HOME.route, Modifier.padding(padding)) {
            TopLevelDestination.entries.filter { it != TopLevelDestination.PROFILE }.forEach { destination ->
                composable(destination.route) { PhasePlaceholderScreen(destination) }
            }
            composable(TopLevelDestination.PROFILE.route) {
                ProfileRoute(
                    onSignedOut = {
                        navController.navigate(TopLevelDestination.HOME.route) {
                            popUpTo(TopLevelDestination.HOME.route) { inclusive = true }
                            launchSingleTop = true
                        }
                        onSignedOut()
                    },
                    onSignIn = { onProtectedDestination(TopLevelDestination.PROFILE.route) },
                )
            }
        }
    }
}

@Composable
private fun PhasePlaceholderScreen(destination: TopLevelDestination) {
    Column(
        modifier = Modifier.fillMaxSize().padding(Spacing.lg),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(Spacing.sm, Alignment.CenterVertically),
    ) {
        Icon(destination.icon, "${destination.title} feature", Modifier.padding(8.dp), tint = MaterialTheme.colorScheme.primary)
        Text(destination.title, style = MaterialTheme.typography.headlineMedium)
        Text(destination.phaseMessage, style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center)
        Text("Foundation placeholder", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.tertiary)
    }
}
