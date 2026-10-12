package com.nayomis.waterfront.feature.splash

import org.junit.Assert.assertEquals
import org.junit.Test

class SplashRouterTest {
    @Test fun `first launch routes to onboarding regardless of session placeholder`() {
        assertEquals(SplashDecision.ONBOARDING, SplashRouter.decide(false, false))
        assertEquals(SplashDecision.ONBOARDING, SplashRouter.decide(false, true))
    }

    @Test fun `returning guest routes to main`() {
        assertEquals(SplashDecision.MAIN_GUEST, SplashRouter.decide(true, false))
    }

    @Test fun `active session routes to main session branch`() {
        assertEquals(SplashDecision.MAIN_SESSION, SplashRouter.decide(true, true))
    }
}
