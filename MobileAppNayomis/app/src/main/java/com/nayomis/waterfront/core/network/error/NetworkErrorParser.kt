package com.nayomis.waterfront.core.network.error

import com.nayomis.waterfront.core.common.AppError
import com.nayomis.waterfront.core.network.dto.ApiErrorResponse
import kotlinx.serialization.json.Json
import okhttp3.ResponseBody
import javax.inject.Inject

class NetworkErrorParser @Inject constructor(private val json: Json) {
    fun parse(statusCode: Int, body: ResponseBody?, correlationId: String?): AppError {
        val parsed = body?.string()?.takeIf(String::isNotBlank)?.let {
            runCatching { json.decodeFromString<ApiErrorResponse>(it) }.getOrNull()
        }
        if (parsed?.errors?.isNotEmpty() == true) {
            return AppError.Validation(parsed.errors, parsed.message, parsed.code)
        }
        if (statusCode in 400..499 && parsed?.code != null) {
            return AppError.Validation(message = parsed.message, code = parsed.code)
        }
        return StandardErrorMapper.fromHttp(
            statusCode = statusCode,
            message = parsed?.message,
            correlationId = parsed?.correlationId ?: correlationId,
        )
    }
}
