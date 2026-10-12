package com.nayomis.waterfront.app.di

import android.content.Context
import androidx.room.Room
import com.nayomis.waterfront.core.database.AppDatabase
import com.nayomis.waterfront.core.database.dao.InternalMetadataDao
import com.nayomis.waterfront.core.database.migration.DatabaseMigrations
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "nayomis.db")
            .addMigrations(*DatabaseMigrations.all)
            .build()

    @Provides fun provideInternalMetadataDao(database: AppDatabase): InternalMetadataDao = database.internalMetadataDao()
}
