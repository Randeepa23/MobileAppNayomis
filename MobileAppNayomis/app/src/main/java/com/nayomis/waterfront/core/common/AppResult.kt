package com.nayomis.waterfront.core.common

sealed interface AppResult<out T> {
    data class Success<T>(val value: T) : AppResult<T>
    data class Failure(val error: AppError) : AppResult<Nothing>
}

sealed interface AppError {
    data class Network(val cause: Throwable? = null) : AppError
    data class Validation(
        val fields: Map<String, String> = emptyMap(),
        val message: String? = null,
        val code: String? = null,
    ) : AppError
    data object Unauthorized : AppError
    data object SessionExpired : AppError
    data class Server(val statusCode: Int, val message: String? = null, val correlationId: String? = null) : AppError
    data class Unknown(val cause: Throwable? = null) : AppError
}
