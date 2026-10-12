package com.nayomis.waterfront.core.connectivity

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged

enum class ConnectivityStatus { AVAILABLE, UNAVAILABLE }

interface ConnectivityObserver {
    val status: Flow<ConnectivityStatus>
}

@Singleton
class AndroidConnectivityObserver @Inject constructor(
    @ApplicationContext context: Context,
) : ConnectivityObserver {
    private val manager = context.getSystemService(ConnectivityManager::class.java)

    override val status: Flow<ConnectivityStatus> = callbackFlow {
        fun current(): ConnectivityStatus {
            val network = manager.activeNetwork ?: return ConnectivityStatus.UNAVAILABLE
            val capabilities = manager.getNetworkCapabilities(network)
            return if (capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true) {
                ConnectivityStatus.AVAILABLE
            } else ConnectivityStatus.UNAVAILABLE
        }

        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { trySend(current()) }
            override fun onLost(network: Network) { trySend(current()) }
            override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) { trySend(current()) }
        }
        trySend(current())
        manager.registerDefaultNetworkCallback(callback)
        awaitClose { manager.unregisterNetworkCallback(callback) }
    }.distinctUntilChanged()
}
