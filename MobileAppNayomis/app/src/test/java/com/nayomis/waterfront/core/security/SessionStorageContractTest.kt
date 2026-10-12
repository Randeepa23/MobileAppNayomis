package com.nayomis.waterfront.core.security

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SessionStorageContractTest {
    private class InMemorySessionStorage : SessionStorage {
        private var value: SessionData? = null
        override fun save(session: SessionData) { value = session }
        override fun read(): SessionData? = value
        override fun clear() { value = null }
    }

    @Test fun `session contract supports save read and clear without inventing defaults`() {
        val storage = InMemorySessionStorage()
        assertNull(storage.read())
        val session = SessionData("access", 2_000, "session")
        storage.save(session)
        assertEquals(session, storage.read())
        storage.clear()
        assertNull(storage.read())
    }

    @Test fun `active session requires identity token and future expiry`() {
        assertTrue(SessionData("access", 2_000, "session").isActive(1_000))
        assertFalse(SessionData("access", 1_000, "session").isActive(1_000))
        assertFalse(SessionData("", 2_000, "session").isActive(1_000))
    }
}
