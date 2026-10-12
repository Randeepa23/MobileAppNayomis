package com.nayomis.waterfront.core.security

import com.nayomis.waterfront.app.di.IoDispatcher
import java.time.Instant
import javax.inject.Inject
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext

class DefaultSessionRepository @Inject constructor(
    private val storage: SessionStorage,
    @IoDispatcher private val dispatcher: CoroutineDispatcher,
) : SessionRepository {
    override suspend fun hasActiveSession(): Boolean = withContext(dispatcher) {
        storage.read()?.isActive(Instant.now().epochSecond) == true
    }
}
