package com.nayomis.waterfront.core.network.dto

import kotlinx.serialization.Serializable

@Serializable
data class ApiEnvelope<T>(
    val data: T? = null,
    val message: String? = null,
    val correlationId: String? = null,
)

@Serializable
data class ApiErrorResponse(
    val message: String? = null,
    val code: String? = null,
    val errors: Map<String, String> = emptyMap(),
    val correlationId: String? = null,
)
