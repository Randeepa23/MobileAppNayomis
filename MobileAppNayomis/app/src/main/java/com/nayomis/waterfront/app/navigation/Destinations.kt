package com.nayomis.waterfront.app.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardGiftcard
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material.icons.outlined.ReceiptLong
import androidx.compose.ui.graphics.vector.ImageVector

sealed class AppDestination(val route: String) {
    data object Splash : AppDestination("splash")
    data object Onboarding : AppDestination("onboarding")
    data object Main : AppDestination("main")
    data object Login : AppDestination("login?email={email}&registered={registered}") {
        fun createRoute(email: String = "", registered: Boolean = false): String =
            "login?email=${android.net.Uri.encode(email)}&registered=$registered"
    }
    data object Register : AppDestination("register")
}

enum class TopLevelDestination(
    val route: String,
    val title: String,
    val icon: ImageVector,
    val phaseMessage: String,
) {
    HOME("home", "Home", Icons.Outlined.Home, "Your home experience will be connected in a later phase."),
    MENU("menu", "Menu", Icons.Outlined.MenuBook, "Fresh meal browsing will be connected in its assigned phase."),
    ORDERS("orders", "Orders", Icons.Outlined.ReceiptLong, "Order history and status will be connected in its assigned phase."),
    REWARDS("rewards", "Rewards", Icons.Outlined.CardGiftcard, "Loyalty rewards will be connected in its assigned phase."),
    PROFILE("profile", "Profile", Icons.Outlined.PersonOutline, "Customer profile tools will be connected in their assigned phase."),
}
