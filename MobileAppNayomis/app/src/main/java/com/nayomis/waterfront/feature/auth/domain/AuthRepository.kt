package com.nayomis.waterfront.feature.auth.domain

import com.nayomis.waterfront.core.common.AppResult
import kotlinx.coroutines.flow.StateFlow

interface AuthRepository {
    val authenticationState: StateFlow<AuthenticationState>
    suspend fun register(details: RegistrationDetails): AppResult<String>
    suspend fun login(credentials: LoginCredentials): AppResult<Customer>
    suspend fun getCurrentCustomer(): AppResult<Customer>
    suspend fun restoreSession(): AuthenticationState
    suspend fun logout()
}
