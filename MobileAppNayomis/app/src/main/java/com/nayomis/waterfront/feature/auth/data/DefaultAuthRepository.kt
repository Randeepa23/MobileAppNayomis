package com.nayomis.waterfront.feature.auth.data

import com.nayomis.waterfront.app.di.IoDispatcher
import com.nayomis.waterfront.core.common.AppError
import com.nayomis.waterfront.core.common.AppResult
import com.nayomis.waterfront.core.network.error.NetworkErrorParser
import com.nayomis.waterfront.core.network.error.StandardErrorMapper
import com.nayomis.waterfront.core.security.SessionData
import com.nayomis.waterfront.core.security.SessionStorage
import com.nayomis.waterfront.core.security.UnauthorizedSessionHandler
import com.nayomis.waterfront.feature.auth.data.network.AuthApi
import com.nayomis.waterfront.feature.auth.data.network.LoginRequestDto
import com.nayomis.waterfront.feature.auth.data.network.RegisterRequestDto
import com.nayomis.waterfront.feature.auth.data.network.toDomain
import com.nayomis.waterfront.feature.auth.domain.AuthRepository
import com.nayomis.waterfront.feature.auth.domain.AuthenticationState
import com.nayomis.waterfront.feature.auth.domain.Customer
import com.nayomis.waterfront.feature.auth.domain.LoginCredentials
import com.nayomis.waterfront.feature.auth.domain.RegistrationDetails
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import retrofit2.Response

@Singleton
class DefaultAuthRepository @Inject constructor(
    private val api: AuthApi,
    private val storage: SessionStorage,
    private val jwtParser: JwtSessionParser,
    private val errorParser: NetworkErrorParser,
    private val unauthorizedSessionHandler: UnauthorizedSessionHandler,
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
) : AuthRepository {
    private val mutex = Mutex()
    private val scope = CoroutineScope(SupervisorJob() + dispatcher)
    private val _authenticationState = MutableStateFlow<AuthenticationState>(AuthenticationState.Checking)
    override val authenticationState: StateFlow<AuthenticationState> = _authenticationState.asStateFlow()

    init {
        scope.launch {
            unauthorizedSessionHandler.events.collect {
                _authenticationState.value = AuthenticationState.SessionExpired
            }
        }
    }

    override suspend fun register(details: RegistrationDetails): AppResult<String> = withContext(dispatcher) {
        runCatching {
            api.register(RegisterRequestDto(details.fullName.trim(), details.email.trim().lowercase(), details.password))
        }.fold(
            onSuccess = { response ->
                if (response.isSuccessful && response.body()?.success == true && response.body()?.data?.student?.toDomain() != null) {
                    AppResult.Success(details.email.trim().lowercase())
                } else response.toFailure()
            },
            onFailure = { AppResult.Failure(StandardErrorMapper.fromThrowable(it)) },
        )
    }

    override suspend fun login(credentials: LoginCredentials): AppResult<Customer> = mutex.withLock {
        withContext(dispatcher) {
            runCatching { api.login(LoginRequestDto(credentials.email.trim().lowercase(), credentials.password)) }.fold(
                onSuccess = { response ->
                    if (!response.isSuccessful) return@fold response.toFailure()
                    val payload = response.body()?.takeIf { it.success }?.data
                    val token = payload?.token?.takeIf(String::isNotBlank)
                    val responseCustomer = payload?.student?.toDomain()
                    val parsed = token?.let(jwtParser::parse)
                    if (token == null || responseCustomer == null || parsed == null ||
                        parsed.customerId != responseCustomer.id || jwtParser.isExpired(parsed, Instant.now().epochSecond)
                    ) {
                        storage.clear()
                        return@fold AppResult.Failure(AppError.Server(0, "The sign-in response was incomplete."))
                    }
                    storage.save(SessionData(token, parsed.expiresAtEpochSeconds, parsed.customerId))
                    unauthorizedSessionHandler.onNewSession()
                    when (val current = getCurrentCustomerInternal()) {
                        is AppResult.Success -> {
                            _authenticationState.value = AuthenticationState.Authenticated(current.value)
                            current
                        }
                        is AppResult.Failure -> {
                            storage.clear()
                            _authenticationState.value = AuthenticationState.Guest
                            current
                        }
                    }
                },
                onFailure = { AppResult.Failure(StandardErrorMapper.fromThrowable(it)) },
            )
        }
    }

    override suspend fun getCurrentCustomer(): AppResult<Customer> = withContext(dispatcher) {
        getCurrentCustomerInternal()
    }

    private suspend fun getCurrentCustomerInternal(): AppResult<Customer> = runCatching { api.getCurrentCustomer() }.fold(
        onSuccess = { response ->
            if (!response.isSuccessful) return@fold response.toFailure()
            val customer = response.body()?.takeIf { it.success }?.data?.student?.toDomain()
                ?: return@fold AppResult.Failure(AppError.Server(0, "The customer response was incomplete."))
            _authenticationState.value = AuthenticationState.Authenticated(customer)
            AppResult.Success(customer)
        },
        onFailure = { AppResult.Failure(StandardErrorMapper.fromThrowable(it)) },
    )

    override suspend fun restoreSession(): AuthenticationState = mutex.withLock {
        withContext(dispatcher) {
            _authenticationState.value = AuthenticationState.Checking
            val stored = storage.read()
            val parsed = stored?.accessToken?.let(jwtParser::parse)
            if (stored == null || parsed == null || parsed.customerId != stored.sessionId ||
                jwtParser.isExpired(parsed, Instant.now().epochSecond)
            ) {
                if (stored != null) storage.clear()
                return@withContext AuthenticationState.Guest.also { _authenticationState.value = it }
            }
            when (val result = getCurrentCustomerInternal()) {
                is AppResult.Success -> AuthenticationState.Authenticated(result.value)
                is AppResult.Failure -> when (result.error) {
                    AppError.Unauthorized, AppError.SessionExpired -> {
                        storage.clear()
                        AuthenticationState.SessionExpired.also { _authenticationState.value = it }
                    }
                    else -> AuthenticationState.AuthenticationError("Unable to restore your account right now.")
                        .also { _authenticationState.value = it }
                }
            }
        }
    }

    override suspend fun logout() = mutex.withLock {
        withContext(dispatcher) {
            storage.clear()
            _authenticationState.value = AuthenticationState.Guest
        }
    }

    private fun <T> Response<T>.toFailure(): AppResult.Failure = AppResult.Failure(
        errorParser.parse(code(), errorBody(), headers()["X-Correlation-Id"]),
    )
}
