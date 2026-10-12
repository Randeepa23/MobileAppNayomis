package com.nayomis.waterfront.core.database.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.nayomis.waterfront.core.database.entity.InternalMetadataEntity

@Dao
interface InternalMetadataDao {
    @Query("SELECT * FROM internal_metadata WHERE `key` = :key LIMIT 1")
    suspend fun find(key: String): InternalMetadataEntity?

    @Upsert
    suspend fun upsert(value: InternalMetadataEntity)
}
