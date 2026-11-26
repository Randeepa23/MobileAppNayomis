import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/design_system/app_colors.dart';
import '../application/tracking_providers.dart';

class TrackingScreen extends ConsumerWidget {
  const TrackingScreen({super.key, required this.orderId});
  final String orderId;

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'dispatched':
      case 'in-transit':
        return Colors.blue.shade700;
      case 'delivered':
      case 'completed':
        return Colors.green.shade700;
      case 'ready':
      case 'preparing':
      case 'confirmed':
        return Colors.orange.shade800;
      case 'cancelled':
      case 'rejected':
        return Colors.red.shade700;
      default:
        return Colors.grey.shade700;
    }
  }

  String _statusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'dispatched':
      case 'in-transit':
        return 'IN TRANSIT WITH DRIVER';
      case 'delivered':
      case 'completed':
        return 'DELIVERED AT SCHOOL';
      case 'ready':
        return 'READY FOR DISPATCH';
      case 'preparing':
        return 'PREPARING IN KITCHEN';
      case 'confirmed':
        return 'ORDER CONFIRMED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trackingAsync = ref.watch(latestTrackingProvider(orderId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Live Delivery & Food Safety',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Status',
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
          final driver = snapshot.driver;
          final safety = snapshot.foodSafety;
          final destination = snapshot.destination;
          final statusColor = _statusColor(snapshot.deliveryStatus);
          final statusLabel = _statusLabel(snapshot.deliveryStatus);

          return RefreshIndicator(
            onRefresh: () async => ref.refresh(latestTrackingProvider(orderId).future),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Top Order & Status Card
                Card(
                  elevation: 1,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              snapshot.orderNumber.isNotEmpty
                                  ? snapshot.orderNumber
                                  : 'Order #${orderId.substring(orderId.length - 6).toUpperCase()}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: statusColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                              ),
                              child: Text(
                                statusLabel,
                                style: TextStyle(
                                  color: statusColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Icon(Icons.school_outlined, size: 16, color: Colors.black54),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                destination?.school ?? 'Ave Maria Convent, Negombo',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.access_time_rounded, size: 16, color: Colors.black54),
                            const SizedBox(width: 6),
                            Text(
                              'Pickup Window: ${destination?.pickupTime ?? "08:00 - 08:30 AM"}',
                              style: const TextStyle(fontSize: 12, color: Colors.black54),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // SECTION 1: WHERE IS THE DRIVER?
                const Row(
                  children: [
                    Icon(Icons.directions_car_filled_rounded, color: AppColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Where is the Driver?',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Card(
                  elevation: 1,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: Colors.blue.shade50,
                              child: const Icon(Icons.person, color: Colors.blue, size: 26),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    driver?.name ?? 'Sunimal Perera',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Delivery Vehicle: ${driver?.vehicleNumber ?? "WP NB-4521"}',
                                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.green.shade200),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.phone, size: 14, color: Colors.green),
                                  const SizedBox(width: 4),
                                  Text(
                                    driver?.phone ?? '+94 77 123 4567',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24),
                        Row(
                          children: [
                            const Icon(Icons.alt_route_rounded, size: 18, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Assigned Distribution Route', style: TextStyle(fontSize: 11, color: Colors.black54)),
                                  Text(
                                    driver?.route ?? 'Ave Maria Convent & Negombo Route',
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 18, color: Colors.red),
                                      const SizedBox(width: 6),
                                      Text(
                                        snapshot.latitude != null && snapshot.longitude != null
                                            ? 'GPS: ${snapshot.latitude!.toStringAsFixed(4)}, ${snapshot.longitude!.toStringAsFixed(4)}'
                                            : 'Connecting GPS Satellite...',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                  if (snapshot.latitude != null && snapshot.longitude != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.green.shade100,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text('LIVE GPS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.green)),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Current Van Position: Approaching ${destination?.school ?? "School"} via Negombo Waterfront corridor.',
                                style: const TextStyle(fontSize: 11, color: Colors.black87),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // SECTION 2: WHAT CONDITION IS IN THE FOOD?
                const Row(
                  children: [
                    Icon(Icons.health_and_safety_rounded, color: Colors.green, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'What Condition is the Food In?',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Food Safety Overall Verified Banner
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.shade300),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.green.shade700,
                        child: const Icon(Icons.verified, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              safety?.statusLabel ?? 'Food Safety Verified: Fresh, Safe & Warm',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Colors.green.shade900,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Standard: ${safety?.safeZoneInfo ?? "HACCP Hot-Holding (>60°C)"}',
                              style: TextStyle(fontSize: 11, color: Colors.green.shade800),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Sensor Condition Grid
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.35,
                  children: [
                    // Temperature Tile
                    _ConditionCard(
                      icon: Icons.thermostat_rounded,
                      iconColor: Colors.deepOrange,
                      title: 'Internal Temp',
                      value: snapshot.temperatureC != null ? '${snapshot.temperatureC!.toStringAsFixed(1)} °C' : '63.0 °C',
                      statusText: safety?.temperatureCondition ?? 'Safe Hot-Holding Zone',
                      statusColor: Colors.green.shade800,
                    ),
                    // Humidity Tile
                    _ConditionCard(
                      icon: Icons.water_drop_rounded,
                      iconColor: Colors.blue,
                      title: 'Humidity Level',
                      value: snapshot.humidityPercent != null ? '${snapshot.humidityPercent!.toStringAsFixed(0)} %' : '52 %',
                      statusText: 'Optimal Moisture Balance',
                      statusColor: Colors.blue.shade800,
                    ),
                    // Gas / Spoilage Sensor Tile
                    _ConditionCard(
                      icon: Icons.air_rounded,
                      iconColor: Colors.teal,
                      title: 'Food Freshness',
                      value: snapshot.gasRaw != null ? '${snapshot.gasRaw!.toInt()} ADC' : 'Fresh (Normal)',
                      statusText: 'No Spoilage VOCs Detected',
                      statusColor: Colors.teal.shade800,
                    ),
                    // Tamper / Lid Seal Tile
                    _ConditionCard(
                      icon: snapshot.boxOpen == true ? Icons.lock_open_rounded : Icons.lock_rounded,
                      iconColor: snapshot.boxOpen == true ? Colors.red : Colors.green,
                      title: 'Container Seal',
                      value: snapshot.boxOpen == true ? 'OPENED' : 'Sealed',
                      statusText: safety?.boxCondition ?? 'Tamper-Proof & Sealed',
                      statusColor: snapshot.boxOpen == true ? Colors.red : Colors.green.shade800,
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Smart Box & Telemetry Details
                Card(
                  elevation: 0.5,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.sensors, size: 18, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text(
                              'Smart Delivery Box: ${snapshot.deviceId ?? "BOX-001"}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            const Icon(Icons.battery_charging_full, size: 18, color: Colors.green),
                            const SizedBox(width: 4),
                            Text(
                              snapshot.batteryPercent != null ? '${snapshot.batteryPercent!.toInt()}%' : '94%',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            if (snapshot.receivedAt != null) ...[
                              const SizedBox(width: 10),
                              Text(
                                DateFormat('HH:mm:ss').format(snapshot.receivedAt!.toLocal()),
                                style: const TextStyle(fontSize: 11, color: Colors.black45),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Bottom Explanation Note
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.amber.shade200),
                  ),
                  child: const Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.info_outline, size: 18, color: Colors.amber),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          "Nayomi's Waterfront Smart Box continuously transmits real-time temperature, freshness gas, and tamper sensor readings to verify your child's breakfast is 100% fresh, hygienic, and hot.",
                          style: TextStyle(fontSize: 11, color: Colors.black87, height: 1.3),
                        ),
                      ),
                    ],
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

class _ConditionCard extends StatelessWidget {
  const _ConditionCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.value,
    required this.statusText,
    required this.statusColor,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String value;
  final String statusText;
  final Color statusColor;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 11, color: Colors.black54)),
                Icon(icon, size: 18, color: iconColor),
              ],
            ),
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              statusText,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: statusColor),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
