package com.nayomis.waterfront.feature.auth

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.nayomis.waterfront.feature.auth.data.network.AuthApi
import com.nayomis.waterfront.feature.auth.data.network.LoginRequestDto
import com.nayomis.waterfront.feature.auth.data.network.RegisterRequestDto
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.SocketPolicy
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import retrofit2.Retrofit

class AuthApiContractTest {
    private lateinit var server: MockWebServer
    private lateinit var api: AuthApi
    @Before fun setup() {
        server = MockWebServer()
        server.start()
        val json = Json { ignoreUnknownKeys = true; explicitNulls = false }
        val client = OkHttpClient.Builder().readTimeout(150, TimeUnit.MILLISECONDS).build()
        api = Retrofit.Builder().baseUrl(server.url("/api/")).client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType())).build().create(AuthApi::class.java)
    }
    @After fun tearDown() { server.shutdown() }
    private fun response(code: Int, body: String) = MockResponse().setResponseCode(code).setHeader("Content-Type", "application/json").setBody(body)

    @Test fun `successful registration uses verified contract`() = runTest {
        server.enqueue(response(201, """{"success":true,"message":"Student registered successfully","data":{"student":{"_id":"1","id":"1","name":"Nayomi","email":"nayomi@example.com"}}}"""))
        val result = api.register(RegisterRequestDto("Nayomi", "nayomi@example.com", "secret"))
        assertTrue(result.body()?.success == true)
        assertEquals("/api/students/register", server.takeRequest().path)
    }
    @Test fun `duplicate registration remains an error response`() = runTest {
        server.enqueue(response(400, """{"success":false,"code":"EMAIL_ALREADY_EXISTS","message":"An account already exists with this email."}"""))
        assertEquals(400, api.register(RegisterRequestDto("N", "n@example.com", "secret")).code())
    }
    @Test fun `validation registration remains an error response`() = runTest {
        server.enqueue(response(400, """{"success":false,"code":"VALIDATION_ERROR","errors":{"email":"Enter a valid email address."}}"""))
        assertEquals(400, api.register(RegisterRequestDto("N", "bad", "secret")).code())
    }
    @Test fun `successful login reads token and student`() = runTest {
        server.enqueue(response(200, """{"success":true,"data":{"token":"a.b.c","student":{"id":"1","name":"Nayomi","email":"n@example.com"}}}"""))
        val body = api.login(LoginRequestDto("n@example.com", "secret")).body()
        assertEquals("a.b.c", body?.data?.token)
        assertEquals("1", body?.data?.student?.id)
    }
    @Test fun `invalid login is 401`() = runTest {
        server.enqueue(response(401, """{"success":false,"code":"INVALID_CREDENTIALS","message":"Invalid email or password"}"""))
        assertEquals(401, api.login(LoginRequestDto("n@example.com", "wrong")).code())
    }
    @Test fun `current customer uses me route and verified nesting`() = runTest {
        server.enqueue(response(200, """{"success":true,"data":{"student":{"_id":"1","name":"Nayomi","email":"n@example.com"}}}"""))
        assertEquals("1", api.getCurrentCustomer().body()?.data?.student?.mongoId)
        assertEquals("/api/students/me", server.takeRequest().path)
    }
    @Test fun `unauthorized current customer is surfaced`() = runTest {
        server.enqueue(response(401, """{"success":false,"code":"SESSION_EXPIRED"}"""))
        assertEquals(401, api.getCurrentCustomer().code())
    }
    @Test fun `malformed success and empty token remain safely optional`() = runTest {
        server.enqueue(response(200, """{"success":true,"data":{"student":{}}}"""))
        assertNull(api.getCurrentCustomer().body()?.data?.student?.id)
        server.enqueue(response(200, """{"success":true,"data":{"token":"","student":{"id":"1","name":"N","email":"n@example.com"}}}"""))
        assertEquals("", api.login(LoginRequestDto("n@example.com", "secret")).body()?.data?.token)
    }
    @Test fun `rate limit and server failure are surfaced`() = runTest {
        server.enqueue(response(429, """{"success":false,"code":"RATE_LIMITED"}"""))
        assertEquals(429, api.login(LoginRequestDto("n@example.com", "secret")).code())
        server.enqueue(response(500, """{"success":false,"code":"INTERNAL_ERROR"}"""))
        assertFalse(api.getCurrentCustomer().isSuccessful)
    }
    @Test fun `timeout throws network failure`() = runTest {
        server.enqueue(MockResponse().setSocketPolicy(SocketPolicy.NO_RESPONSE))
        val failed = runCatching { api.getCurrentCustomer() }.isFailure
        assertTrue(failed)
    }
}
