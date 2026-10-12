package com.nayomis.waterfront.feature.auth

import com.nayomis.waterfront.feature.auth.data.JwtSessionParser
import java.util.Base64
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class JwtSessionParserTest {
    private val parser = JwtSessionParser(Json)
    private fun token(payload: String): String {
        val encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.encodeToByteArray())
        return "header.$encoded.signature"
    }
    @Test fun `reads customer identity and expiry without claiming verification`() {
        val parsed = parser.parse(token("""{"studentId":"student-1","exp":2000}"""))
        assertEquals("student-1", parsed?.customerId)
        assertEquals(2000L, parsed?.expiresAtEpochSeconds)
    }
    @Test fun `malformed token is rejected`() { assertNull(parser.parse("bad-token")) }
    @Test fun `expiry includes skew margin`() {
        val parsed = parser.parse(token("""{"studentId":"one","exp":1020}"""))!!
        assertTrue(parser.isExpired(parsed, 1000))
    }
}
