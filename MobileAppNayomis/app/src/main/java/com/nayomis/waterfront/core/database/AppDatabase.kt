package com.nayomis.waterfront.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.nayomis.waterfront.core.database.dao.InternalMetadataDao
import com.nayomis.waterfront.core.database.entity.InternalMetadataEntity

@Database(entities = [InternalMetadataEntity::class], version = 1, exportSchema = true)
abstract class AppDatabase : RoomDatabase() {
    abstract fun internalMetadataDao(): InternalMetadataDao
}
