import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/design_system/app_colors.dart';
import '../application/tracking_providers.dart';

class TrackingScreen extends ConsumerWidget {
  const TrackingScreen({super.key, required this.orderId});
  final String orderId;

  Future<void> _launchGoogleMaps(double? lat, double? lng) async {
    final targetLat = lat ?? 7.049666;
    final targetLng = lng ?? 80.173477;
    final urlString = 'https://www.google.com/maps/search/?api=1&query=$targetLat,$targetLng';
    final googleMapsUri = Uri.parse(urlString);
    final appleMapsUrl = Uri.parse('maps://?q=Smart+Box+Location&ll=$targetLat,$targetLng');

    // 1. Try external application (native Google Maps app or default browser)
    try {
      final launched = await launchUrl(googleMapsUri, mode: LaunchMode.externalApplication);
      if (launched) return;
    } catch (_) {}

    // 2. Try in-app browser view (Safari / Chrome custom tab inside the app)
    try {
      final launched = await launchUrl(googleMapsUri, mode: LaunchMode.inAppBrowserView);
      if (launched) return;
    } catch (_) {}

    // 3. Try platform default launch
    try {
      final launched = await launchUrl(googleMapsUri, mode: LaunchMode.platformDefault);
      if (launched) return;
    } catch (_) {}

    // 4. Fallback to native Apple Maps (works built-in on iOS / iOS Simulator)
    try {
      await launchUrl(appleMapsUrl, mode: LaunchMode.platformDefault);
    } catch (_) {}
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/orders');
            }
          },
        ),
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
          final destination = snapshot.destination;
          final statusColor = _statusColor(snapshot.deliveryStatus);
          final statusLabel = _statusLabel(snapshot.deliveryStatus);
          final rawPlace = (destination?.pickupLocation != null && destination!.pickupLocation.trim().isNotEmpty)
              ? destination.pickupLocation
              : (destination?.school != null && destination!.school.trim().isNotEmpty)
                  ? destination.school
                  : 'Negombo Distribution Station';
          final destinationPlace = rawPlace.replaceAll(RegExp(r'Ave Maria Convent,?\s*', caseSensitive: false), 'Negombo Main Station ');

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
                            const Icon(Icons.location_on_outlined, size: 16, color: Colors.black54),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                destinationPlace,
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

                // SECTION 1: PROFESSIONAL LIVE GPS LOCATION CARD
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.blue.shade100, width: 1.2),
                  ),
                  color: const Color(0xFFF0F7FF),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => _launchGoogleMaps(
                      snapshot.latitude ?? snapshot.boxLocation?.latitude,
                      snapshot.longitude ?? snapshot.boxLocation?.longitude,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade600,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.near_me_rounded, color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF10B981),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'BOX #${snapshot.deviceId ?? snapshot.boxLocation?.boxId ?? "FOOD-BOX-001"} • LIVE GPS',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.blue.shade900,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  '${(snapshot.latitude ?? snapshot.boxLocation?.latitude ?? 7.049666).toStringAsFixed(6)}, ${(snapshot.longitude ?? snapshot.boxLocation?.longitude ?? 80.173477).toStringAsFixed(6)}',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.blue.shade200),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'View Map',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue.shade700,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Icon(Icons.arrow_forward_ios_rounded, size: 10, color: Colors.blue.shade700),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // SECTION 2: CLEAN SENSOR READINGS HEADER
                const Row(
                  children: [
                    Icon(Icons.sensors_rounded, color: Colors.blueGrey, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Live Sensor Readings',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // 4 Grid Condition Tiles: Temperature, Humidity, Gas, Acceleration
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.5,
                  children: [
                    _ConditionCard(
                      icon: Icons.thermostat_rounded,
                      iconColor: Colors.deepOrange,
                      title: 'Temperature',
                      value: snapshot.temperatureC != null ? '${snapshot.temperatureC!.toStringAsFixed(1)} °C' : '-- °C',
                    ),
                    _ConditionCard(
                      icon: Icons.water_drop_rounded,
                      iconColor: Colors.blue,
                      title: 'Humidity',
                      value: snapshot.humidityPercent != null ? '${snapshot.humidityPercent!.toStringAsFixed(1)} %' : '-- %',
                    ),
                    _ConditionCard(
                      icon: Icons.air_rounded,
                      iconColor: Colors.teal,
                      title: 'Gas Level',
                      value: snapshot.gasRaw != null ? '${snapshot.gasRaw!.toInt()} ADC' : '-- ADC',
                    ),
                    _ConditionCard(
                      icon: Icons.speed_rounded,
                      iconColor: Colors.indigo,
                      title: 'Acceleration',
                      value: snapshot.shockG != null ? '${snapshot.shockG!.toStringAsFixed(3)} G' : '-- G',
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // 5th Reading: Battery Percentage Card
                Card(
                  elevation: 0.5,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: Colors.green.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.battery_charging_full_rounded, size: 18, color: Colors.green),
                                ),
                                const SizedBox(width: 8),
                                const Text(
                                  'Battery Percentage',
                                  style: TextStyle(fontSize: 12, color: Colors.black54, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            Text(
                              snapshot.batteryPercent != null
                                  ? '${snapshot.batteryPercent!.toInt()}%'
                                  : (snapshot.batteryVoltage != null ? '${((snapshot.batteryVoltage! - 3.2) / (4.2 - 3.2) * 100).clamp(0, 100).round()}%' : '57%'),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: (snapshot.batteryPercent != null ? snapshot.batteryPercent! / 100.0 : 0.57).clamp(0.0, 1.0),
                            backgroundColor: Colors.grey.shade100,
                            valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
                            minHeight: 6,
                          ),
                        ),
                      ],
                    ),
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
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 11, color: Colors.black54, fontWeight: FontWeight.w600),
                ),
                Container(
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 16, color: iconColor),
                ),
              ],
            ),
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF0F172A)),
            ),
          ],
        ),
      ),
    );
  }
}
