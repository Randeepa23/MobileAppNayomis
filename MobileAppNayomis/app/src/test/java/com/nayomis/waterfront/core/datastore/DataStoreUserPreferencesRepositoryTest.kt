package com.nayomis.waterfront.core.datastore

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import java.io.File
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class DataStoreUserPreferencesRepositoryTest {
    @get:Rule val temporaryFolder = TemporaryFolder()

    @Test fun `onboarding completion persists`() = runTest {
        val scope = CoroutineScope(SupervisorJob() + StandardTestDispatcher(testScheduler))
        val store = PreferenceDataStoreFactory.create(scope = scope) {
            File(temporaryFolder.root, "preferences.preferences_pb")
        }
        val repository = DataStoreUserPreferencesRepository(store)

        assertFalse(repository.preferences.first().onboardingCompleted)
        repository.setOnboardingCompleted(true)
        assertTrue(repository.preferences.first().onboardingCompleted)
        scope.cancel()
    }
}
