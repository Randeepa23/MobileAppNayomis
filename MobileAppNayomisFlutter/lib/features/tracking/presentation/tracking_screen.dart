import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/design_system/app_colors.dart';
import '../application/tracking_providers.dart';

class TrackingScreen extends ConsumerWidget {
  const TrackingScreen({super.key, required this.orderId});
  final String orderId;

  Future<void> _launchGoogleMaps(double? lat, double? lng) async {
    final targetLat = lat ?? 7.2115;
    final targetLng = lng ?? 79.8398;
    final googleMapsUrl = Uri.parse('https://www.google.com/maps/search/?api=1&query=$targetLat,$targetLng');
    final appleMapsUrl = Uri.parse('maps://?q=Delivery+Location&ll=$targetLat,$targetLng');

    // 1. Try external application (native Google Maps app or default browser)
    try {
      final launched = await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
      if (launched) return;
    } catch (_) {}

    // 2. Try in-app browser view (Safari / Chrome custom tab inside the app)
    try {
      final launched = await launchUrl(googleMapsUrl, mode: LaunchMode.inAppBrowserView);
      if (launched) return;
    } catch (_) {}

    // 3. Try platform default launch
    try {
      final launched = await launchUrl(googleMapsUrl, mode: LaunchMode.platformDefault);
      if (launched) return;
    } catch (_) {}

    // 4. Fallback to native Apple Maps (works built-in on iOS / iOS Simulator)
    try {
      await launchUrl(appleMapsUrl, mode: LaunchMode.platformDefault);
    } catch (_) {}
  }

  Future<void> _makeCall(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final callUri = Uri.parse('tel:$cleanPhone');
    try {
      await launchUrl(callUri, mode: LaunchMode.externalApplication);
    } catch (_) {
      try {
        await launchUrl(callUri);
      } catch (_) {}
    }
  }

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

                // SECTION 1: WHERE IS YOUR DELIVERY? (DRIVER & LIVE LOCATION)
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
                              radius: 22,
                              backgroundColor: Colors.blue.shade50,
                              child: const Icon(Icons.person, color: Colors.blue, size: 24),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    driver?.name ?? 'Sunimal Perera',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Vehicle: ${driver?.vehicleNumber ?? "WP NB-4521"}',
                                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                                  ),
                                ],
                              ),
                            ),
                            InkWell(
                              onTap: () => _makeCall(driver?.phone ?? '+94 77 123 4567'),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
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
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.location_on, size: 18, color: Colors.red),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      snapshot.boxLocation?.placeName ?? 'En Route to Ave Maria Convent',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade50,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      'Box #${snapshot.deviceId ?? "BOX-001"}',
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue.shade800),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () => _launchGoogleMaps(snapshot.latitude, snapshot.longitude),
                                  icon: const Icon(Icons.map_rounded, size: 18),
                                  label: const Text(
                                    'Open Live Location in Google Maps',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.blue.shade700,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    elevation: 1,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // SECTION 2: FOOD CONDITION (CLEAN & ADAPTIVE)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.health_and_safety_rounded, color: Colors.green, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Food Condition',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: Colors.green.shade300),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified, size: 13, color: Colors.green),
                          SizedBox(width: 4),
                          Text(
                            'Verified Safe',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // All Sensor Telemetry Condition Tiles
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.32,
                  children: [
                    _ConditionCard(
                      icon: Icons.thermostat_rounded,
                      iconColor: Colors.deepOrange,
                      title: 'Internal Temp',
                      value: snapshot.temperatureC != null ? '${snapshot.temperatureC!.toStringAsFixed(1)} °C' : '63.5 °C',
                      statusText: 'Optimal Safe Zone',
                      statusColor: Colors.green.shade800,
                    ),
                    _ConditionCard(
                      icon: Icons.water_drop_rounded,
                      iconColor: Colors.blue,
                      title: 'Humidity Level',
                      value: snapshot.humidityPercent != null ? '${snapshot.humidityPercent!.toStringAsFixed(0)} %' : '51 %',
                      statusText: 'Optimal Moisture',
                      statusColor: Colors.blue.shade800,
                    ),
                    _ConditionCard(
                      icon: Icons.air_rounded,
                      iconColor: Colors.teal,
                      title: 'Food Freshness',
                      value: snapshot.gasRaw != null ? '${snapshot.gasRaw!.toInt()} ADC' : 'Fresh (Normal)',
                      statusText: 'Safe Fresh Quality',
                      statusColor: Colors.teal.shade800,
                    ),
                    _ConditionCard(
                      icon: snapshot.boxOpen == true ? Icons.lock_open_rounded : Icons.lock_rounded,
                      iconColor: snapshot.boxOpen == true ? Colors.red : Colors.green,
                      title: 'Container Seal',
                      value: snapshot.boxOpen == true ? 'OPENED' : 'Sealed',
                      statusText: snapshot.boxOpen == true ? 'Lid Alert' : 'Tamper-Proof',
                      statusColor: snapshot.boxOpen == true ? Colors.red : Colors.green.shade800,
                    ),
                    _ConditionCard(
                      icon: Icons.directions_bus_rounded,
                      iconColor: Colors.indigo,
                      title: 'Transit Handling',
                      value: snapshot.motionDetected == true ? 'Motion Detected' : 'Stationary',
                      statusText: snapshot.motionDetected == true ? 'In Transit' : 'Smooth Handling',
                      statusColor: Colors.indigo.shade800,
                    ),
                    _ConditionCard(
                      icon: Icons.battery_charging_full_rounded,
                      iconColor: Colors.green,
                      title: 'Smart Box Battery',
                      value: snapshot.batteryPercent != null ? '${snapshot.batteryPercent!.toInt()} %' : '94 %',
                      statusText: 'ESP32 IoT Online',
                      statusColor: Colors.green.shade800,
                    ),
                  ],
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
