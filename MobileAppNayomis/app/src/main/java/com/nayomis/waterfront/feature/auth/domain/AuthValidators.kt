package com.nayomis.waterfront.feature.auth.domain

import androidx.core.util.PatternsCompat

object FullNameValidator {
    fun error(value: String): String? = when {
        value.trim().isEmpty() -> "Full name is required."
        value.trim().length < 2 -> "Enter at least 2 characters."
        value.trim().length > 100 -> "Full name is too long."
        else -> null
    }
}

object EmailValidator {
    fun error(value: String): String? {
        val normalized = value.trim()
        return when {
            normalized.isEmpty() -> "Email is required."
            !PatternsCompat.EMAIL_ADDRESS.matcher(normalized).matches() -> "Enter a valid email address."
            else -> null
        }
    }
}

object PasswordValidator {
    const val MIN_LENGTH = 6
    fun error(value: String): String? = when {
        value.isEmpty() -> "Password is required."
        value.length < MIN_LENGTH -> "Password must be at least $MIN_LENGTH characters."
        value.length > 128 -> "Password must be no more than 128 characters."
        else -> null
    }
}

object PasswordConfirmationValidator {
    fun error(password: String, confirmation: String): String? = when {
        confirmation.isEmpty() -> "Please confirm your password."
        password != confirmation -> "Passwords do not match."
        else -> null
    }
}
