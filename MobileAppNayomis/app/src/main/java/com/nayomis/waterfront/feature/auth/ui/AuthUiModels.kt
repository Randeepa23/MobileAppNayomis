package com.nayomis.waterfront.feature.auth.ui

enum class LoginStatus {
    INITIAL, EDITING, SUBMITTING, SUCCESS, VALIDATION_ERROR, INVALID_CREDENTIALS,
    OFFLINE, NETWORK_ERROR, SERVER_ERROR, UNEXPECTED_RESPONSE,
}

data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val emailError: String? = null,
    val passwordError: String? = null,
    val message: String? = null,
    val passwordVisible: Boolean = false,
    val status: LoginStatus = LoginStatus.INITIAL,
) { val submitting: Boolean get() = status == LoginStatus.SUBMITTING }

sealed interface LoginEvent { data object Authenticated : LoginEvent }

enum class RegistrationStatus {
    INITIAL, EDITING, SUBMITTING, SUCCESS, VALIDATION_ERROR, DUPLICATE_EMAIL,
    OFFLINE, NETWORK_ERROR, SERVER_ERROR, UNEXPECTED_RESPONSE,
}

data class RegistrationUiState(
    val fullName: String = "",
    val email: String = "",
    val password: String = "",
    val confirmation: String = "",
    val fullNameError: String? = null,
    val emailError: String? = null,
    val passwordError: String? = null,
    val confirmationError: String? = null,
    val message: String? = null,
    val passwordVisible: Boolean = false,
    val confirmationVisible: Boolean = false,
    val status: RegistrationStatus = RegistrationStatus.INITIAL,
) { val submitting: Boolean get() = status == RegistrationStatus.SUBMITTING }

sealed interface RegistrationEvent { data class Registered(val email: String) : RegistrationEvent }
