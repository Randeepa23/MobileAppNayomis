package com.nayomis.waterfront.feature.auth

import com.nayomis.waterfront.feature.auth.domain.EmailValidator
import com.nayomis.waterfront.feature.auth.domain.FullNameValidator
import com.nayomis.waterfront.feature.auth.domain.PasswordConfirmationValidator
import com.nayomis.waterfront.feature.auth.domain.PasswordValidator
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class AuthValidatorsTest {
    @Test fun `full name trims and requires two characters`() {
        assertNotNull(FullNameValidator.error(" "))
        assertNotNull(FullNameValidator.error("A"))
        assertNull(FullNameValidator.error("  Nayomi Perera  "))
    }
    @Test fun `email accepts normalized address and rejects invalid input`() {
        assertNull(EmailValidator.error(" customer@example.com "))
        assertNotNull(EmailValidator.error("not-an-email"))
    }
    @Test fun `password follows verified six character backend minimum`() {
        assertNotNull(PasswordValidator.error("12345"))
        assertNull(PasswordValidator.error("123456"))
    }
    @Test fun `confirmation must match`() {
        assertNotNull(PasswordConfirmationValidator.error("secret", "different"))
        assertNull(PasswordConfirmationValidator.error("secret", "secret"))
    }
}
