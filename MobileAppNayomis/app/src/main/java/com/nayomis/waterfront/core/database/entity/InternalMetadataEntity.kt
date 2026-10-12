package com.nayomis.waterfront.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "internal_metadata")
data class InternalMetadataEntity(
    @PrimaryKey val key: String,
    val value: String,
    val updatedAtEpochMillis: Long,
)
