package com.nayomis.waterfront.feature.auth.data.network

import com.nayomis.waterfront.feature.auth.domain.Customer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequestDto(val name: String, val email: String, val password: String)

@Serializable
data class LoginRequestDto(val email: String, val password: String)

@Serializable
data class CustomerDto(
    @SerialName("_id") val mongoId: String? = null,
    val id: String? = null,
    val name: String? = null,
    val email: String? = null,
    val school: String? = null,
    val grade: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class StudentPayloadDto(val student: CustomerDto? = null)

@Serializable
data class LoginPayloadDto(val token: String? = null, val student: CustomerDto? = null)

@Serializable
data class RegisterResponseDto(
    val success: Boolean = false,
    val message: String? = null,
    val data: StudentPayloadDto? = null,
)

@Serializable
data class LoginResponseDto(
    val success: Boolean = false,
    val message: String? = null,
    val data: LoginPayloadDto? = null,
)

@Serializable
data class CurrentCustomerResponseDto(
    val success: Boolean = false,
    val message: String? = null,
    val data: StudentPayloadDto? = null,
)

fun CustomerDto.toDomain(): Customer? {
    val resolvedId = id?.takeIf { it.isNotBlank() } ?: mongoId?.takeIf { it.isNotBlank() } ?: return null
    val resolvedName = name?.takeIf { it.isNotBlank() } ?: return null
    val resolvedEmail = email?.takeIf { it.isNotBlank() } ?: return null
    return Customer(resolvedId, resolvedName, resolvedEmail, school, grade, createdAt)
}
