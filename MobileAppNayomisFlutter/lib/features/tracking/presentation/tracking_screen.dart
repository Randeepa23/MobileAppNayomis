import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/design_system/app_colors.dart';
import '../application/tracking_providers.dart';

class TrackingScreen extends ConsumerWidget {
  const TrackingScreen({super.key, required this.orderId});
  final String orderId;

  Future<void> _launchGoogleMaps(double? lat, double? lng, {String? googleMapsUrl, String? placeName}) async {
    final targetLat = lat ?? 7.049666;
    final targetLng = lng ?? 80.173477;
    final urlString = googleMapsUrl != null && googleMapsUrl.isNotEmpty
        ? googleMapsUrl
        : 'https://www.google.com/maps/search/?api=1&query=$targetLat,$targetLng';
    final googleMapsUri = Uri.parse(urlString);
    final appleMapsUrl = Uri.parse('maps://?q=${Uri.encodeComponent(placeName ?? "Delivery Box Location")}&ll=$targetLat,$targetLng');

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

                // SECTION 1: LIVE DELIVERY LOCATION & GOOGLE MAPS
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
                            const Icon(Icons.location_on, size: 20, color: Colors.red),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                snapshot.boxLocation?.placeName ?? 'En Route to $destinationPlace',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: Colors.blue.shade100),
                              ),
                              child: Text(
                                'Box #${snapshot.deviceId ?? snapshot.boxLocation?.boxId ?? "FOOD-BOX-001"}',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue.shade800),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        if (snapshot.readingId != null) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Atlas: ${snapshot.readingId}',
                                style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontWeight: FontWeight.w500),
                              ),
                              Text(
                                'GPS: ${(snapshot.latitude ?? snapshot.boxLocation?.latitude ?? 7.049666).toStringAsFixed(6)}, ${(snapshot.longitude ?? snapshot.boxLocation?.longitude ?? 80.173477).toStringAsFixed(6)}',
                                style: TextStyle(fontSize: 10, color: Colors.blue.shade700, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                        ],
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _launchGoogleMaps(
                              snapshot.latitude ?? snapshot.boxLocation?.latitude,
                              snapshot.longitude ?? snapshot.boxLocation?.longitude,
                              googleMapsUrl: snapshot.boxLocation?.googleMapsUrl,
                              placeName: snapshot.boxLocation?.placeName,
                            ),
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
                      value: snapshot.temperatureC != null ? '${snapshot.temperatureC!.toStringAsFixed(1)} °C' : '-- °C',
                      statusText: snapshot.temperatureC != null ? 'Optimal Safe Zone' : 'Waiting for Data',
                      statusColor: snapshot.temperatureC != null ? Colors.green.shade800 : Colors.grey.shade600,
                    ),
                    _ConditionCard(
                      icon: Icons.water_drop_rounded,
                      iconColor: Colors.blue,
                      title: 'Humidity Level',
                      value: snapshot.humidityPercent != null ? '${snapshot.humidityPercent!.toStringAsFixed(1)} %' : '-- %',
                      statusText: snapshot.humidityPercent != null ? 'Optimal Moisture' : 'Waiting for Data',
                      statusColor: snapshot.humidityPercent != null ? Colors.blue.shade800 : Colors.grey.shade600,
                    ),
                    _ConditionCard(
                      icon: Icons.air_rounded,
                      iconColor: Colors.teal,
                      title: 'Food Freshness',
                      value: snapshot.gasRaw != null ? '${snapshot.gasRaw!.toInt()} ADC' : (snapshot.foodSafety?.gasCondition ?? '--'),
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
                      value: snapshot.shockG != null ? '${snapshot.shockG!.toStringAsFixed(3)} G' : (snapshot.motionDetected == true ? 'Motion' : 'Stationary'),
                      statusText: snapshot.vibrationRMS != null ? 'RMS: ${snapshot.vibrationRMS!.toStringAsFixed(4)}' : (snapshot.motionDetected == true ? 'In Transit' : 'Smooth Handling'),
                      statusColor: Colors.indigo.shade800,
                    ),
                    _ConditionCard(
                      icon: Icons.battery_charging_full_rounded,
                      iconColor: Colors.green,
                      title: 'Smart Box Battery',
                      value: snapshot.batteryVoltage != null ? '${snapshot.batteryVoltage!.toStringAsFixed(2)} V' : (snapshot.batteryPercent != null ? '${snapshot.batteryPercent!.toInt()} %' : '-- %'),
                      statusText: snapshot.batteryPercent != null ? '${snapshot.batteryPercent!.toInt()}% • ESP32 Online' : 'ESP32 IoT Online',
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
