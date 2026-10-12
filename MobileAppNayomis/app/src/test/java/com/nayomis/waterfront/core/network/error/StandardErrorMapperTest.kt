package com.nayomis.waterfront.core.network.error

import com.nayomis.waterfront.core.common.AppError
import java.io.IOException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class StandardErrorMapperTest {
    @Test fun `io exception maps to network error`() {
        assertTrue(StandardErrorMapper.fromThrowable(IOException("offline")) is AppError.Network)
    }

    @Test fun `unauthorized and server statuses map consistently`() {
        assertEquals(AppError.Unauthorized, StandardErrorMapper.fromHttp(401))
        assertEquals(AppError.Server(503, "Unavailable", "cid"), StandardErrorMapper.fromHttp(503, "Unavailable", "cid"))
    }

    @Test fun `client failure maps to validation foundation`() {
        assertEquals(AppError.Validation(message = "Invalid"), StandardErrorMapper.fromHttp(422, "Invalid"))
    }
}
