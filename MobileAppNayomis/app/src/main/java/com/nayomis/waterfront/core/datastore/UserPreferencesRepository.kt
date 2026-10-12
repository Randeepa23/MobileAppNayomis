package com.nayomis.waterfront.core.datastore

import kotlinx.coroutines.flow.Flow

enum class ThemePreference { SYSTEM, LIGHT, DARK }

data class UserPreferences(
    val onboardingCompleted: Boolean = false,
    val themePreference: ThemePreference = ThemePreference.SYSTEM,
    val reducedMotion: Boolean = false,
)

interface UserPreferencesRepository {
    val preferences: Flow<UserPreferences>
    suspend fun setOnboardingCompleted(completed: Boolean)
    suspend fun setThemePreference(preference: ThemePreference)
    suspend fun setReducedMotion(enabled: Boolean)
}
