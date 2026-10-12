package com.nayomis.waterfront.app.di

import com.nayomis.waterfront.feature.auth.data.DefaultAuthRepository
import com.nayomis.waterfront.feature.auth.data.network.AuthApi
import com.nayomis.waterfront.feature.auth.domain.AuthRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import retrofit2.Retrofit

@Module
@InstallIn(SingletonComponent::class)
abstract class AuthModule {
    @Binds
    @Singleton
    abstract fun bindAuthRepository(implementation: DefaultAuthRepository): AuthRepository

    companion object {
        @Provides
        @Singleton
        fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)
    }
}
