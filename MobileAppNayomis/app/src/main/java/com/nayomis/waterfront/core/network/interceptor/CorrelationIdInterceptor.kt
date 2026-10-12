package com.nayomis.waterfront.core.network.interceptor

import java.util.UUID
import javax.inject.Inject
import okhttp3.Interceptor
import okhttp3.Response

class CorrelationIdInterceptor @Inject constructor() : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .header("X-Correlation-ID", UUID.randomUUID().toString())
            .build()
        return chain.proceed(request)
    }
}
