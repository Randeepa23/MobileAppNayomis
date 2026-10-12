package com.nayomis.waterfront.feature.auth

import com.nayomis.waterfront.feature.auth.data.network.CustomerDto
import com.nayomis.waterfront.feature.auth.data.network.LoginRequestDto
import com.nayomis.waterfront.feature.auth.data.network.RegisterRequestDto
import com.nayomis.waterfront.feature.auth.data.network.toDomain
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class AuthDtoMappingTest {
    private val json = Json { ignoreUnknownKeys = true }
    @Test fun `customer dto maps verified fields`() {
        val dto = json.decodeFromString<CustomerDto>("""{"_id":"abc","name":"Nayomi","email":"n@example.com","future":true}""")
        assertEquals("abc", dto.toDomain()?.id)
        assertEquals("Nayomi", dto.toDomain()?.fullName)
    }
    @Test fun `customer mapping rejects incomplete success data`() {
        assertNull(CustomerDto(id = "abc", name = null, email = "n@example.com").toDomain())
    }
    @Test fun `request dto field names match backend`() {
        assertEquals("""{"name":"Name","email":"e@example.com","password":"secret"}""",
            json.encodeToString(RegisterRequestDto.serializer(), RegisterRequestDto("Name", "e@example.com", "secret")))
        assertEquals("e@example.com", LoginRequestDto("e@example.com", "secret").email)
    }
}
