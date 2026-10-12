package com.nayomis.waterfront.app.navigation

import com.nayomis.waterfront.feature.auth.domain.AuthenticationState

object ProtectedDestinationGuard {
    fun requiresAuthentication(destination: TopLevelDestination, state: AuthenticationState): Boolean =
        destination == TopLevelDestination.PROFILE && state !is AuthenticationState.Authenticated
}
