package com.nayomis.waterfront.core.security

import kotlinx.serialization.Serializable

@Serializable
data class SessionData(
    val accessToken: String,
    val expiresAtEpochSeconds: Long,
    val sessionId: String,
) {
    fun isActive(nowEpochSeconds: Long): Boolean =
        accessToken.isNotBlank() && sessionId.isNotBlank() && expiresAtEpochSeconds > nowEpochSeconds
}

interface SessionStorage {
    fun save(session: SessionData)
    fun read(): SessionData?
    fun clear()
}

interface SessionRepository {
    suspend fun hasActiveSession(): Boolean
}
