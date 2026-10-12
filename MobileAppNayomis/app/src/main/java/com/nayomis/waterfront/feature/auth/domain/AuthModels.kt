package com.nayomis.waterfront.feature.auth.domain

data class Customer(
    val id: String,
    val fullName: String,
    val email: String,
    val school: String? = null,
    val grade: String? = null,
    val createdAt: String? = null,
)

data class LoginCredentials(val email: String, val password: String)

data class RegistrationDetails(
    val fullName: String,
    val email: String,
    val password: String,
    val passwordConfirmation: String,
)

sealed interface AuthenticationState {
    data object Checking : AuthenticationState
    data object Guest : AuthenticationState
    data class Authenticated(val customer: Customer) : AuthenticationState
    data object SessionExpired : AuthenticationState
    data class AuthenticationError(val message: String) : AuthenticationState
}
