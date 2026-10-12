package com.nayomis.waterfront.core.network

import com.nayomis.waterfront.core.network.interceptor.AuthorizationInterceptor
import com.nayomis.waterfront.core.security.SessionData
import com.nayomis.waterfront.core.security.SessionStorage
import com.nayomis.waterfront.core.security.UnauthorizedSessionHandler
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class AuthorizationInterceptorTest {
    private class MemoryStorage(var value: SessionData? = null) : SessionStorage {
        var clears = 0
        override fun save(session: SessionData) { value = session }
        override fun read(): SessionData? = value
        override fun clear() { clears++; value = null }
    }
    private lateinit var server: MockWebServer
    @Before fun setup() { server = MockWebServer(); server.start() }
    @After fun close() { server.shutdown() }
    private fun client(storage: MemoryStorage): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(AuthorizationInterceptor(storage, UnauthorizedSessionHandler(storage))).build()

    @Test fun `protected request injects bearer token`() {
        val storage = MemoryStorage(SessionData("token", Long.MAX_VALUE, "one"))
        server.enqueue(MockResponse().setResponseCode(200))
        client(storage).newCall(Request.Builder().url(server.url("/api/students/me")).build()).execute().close()
        assertEquals("Bearer token", server.takeRequest().getHeader("Authorization"))
    }
    @Test fun `public auth requests never receive token and invalid login does not clear session`() {
        val storage = MemoryStorage(SessionData("token", Long.MAX_VALUE, "one"))
        server.enqueue(MockResponse().setResponseCode(401))
        client(storage).newCall(Request.Builder().url(server.url("/api/students/login")).build()).execute().close()
        assertNull(server.takeRequest().getHeader("Authorization"))
        assertEquals(0, storage.clears)
    }
    @Test fun `protected 401 invalidates stored session once`() {
        val storage = MemoryStorage(SessionData("token", Long.MAX_VALUE, "one"))
        server.enqueue(MockResponse().setResponseCode(401))
        client(storage).newCall(Request.Builder().url(server.url("/api/students/me")).build()).execute().close()
        assertTrue(storage.clears == 1 && storage.value == null)
    }
}
