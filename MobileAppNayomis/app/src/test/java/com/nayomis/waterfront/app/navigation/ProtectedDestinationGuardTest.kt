package com.nayomis.waterfront.app.navigation

import com.nayomis.waterfront.feature.auth.domain.AuthenticationState
import com.nayomis.waterfront.feature.auth.domain.Customer
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ProtectedDestinationGuardTest {
    @Test fun `profile is protected for guest`() {
        assertTrue(ProtectedDestinationGuard.requiresAuthentication(TopLevelDestination.PROFILE, AuthenticationState.Guest))
    }
    @Test fun `profile opens for authenticated customer and public tabs remain public`() {
        val authenticated = AuthenticationState.Authenticated(Customer("1", "Name", "e@example.com"))
        assertFalse(ProtectedDestinationGuard.requiresAuthentication(TopLevelDestination.PROFILE, authenticated))
        assertFalse(ProtectedDestinationGuard.requiresAuthentication(TopLevelDestination.MENU, AuthenticationState.Guest))
    }
}
