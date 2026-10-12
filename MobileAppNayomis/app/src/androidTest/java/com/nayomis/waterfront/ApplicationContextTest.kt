package com.nayomis.waterfront

import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertTrue
import org.junit.Test

class ApplicationContextTest {
    @Test fun applicationContextUsesNayomisApplication() {
        val application = ApplicationProvider.getApplicationContext<NayomisApplication>()
        assertTrue(application is NayomisApplication)
    }
}
