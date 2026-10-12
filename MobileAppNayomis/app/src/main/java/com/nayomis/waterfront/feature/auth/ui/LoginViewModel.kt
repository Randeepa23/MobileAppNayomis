package com.nayomis.waterfront.feature.auth.ui

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nayomis.waterfront.core.common.AppError
import com.nayomis.waterfront.core.common.AppResult
import com.nayomis.waterfront.core.connectivity.ConnectivityObserver
import com.nayomis.waterfront.core.connectivity.ConnectivityStatus
import com.nayomis.waterfront.feature.auth.domain.AuthRepository
import com.nayomis.waterfront.feature.auth.domain.EmailValidator
import com.nayomis.waterfront.feature.auth.domain.LoginCredentials
import com.nayomis.waterfront.feature.auth.domain.PasswordValidator
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val repository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
    connectivityObserver: ConnectivityObserver,
) : ViewModel() {
    private val _state = MutableStateFlow(LoginUiState(email = savedStateHandle["email"] ?: ""))
    val state: StateFlow<LoginUiState> = _state.asStateFlow()
    private val eventChannel = Channel<LoginEvent>(Channel.BUFFERED)
    val events = eventChannel.receiveAsFlow()
    private var online = true

    init {
        viewModelScope.launch { connectivityObserver.status.collect { online = it == ConnectivityStatus.AVAILABLE } }
    }

    fun onEmailChanged(value: String) {
        savedStateHandle["email"] = value
        _state.value = _state.value.copy(email = value, emailError = null, message = null, status = LoginStatus.EDITING)
    }
    fun onPasswordChanged(value: String) {
        _state.value = _state.value.copy(password = value, passwordError = null, message = null, status = LoginStatus.EDITING)
    }
    fun togglePasswordVisibility() { _state.value = _state.value.copy(passwordVisible = !_state.value.passwordVisible) }

    fun submit() {
        val current = _state.value
        if (current.submitting) return
        val emailError = EmailValidator.error(current.email)
        val passwordError = PasswordValidator.error(current.password)
        if (emailError != null || passwordError != null) {
            _state.value = current.copy(emailError = emailError, passwordError = passwordError, status = LoginStatus.VALIDATION_ERROR)
            return
        }
        if (!online) {
            _state.value = current.copy(status = LoginStatus.OFFLINE, message = "You appear to be offline. Check your connection and try again.")
            return
        }
        _state.value = current.copy(status = LoginStatus.SUBMITTING, message = null)
        viewModelScope.launch {
            when (val result = repository.login(LoginCredentials(current.email, current.password))) {
                is AppResult.Success -> {
                    _state.value = _state.value.copy(password = "", status = LoginStatus.SUCCESS)
                    eventChannel.send(LoginEvent.Authenticated)
                }
                is AppResult.Failure -> applyError(result.error)
            }
        }
    }

    private fun applyError(error: AppError) {
        val (status, message) = when (error) {
            AppError.Unauthorized -> LoginStatus.INVALID_CREDENTIALS to "The email or password is incorrect."
            is AppError.Validation -> if (error.code == "INVALID_CREDENTIALS") {
                LoginStatus.INVALID_CREDENTIALS to "The email or password is incorrect."
            } else LoginStatus.VALIDATION_ERROR to (error.message ?: "Please check the entered details.")
            is AppError.Network -> LoginStatus.NETWORK_ERROR to "Nayomi’s service could not be reached. Please try again."
            is AppError.Server -> if (error.statusCode == 0) LoginStatus.UNEXPECTED_RESPONSE to (error.message ?: "The server response was unexpected.")
                else LoginStatus.SERVER_ERROR to "Nayomi’s service is temporarily unavailable."
            else -> LoginStatus.UNEXPECTED_RESPONSE to "Something unexpected happened. Please try again."
        }
        _state.value = _state.value.copy(status = status, message = message)
    }
}
