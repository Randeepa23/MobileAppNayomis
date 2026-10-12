package com.nayomis.waterfront.core.security

import java.util.concurrent.atomic.AtomicBoolean
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

@Singleton
class UnauthorizedSessionHandler @Inject constructor(private val storage: SessionStorage) {
    private val invalidated = AtomicBoolean(false)
    private val _events = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val events: SharedFlow<Unit> = _events.asSharedFlow()

    fun invalidateOnce() {
        if (invalidated.compareAndSet(false, true)) {
            storage.clear()
            _events.tryEmit(Unit)
        }
    }

    fun onNewSession() { invalidated.set(false) }
}
