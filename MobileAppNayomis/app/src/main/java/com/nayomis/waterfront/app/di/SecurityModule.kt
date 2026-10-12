package com.nayomis.waterfront.app.di

import com.nayomis.waterfront.core.security.DefaultSessionRepository
import com.nayomis.waterfront.core.security.KeystoreSessionStorage
import com.nayomis.waterfront.core.security.SessionRepository
import com.nayomis.waterfront.core.security.SessionStorage
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class SecurityModule {
    @Binds @Singleton abstract fun bindSessionStorage(impl: KeystoreSessionStorage): SessionStorage
    @Binds @Singleton abstract fun bindSessionRepository(impl: DefaultSessionRepository): SessionRepository
}
