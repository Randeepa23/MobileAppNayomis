package com.nayomis.waterfront.feature.auth.data.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {
    @POST("students/register")
    suspend fun register(@Body request: RegisterRequestDto): Response<RegisterResponseDto>

    @POST("students/login")
    suspend fun login(@Body request: LoginRequestDto): Response<LoginResponseDto>

    @GET("students/me")
    suspend fun getCurrentCustomer(): Response<CurrentCustomerResponseDto>
}
