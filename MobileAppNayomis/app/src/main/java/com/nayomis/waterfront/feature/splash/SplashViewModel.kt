package com.nayomis.waterfront.feature.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nayomis.waterfront.core.datastore.UserPreferencesRepository
import com.nayomis.waterfront.feature.auth.domain.AuthRepository
import com.nayomis.waterfront.feature.auth.domain.AuthenticationState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

enum class SplashDecision { LOADING, ONBOARDING, MAIN_GUEST, MAIN_SESSION }

object SplashRouter {
    fun decide(onboardingCompleted: Boolean, hasActiveSession: Boolean): SplashDecision = when {
        !onboardingCompleted -> SplashDecision.ONBOARDING
        hasActiveSession -> SplashDecision.MAIN_SESSION
        else -> SplashDecision.MAIN_GUEST
    }
}

@HiltViewModel
class SplashViewModel @Inject constructor(
    preferencesRepository: UserPreferencesRepository,
    authRepository: AuthRepository,
) : ViewModel() {
    private val _decision = MutableStateFlow(SplashDecision.LOADING)
    val decision: StateFlow<SplashDecision> = _decision.asStateFlow()

    init {
        viewModelScope.launch {
            val onboardingCompleted = preferencesRepository.preferences.first().onboardingCompleted
            val hasActiveSession = authRepository.restoreSession() is AuthenticationState.Authenticated
            _decision.value = SplashRouter.decide(onboardingCompleted, hasActiveSession)
        }
    }
}
