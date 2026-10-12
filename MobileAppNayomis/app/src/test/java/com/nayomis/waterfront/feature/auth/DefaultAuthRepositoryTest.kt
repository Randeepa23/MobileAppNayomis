package com.nayomis.waterfront.feature.auth

import com.nayomis.waterfront.core.common.AppResult
import com.nayomis.waterfront.core.network.error.NetworkErrorParser
import com.nayomis.waterfront.core.security.SessionData
import com.nayomis.waterfront.core.security.SessionStorage
import com.nayomis.waterfront.core.security.UnauthorizedSessionHandler
import com.nayomis.waterfront.feature.auth.data.DefaultAuthRepository
import com.nayomis.waterfront.feature.auth.data.JwtSessionParser
import com.nayomis.waterfront.feature.auth.data.network.AuthApi
import com.nayomis.waterfront.feature.auth.data.network.CurrentCustomerResponseDto
import com.nayomis.waterfront.feature.auth.data.network.CustomerDto
import com.nayomis.waterfront.feature.auth.data.network.LoginPayloadDto
import com.nayomis.waterfront.feature.auth.data.network.LoginRequestDto
import com.nayomis.waterfront.feature.auth.data.network.LoginResponseDto
import com.nayomis.waterfront.feature.auth.data.network.RegisterRequestDto
import com.nayomis.waterfront.feature.auth.data.network.RegisterResponseDto
import com.nayomis.waterfront.feature.auth.data.network.StudentPayloadDto
import com.nayomis.waterfront.feature.auth.domain.AuthenticationState
import com.nayomis.waterfront.feature.auth.domain.LoginCredentials
import java.time.Instant
import java.util.Base64
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import retrofit2.Response

class DefaultAuthRepositoryTest {
    private class MemoryStorage(var value: SessionData? = null) : SessionStorage {
        override fun save(session: SessionData) { value = session }
        override fun read(): SessionData? = value
        override fun clear() { value = null }
    }
    private class FakeApi : AuthApi {
        var loginResponse: Response<LoginResponseDto> = Response.success(LoginResponseDto())
        var meResponse: Response<CurrentCustomerResponseDto> = Response.success(CurrentCustomerResponseDto())
        override suspend fun register(request: RegisterRequestDto) = Response.success(RegisterResponseDto())
        override suspend fun login(request: LoginRequestDto) = loginResponse
        override suspend fun getCurrentCustomer() = meResponse
    }
    private val json = Json { ignoreUnknownKeys = true }
    private fun token(id: String, expiry: Long): String {
        fun encode(value: String) = Base64.getUrlEncoder().withoutPadding().encodeToString(value.encodeToByteArray())
        return "${encode("{}")}.${encode("""{"studentId":"$id","exp":$expiry}""")}.signature"
    }
    private fun fixture(api: FakeApi, storage: MemoryStorage): DefaultAuthRepository {
        val handler = UnauthorizedSessionHandler(storage)
        return DefaultAuthRepository(api, storage, JwtSessionParser(json), NetworkErrorParser(json), handler, UnconfinedTestDispatcher())
    }
    private val customer = CustomerDto(id = "one", name = "Nayomi", email = "n@example.com")

    @Test fun `login saves secure session then publishes authenticated profile`() = runTest {
        val api = FakeApi()
        val storage = MemoryStorage()
        val jwt = token("one", Instant.now().epochSecond + 3600)
        api.loginResponse = Response.success(LoginResponseDto(true, data = LoginPayloadDto(jwt, customer)))
        api.meResponse = Response.success(CurrentCustomerResponseDto(true, data = StudentPayloadDto(customer)))
        val repository = fixture(api, storage)
        assertTrue(repository.login(LoginCredentials("N@EXAMPLE.COM", "secret")) is AppResult.Success)
        assertEquals(jwt, storage.value?.accessToken)
        assertTrue(repository.authenticationState.value is AuthenticationState.Authenticated)
    }
    @Test fun `valid stored session restores from authoritative me endpoint`() = runTest {
        val jwt = token("one", Instant.now().epochSecond + 3600)
        val storage = MemoryStorage(SessionData(jwt, Instant.now().epochSecond + 3600, "one"))
        val api = FakeApi().apply { meResponse = Response.success(CurrentCustomerResponseDto(true, data = StudentPayloadDto(customer))) }
        assertTrue(fixture(api, storage).restoreSession() is AuthenticationState.Authenticated)
    }
    @Test fun `malformed or expired stored token is cleared`() = runTest {
        val malformed = MemoryStorage(SessionData("bad", Long.MAX_VALUE, "one"))
        assertEquals(AuthenticationState.Guest, fixture(FakeApi(), malformed).restoreSession())
        assertNull(malformed.value)
        val expiredToken = token("one", Instant.now().epochSecond - 1)
        val expired = MemoryStorage(SessionData(expiredToken, Instant.now().epochSecond - 1, "one"))
        assertEquals(AuthenticationState.Guest, fixture(FakeApi(), expired).restoreSession())
        assertNull(expired.value)
    }
    @Test fun `logout clears only session and publishes guest`() = runTest {
        val storage = MemoryStorage(SessionData("token", Long.MAX_VALUE, "one"))
        val repository = fixture(FakeApi(), storage)
        repository.logout()
        assertNull(storage.value)
        assertEquals(AuthenticationState.Guest, repository.authenticationState.value)
    }
}
