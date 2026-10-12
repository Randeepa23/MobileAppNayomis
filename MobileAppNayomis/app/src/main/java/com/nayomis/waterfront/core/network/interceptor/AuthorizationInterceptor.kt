package com.nayomis.waterfront.core.network.interceptor

import com.nayomis.waterfront.core.security.SessionStorage
import com.nayomis.waterfront.core.security.UnauthorizedSessionHandler
import javax.inject.Inject
import okhttp3.Interceptor
import okhttp3.Response

class AuthorizationInterceptor @Inject constructor(
    private val sessionStorage: SessionStorage,
    private val unauthorizedSessionHandler: UnauthorizedSessionHandler,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val publicAuthRequest = original.url.encodedPath.endsWith("/students/login") ||
            original.url.encodedPath.endsWith("/students/register")
        val token = if (publicAuthRequest) null else sessionStorage.read()?.accessToken
        val request = if (token.isNullOrBlank()) original else original.newBuilder()
            .header("Authorization", "Bearer $token")
            .build()
        return chain.proceed(request).also { response ->
            if (!publicAuthRequest && !token.isNullOrBlank() && response.code == 401) {
                unauthorizedSessionHandler.invalidateOnce()
            }
        }
    }
}
