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
import com.nayomis.waterfront.feature.auth.domain.FullNameValidator
import com.nayomis.waterfront.feature.auth.domain.PasswordConfirmationValidator
import com.nayomis.waterfront.feature.auth.domain.PasswordValidator
import com.nayomis.waterfront.feature.auth.domain.RegistrationDetails
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

@HiltViewModel
class RegistrationViewModel @Inject constructor(
    private val repository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
    connectivityObserver: ConnectivityObserver,
) : ViewModel() {
    private val _state = MutableStateFlow(RegistrationUiState(
        fullName = savedStateHandle["fullName"] ?: "",
        email = savedStateHandle["email"] ?: "",
    ))
    val state: StateFlow<RegistrationUiState> = _state.asStateFlow()
    private val eventChannel = Channel<RegistrationEvent>(Channel.BUFFERED)
    val events = eventChannel.receiveAsFlow()
    private var online = true

    init { viewModelScope.launch { connectivityObserver.status.collect { online = it == ConnectivityStatus.AVAILABLE } } }

    fun onFullNameChanged(value: String) { savedStateHandle["fullName"] = value; edit { copy(fullName = value, fullNameError = null) } }
    fun onEmailChanged(value: String) { savedStateHandle["email"] = value; edit { copy(email = value, emailError = null) } }
    fun onPasswordChanged(value: String) { edit { copy(password = value, passwordError = null, confirmationError = null) } }
    fun onConfirmationChanged(value: String) { edit { copy(confirmation = value, confirmationError = null) } }
    fun togglePasswordVisibility() { _state.value = _state.value.copy(passwordVisible = !_state.value.passwordVisible) }
    fun toggleConfirmationVisibility() { _state.value = _state.value.copy(confirmationVisible = !_state.value.confirmationVisible) }
    private fun edit(block: RegistrationUiState.() -> RegistrationUiState) { _state.value = _state.value.block().copy(message = null, status = RegistrationStatus.EDITING) }

    fun submit() {
        val current = _state.value
        if (current.submitting) return
        val nameError = FullNameValidator.error(current.fullName)
        val emailError = EmailValidator.error(current.email)
        val passwordError = PasswordValidator.error(current.password)
        val confirmationError = PasswordConfirmationValidator.error(current.password, current.confirmation)
        if (listOf(nameError, emailError, passwordError, confirmationError).any { it != null }) {
            _state.value = current.copy(
                fullNameError = nameError, emailError = emailError, passwordError = passwordError,
                confirmationError = confirmationError, status = RegistrationStatus.VALIDATION_ERROR,
            )
            return
        }
        if (!online) {
            _state.value = current.copy(status = RegistrationStatus.OFFLINE, message = "You appear to be offline. Check your connection and try again.")
            return
        }
        _state.value = current.copy(status = RegistrationStatus.SUBMITTING, message = null)
        viewModelScope.launch {
            val details = RegistrationDetails(current.fullName, current.email, current.password, current.confirmation)
            when (val result = repository.register(details)) {
                is AppResult.Success -> {
                    _state.value = _state.value.copy(password = "", confirmation = "", status = RegistrationStatus.SUCCESS)
                    eventChannel.send(RegistrationEvent.Registered(result.value))
                }
                is AppResult.Failure -> applyError(result.error)
            }
        }
    }

    private fun applyError(error: AppError) {
        val duplicate = error is AppError.Validation && error.code == "EMAIL_ALREADY_EXISTS"
        val status = when {
            duplicate -> RegistrationStatus.DUPLICATE_EMAIL
            error is AppError.Validation -> RegistrationStatus.VALIDATION_ERROR
            error is AppError.Network -> RegistrationStatus.NETWORK_ERROR
            error is AppError.Server && error.statusCode == 0 -> RegistrationStatus.UNEXPECTED_RESPONSE
            error is AppError.Server -> RegistrationStatus.SERVER_ERROR
            else -> RegistrationStatus.UNEXPECTED_RESPONSE
        }
        val message = when (status) {
            RegistrationStatus.DUPLICATE_EMAIL -> "An account already exists with this email."
            RegistrationStatus.VALIDATION_ERROR -> (error as? AppError.Validation)?.message ?: "Please check the entered details."
            RegistrationStatus.NETWORK_ERROR -> "Nayomi’s service could not be reached. Please try again."
            RegistrationStatus.SERVER_ERROR -> "Nayomi’s service is temporarily unavailable."
            else -> "The server response was unexpected. Please try again."
        }
        val fields = (error as? AppError.Validation)?.fields.orEmpty()
        _state.value = _state.value.copy(
            status = status, message = message, fullNameError = fields["name"], emailError = fields["email"],
            passwordError = fields["password"],
        )
    }
}
