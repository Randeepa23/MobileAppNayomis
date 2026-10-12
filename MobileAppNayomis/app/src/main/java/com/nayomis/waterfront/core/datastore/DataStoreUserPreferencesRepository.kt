package com.nayomis.waterfront.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class DataStoreUserPreferencesRepository @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) : UserPreferencesRepository {
    override val preferences: Flow<UserPreferences> = dataStore.data.map { values ->
        UserPreferences(
            onboardingCompleted = values[Keys.ONBOARDING_COMPLETED] ?: false,
            themePreference = values[Keys.THEME_PREFERENCE]
                ?.let { runCatching { ThemePreference.valueOf(it) }.getOrNull() }
                ?: ThemePreference.SYSTEM,
            reducedMotion = values[Keys.REDUCED_MOTION] ?: false,
        )
    }

    override suspend fun setOnboardingCompleted(completed: Boolean) {
        dataStore.edit { it[Keys.ONBOARDING_COMPLETED] = completed }
    }

    override suspend fun setThemePreference(preference: ThemePreference) {
        dataStore.edit { it[Keys.THEME_PREFERENCE] = preference.name }
    }

    override suspend fun setReducedMotion(enabled: Boolean) {
        dataStore.edit { it[Keys.REDUCED_MOTION] = enabled }
    }

    private object Keys {
        val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        val THEME_PREFERENCE = stringPreferencesKey("theme_preference")
        val REDUCED_MOTION = booleanPreferencesKey("reduced_motion")
    }
}
