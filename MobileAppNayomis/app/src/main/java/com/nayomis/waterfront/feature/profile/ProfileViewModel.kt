package com.nayomis.waterfront.feature.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nayomis.waterfront.core.common.AppResult
import com.nayomis.waterfront.feature.auth.domain.AuthRepository
import com.nayomis.waterfront.feature.auth.domain.AuthenticationState
import com.nayomis.waterfront.feature.auth.domain.Customer
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ProfileUiState {
    data object Loading : ProfileUiState
    data class Content(val customer: Customer) : ProfileUiState
    data class Error(val message: String) : ProfileUiState
    data object SessionExpired : ProfileUiState
}

@HiltViewModel
class ProfileViewModel @Inject constructor(private val repository: AuthRepository) : ViewModel() {
    private val _state = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val state: StateFlow<ProfileUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            repository.authenticationState.collect { auth ->
                _state.value = when (auth) {
                    is AuthenticationState.Authenticated -> ProfileUiState.Content(auth.customer)
                    AuthenticationState.SessionExpired, AuthenticationState.Guest -> ProfileUiState.SessionExpired
                    is AuthenticationState.AuthenticationError -> ProfileUiState.Error(auth.message)
                    AuthenticationState.Checking -> ProfileUiState.Loading
                }
            }
        }
    }

    fun retry() { viewModelScope.launch {
        _state.value = ProfileUiState.Loading
        when (val result = repository.getCurrentCustomer()) {
            is AppResult.Success -> _state.value = ProfileUiState.Content(result.value)
            is AppResult.Failure -> _state.value = ProfileUiState.Error("Unable to load your account right now.")
        }
    } }

    fun logout(onComplete: () -> Unit) { viewModelScope.launch { repository.logout(); onComplete() } }
}
