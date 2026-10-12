package com.nayomis.waterfront.feature.auth.ui

import androidx.lifecycle.ViewModel
import com.nayomis.waterfront.feature.auth.domain.AuthRepository
import com.nayomis.waterfront.feature.auth.domain.AuthenticationState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.StateFlow

@HiltViewModel
class AuthStateViewModel @Inject constructor(repository: AuthRepository) : ViewModel() {
    val state: StateFlow<AuthenticationState> = repository.authenticationState
}
