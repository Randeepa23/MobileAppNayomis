import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/tracking_providers.dart';
import '../data/tracking_repository.dart';

class TrackingScreen extends ConsumerWidget {
  const TrackingScreen({super.key, required this.orderId});
  final String orderId;

  SafetyStatus _mapSafetyStatus(LiveSensorSnapshot data) {
    if (data.deviceStatus == 'offline' || data.deviceId == null) {
      return SafetyStatus.offline;
    }
    if (data.deviceStatus == 'stale') {
      return SafetyStatus.warning;
    }
    if (data.boxOpen == true) {
      return SafetyStatus.warning;
    }
    if (data.temperatureC != null && (data.temperatureC! < 4 || data.temperatureC! > 60)) {
      return SafetyStatus.critical;
    }
    if (data.gasRaw != null && data.gasRaw! > 800) {
      return SafetyStatus.critical;
    }
    return SafetyStatus.safe;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trackingAsync = ref.watch(latestTrackingProvider(orderId));

    return Scaffold(
      appBar: BrandedAppBar(
        title: 'Delivery tracking',
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Telemetry',
            onPressed: () => ref.refresh(latestTrackingProvider(orderId)),
          ),
        ],
      ),
      body: trackingAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.cloud_off, size: 48, color: Colors.black45),
                const SizedBox(height: 12),
                Text(
                  error.toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.black87),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.refresh(latestTrackingProvider(orderId)),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
        data: (snapshot) {
          final safetyStatus = _mapSafetyStatus(snapshot);

          return RefreshIndicator(
            onRefresh: () async => ref.refresh(latestTrackingProvider(orderId).future),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      snapshot.orderNumber.isNotEmpty ? snapshot.orderNumber : 'Order #' + orderId.substring(orderId.length - 6).toUpperCase(),
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    if (snapshot.deviceId != null)
                      Chip(
                        avatar: const Icon(Icons.sensors, size: 16),
                        label: Text(snapshot.deviceId!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                        side: BorderSide(color: AppColors.primary.withValues(alpha: 0.3)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                SafetyStatusPanel(
                  status: safetyStatus,
                  lastUpdated: snapshot.receivedAt,
                ),
                const SizedBox(height: 16),

                // GPS Location Card
                Card(
                  clipBehavior: Clip.antiAlias,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: [
                      Container(
                        height: 140,
                        color: Colors.grey.shade200,
                        child: Center(
                          child: snapshot.latitude != null && snapshot.longitude != null
                              ? Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.location_on, size: 40, color: AppColors.primary),
                                    const SizedBox(height: 6),
                                    Text(
                                      '${snapshot.latitude!.toStringAsFixed(5)}, ${snapshot.longitude!.toStringAsFixed(5)}',
                                      style: const TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                    const Text('Verified GPS Coordinates', style: TextStyle(fontSize: 11, color: Colors.black54)),
                                  ],
                                )
                              : const Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.location_off, size: 40, color: Colors.black38),
                                    SizedBox(height: 6),
                                    Text('Waiting for live GPS satellite fix', style: TextStyle(color: Colors.black54)),
                                  ],
                                ),
                        ),
                      ),
                      ListTile(
                        leading: const Icon(Icons.map_outlined, color: AppColors.primary),
                        title: const Text('Live Location Coordinates'),
                        subtitle: Text(
                          snapshot.latitude != null && snapshot.longitude != null
                              ? 'Lat: ${snapshot.latitude!.toStringAsFixed(6)} | Lon: ${snapshot.longitude!.toStringAsFixed(6)}'
                              : 'Location observation not yet received',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Environmental & Hardware Sensors Card
                Card(
                  elevation: 1,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.thermostat, color: Colors.deepOrange),
                        title: const Text('Internal Temperature'),
                        subtitle: const Text('DHT11 Environmental Sensor'),
                        trailing: Text(
                          snapshot.temperatureC != null ? '${snapshot.temperatureC!.toStringAsFixed(1)} °C' : 'N/A',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.water_drop_outlined, color: Colors.blue),
                        title: const Text('Internal Humidity'),
                        subtitle: const Text('DHT11 Relative Humidity'),
                        trailing: Text(
                          snapshot.humidityPercent != null ? '${snapshot.humidityPercent!.toStringAsFixed(1)} %' : 'N/A',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.air, color: Colors.teal),
                        title: const Text('Air Quality / Gas Sensor'),
                        subtitle: const Text('Installed Gas Detection Sensor'),
                        trailing: Text(
                          snapshot.gasRaw != null ? '${snapshot.gasRaw!.toInt()} ADC' : 'N/A',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.vibration, color: Colors.purple),
                        title: const Text('Motion & Handling'),
                        subtitle: const Text('3-Axis Accelerometer Sensor'),
                        trailing: Text(
                          snapshot.motionDetected == null ? 'N/A' : snapshot.motionDetected! ? 'Motion Active' : 'Stable',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: snapshot.motionDetected == true ? Colors.purple : Colors.black87,
                          ),
                        ),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: Icon(
                          snapshot.boxOpen == true ? Icons.lock_open : Icons.lock_outline,
                          color: snapshot.boxOpen == true ? Colors.red : Colors.green,
                        ),
                        title: const Text('Container Lid State'),
                        subtitle: const Text('Tamper and Access Detection'),
                        trailing: Text(
                          snapshot.boxOpen == null ? 'N/A' : snapshot.boxOpen! ? 'OPENED' : 'Sealed',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: snapshot.boxOpen == true ? Colors.red : Colors.green,
                          ),
                        ),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.battery_charging_full, color: Colors.green),
                        title: const Text('Monitoring Device Battery'),
                        subtitle: const Text('ESP32 Power Unit'),
                        trailing: Text(
                          snapshot.batteryPercent != null ? '${snapshot.batteryPercent!.toInt()}%' : 'N/A',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // HACCP Disclaimer Box
                const Card(
                  color: Color(0xFFFFF8F0),
                  child: Padding(
                    padding: EdgeInsets.all(14),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline, color: AppColors.primary, size: 20),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Observation readings help verify delivery conditions. Food safety sign-off remains the operational responsibility of authorized staff.',
                            style: TextStyle(fontSize: 12, color: Colors.black87),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: const Icon(Icons.local_shipping_outlined),
                    label: const Text('Driver & Operations Perspective'),
                    onPressed: () => context.push('/driver'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
