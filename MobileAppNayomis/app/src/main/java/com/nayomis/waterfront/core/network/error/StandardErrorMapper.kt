package com.nayomis.waterfront.core.network.error

import com.nayomis.waterfront.core.common.AppError
import java.io.IOException
import kotlinx.serialization.SerializationException
import retrofit2.HttpException

object StandardErrorMapper {
    fun fromHttp(statusCode: Int, message: String? = null, correlationId: String? = null): AppError = when (statusCode) {
        401 -> AppError.Unauthorized
        419 -> AppError.SessionExpired
        in 400..499 -> AppError.Validation(message = message)
        in 500..599 -> AppError.Server(statusCode, message, correlationId)
        else -> AppError.Unknown()
    }

    fun fromThrowable(throwable: Throwable): AppError = when (throwable) {
        is IOException -> AppError.Network(throwable)
        is HttpException -> fromHttp(throwable.code(), throwable.message())
        is SerializationException -> AppError.Server(statusCode = 0, message = "The server response could not be read.")
        else -> AppError.Unknown(throwable)
    }
}
