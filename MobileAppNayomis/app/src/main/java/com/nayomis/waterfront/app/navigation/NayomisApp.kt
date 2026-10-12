package com.nayomis.waterfront.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.nayomis.waterfront.feature.auth.ui.AuthStateViewModel
import com.nayomis.waterfront.feature.auth.ui.LoginRoute
import com.nayomis.waterfront.feature.auth.ui.RegistrationRoute
import com.nayomis.waterfront.feature.onboarding.OnboardingRoute
import com.nayomis.waterfront.feature.splash.SplashDecision
import com.nayomis.waterfront.feature.splash.SplashRoute

@Composable
fun NayomisApp(modifier: Modifier = Modifier, authViewModel: AuthStateViewModel = hiltViewModel()) {
    val navController = rememberNavController()
    val authState = authViewModel.state.collectAsStateWithLifecycle().value
    var pendingProtectedDestination by rememberSaveable { mutableStateOf<String?>(null) }
    var requestedTopLevelDestination by rememberSaveable { mutableStateOf<String?>(null) }

    NavHost(navController, AppDestination.Splash.route, modifier) {
        composable(AppDestination.Splash.route) {
            SplashRoute(onDecision = { decision ->
                val target = when (decision) {
                    SplashDecision.ONBOARDING -> AppDestination.Onboarding.route
                    SplashDecision.MAIN_GUEST, SplashDecision.MAIN_SESSION -> AppDestination.Main.route
                    SplashDecision.LOADING -> return@SplashRoute
                }
                navController.navigate(target) { popUpTo(AppDestination.Splash.route) { inclusive = true }; launchSingleTop = true }
            })
        }
        composable(AppDestination.Onboarding.route) {
            OnboardingRoute(onComplete = {
                navController.navigate(AppDestination.Main.route) {
                    popUpTo(AppDestination.Onboarding.route) { inclusive = true }; launchSingleTop = true
                }
            })
        }
        composable(AppDestination.Main.route) {
            MainShell(
                authState = authState,
                requestedDestination = requestedTopLevelDestination,
                onDestinationConsumed = { requestedTopLevelDestination = null },
                onProtectedDestination = { route ->
                    pendingProtectedDestination = route
                    navController.navigate(AppDestination.Login.createRoute()) { launchSingleTop = true }
                },
                onSignedOut = { pendingProtectedDestination = null; requestedTopLevelDestination = TopLevelDestination.HOME.route },
            )
        }
        composable(
            AppDestination.Login.route,
            arguments = listOf(
                navArgument("email") { type = NavType.StringType; defaultValue = "" },
                navArgument("registered") { type = NavType.BoolType; defaultValue = false },
            ),
        ) { entry ->
            LoginRoute(
                registrationSucceeded = entry.arguments?.getBoolean("registered") == true,
                onAuthenticated = {
                    requestedTopLevelDestination = pendingProtectedDestination ?: TopLevelDestination.HOME.route
                    pendingProtectedDestination = null
                    navController.navigate(AppDestination.Main.route) {
                        popUpTo(AppDestination.Main.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onCreateAccount = { navController.navigate(AppDestination.Register.route) },
                onClose = { pendingProtectedDestination = null; navController.popBackStack() },
            )
        }
        composable(AppDestination.Register.route) {
            RegistrationRoute(
                onRegistered = { email ->
                    navController.navigate(AppDestination.Login.createRoute(email, registered = true)) {
                        popUpTo(AppDestination.Login.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }
    }
}
