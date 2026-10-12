package com.nayomis.waterfront.feature.auth.data

import java.util.Base64
import javax.inject.Inject
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull

data class ParsedJwtSession(val expiresAtEpochSeconds: Long, val customerId: String)

class JwtSessionParser @Inject constructor(private val json: Json) {
    fun parse(token: String): ParsedJwtSession? = runCatching {
        val parts = token.split('.')
        require(parts.size == 3)
        val decoded = Base64.getUrlDecoder().decode(parts[1]).decodeToString()
        val payload = json.parseToJsonElement(decoded).jsonObject
        val expiry = payload["exp"]?.jsonPrimitive?.longOrNull ?: return null
        val customerId = payload["studentId"]?.jsonPrimitive?.content?.takeIf(String::isNotBlank)
            ?: payload["sub"]?.jsonPrimitive?.content?.takeIf(String::isNotBlank)
            ?: return null
        ParsedJwtSession(expiry, customerId)
    }.getOrNull()

    fun isExpired(session: ParsedJwtSession, nowEpochSeconds: Long, skewSeconds: Long = 30): Boolean =
        session.expiresAtEpochSeconds <= nowEpochSeconds + skewSeconds
}
