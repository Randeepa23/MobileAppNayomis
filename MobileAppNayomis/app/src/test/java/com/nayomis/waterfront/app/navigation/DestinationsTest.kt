package com.nayomis.waterfront.app.navigation

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DestinationsTest {
    @Test fun `root and top-level routes are unique`() {
        val rootRoutes = listOf(
            AppDestination.Splash.route, AppDestination.Onboarding.route, AppDestination.Main.route,
            AppDestination.Login.route, AppDestination.Register.route,
        )
        val topRoutes = TopLevelDestination.entries.map { it.route }
        assertEquals(rootRoutes.size, rootRoutes.distinct().size)
        assertEquals(5, topRoutes.size)
        assertEquals(topRoutes.size, topRoutes.distinct().size)
        assertTrue(rootRoutes.intersect(topRoutes.toSet()).isEmpty())
    }
}
