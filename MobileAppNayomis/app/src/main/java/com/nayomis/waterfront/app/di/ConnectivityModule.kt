package com.nayomis.waterfront.app.di

import com.nayomis.waterfront.core.connectivity.AndroidConnectivityObserver
import com.nayomis.waterfront.core.connectivity.ConnectivityObserver
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class ConnectivityModule {
    @Binds @Singleton abstract fun bindConnectivityObserver(impl: AndroidConnectivityObserver): ConnectivityObserver
}
