package com.nayomis.waterfront.feature.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nayomis.waterfront.core.datastore.UserPreferencesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val preferencesRepository: UserPreferencesRepository,
) : ViewModel() {
    val reducedMotion = preferencesRepository.preferences
        .map { it.reducedMotion }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), false)

    fun complete(onPersisted: () -> Unit) {
        viewModelScope.launch {
            preferencesRepository.setOnboardingCompleted(true)
            onPersisted()
        }
    }
}
