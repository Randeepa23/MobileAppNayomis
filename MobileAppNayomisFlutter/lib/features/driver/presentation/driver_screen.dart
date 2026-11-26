import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/driver_providers.dart';
import '../data/driver_repository.dart';

class DriverScreen extends ConsumerStatefulWidget {
  const DriverScreen({super.key});

  @override
  ConsumerState<DriverScreen> createState() => _DriverScreenState();
}

class _DriverScreenState extends ConsumerState<DriverScreen> {
  final _incidentController = TextEditingController();
  String _incidentType = 'temperature_breach';

  @override
  void dispose() {
    _incidentController.dispose();
    super.dispose();
  }

  Future<void> _handleDispatch(String orderId) async {
    try {
      await ref.read(driverRepositoryProvider).confirmDispatch(orderId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Delivery marked as dispatched (In Transit).')),
      );
      ref.invalidate(driverDeliveriesProvider);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _handleHandover(String orderId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Handover'),
        content: const Text('Have you handed over the breakfast order to the authorized school pickup contact?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Confirm Handover'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref.read(driverRepositoryProvider).completeHandover(orderId);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Delivery successfully recorded as completed.')),
        );
        ref.invalidate(driverDeliveriesProvider);
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _handleStatusUpdate(String orderId, String newStatus) async {
    try {
      await ref.read(driverRepositoryProvider).updateStatus(orderId, newStatus);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Delivery status updated to ${newStatus.toUpperCase()} in Atlas.')),
      );
      ref.invalidate(driverDeliveriesProvider);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  void _showStatusDialog(String orderId, String currentStatus) {
    String selected = currentStatus;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Update Delivery Status'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Select delivery progress state to update in MongoDB Atlas:'),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: ['ready', 'dispatched', 'delivered', 'cancelled'].contains(selected) ? selected : 'ready',
                decoration: const InputDecoration(labelText: 'Delivery Status', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'ready', child: Text('Ready for Dispatch')),
                  DropdownMenuItem(value: 'dispatched', child: Text('Dispatched (In Transit)')),
                  DropdownMenuItem(value: 'delivered', child: Text('Delivered (Handover Complete)')),
                  DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
                ],
                onChanged: (val) {
                  if (val != null) setDialogState(() => selected = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              onPressed: () {
                Navigator.pop(ctx);
                _handleStatusUpdate(orderId, selected);
              },
              child: const Text('Update in Atlas'),
            ),
          ],
        ),
      ),
    );
  }

  void _showIncidentDialog(String orderId) {
    final messenger = ScaffoldMessenger.of(context);
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Report Delivery Incident'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                initialValue: _incidentType,
                decoration: const InputDecoration(labelText: 'Incident Type'),
                items: const [
                  DropdownMenuItem(value: 'temperature_breach', child: Text('Temperature Breach')),
                  DropdownMenuItem(value: 'gas_anomaly', child: Text('Gas / Odor Warning')),
                  DropdownMenuItem(value: 'unusual_motion', child: Text('Impact / Spillage Risk')),
                  DropdownMenuItem(value: 'tampering', child: Text('Container Lid Opened')),
                  DropdownMenuItem(value: 'delivery_delay', child: Text('Traffic Delay')),
                  DropdownMenuItem(value: 'other', child: Text('Other Issue')),
                ],
                onChanged: (val) {
                  if (val != null) setDialogState(() => _incidentType = val);
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _incidentController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Description / Notes',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange.shade800),
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  await ref.read(driverRepositoryProvider).reportIncident(
                    orderId,
                    _incidentType,
                    _incidentController.text,
                  );
                  _incidentController.clear();
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Incident report logged to backend.')),
                  );
                  ref.invalidate(driverDeliveriesProvider);
                } catch (e) {
                  messenger.showSnackBar(SnackBar(content: Text(e.toString())));
                }
              },
              child: const Text('Submit Report'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final deliveriesAsync = ref.watch(driverDeliveriesProvider);

    return Scaffold(
      appBar: const BrandedAppBar(title: 'Driver Operations'),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(driverDeliveriesProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Hotspot status card
            Card(
              color: const Color(0xFFF0FDF4),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.green.shade300),
              ),
              child: const Padding(
                padding: EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.wifi_tethering, color: Colors.green, size: 22),
                        SizedBox(width: 8),
                        Text('Driver Hotspot Gateway', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Ensure Personal Hotspot is turned ON on this phone so the ESP32 monitoring unit can transmit telemetry directly to the backend API.',
                      style: TextStyle(fontSize: 12, color: Colors.black87),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Assigned Deliveries', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 8),

            deliveriesAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
              ),
              error: (err, _) => Padding(
                padding: const EdgeInsets.all(16),
                child: Center(
                  child: Column(
                    children: [
                      Text(err.toString(), textAlign: TextAlign.center),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: () => ref.refresh(driverDeliveriesProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
              data: (deliveries) {
                if (deliveries.isEmpty) {
                  return const EmptyState(
                    title: 'No Assigned Deliveries',
                    message: 'There are currently no active deliveries assigned for transport.',
                  );
                }

                return Column(
                  children: deliveries.map((d) => _DriverDeliveryCard(
                    delivery: d,
                    onDispatch: () => _handleDispatch(d.orderId),
                    onHandover: () => _handleHandover(d.orderId),
                    onUpdateStatus: () => _showStatusDialog(d.orderId, d.status),
                    onReportIncident: () => _showIncidentDialog(d.orderId),
                  )).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _DriverDeliveryCard extends StatelessWidget {
  const _DriverDeliveryCard({
    required this.delivery,
    required this.onDispatch,
    required this.onHandover,
    required this.onUpdateStatus,
    required this.onReportIncident,
  });

  final DriverDelivery delivery;
  final VoidCallback onDispatch;
  final VoidCallback onHandover;
  final VoidCallback onUpdateStatus;
  final VoidCallback onReportIncident;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(delivery.orderNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Chip(
                  label: Text(delivery.status.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                  backgroundColor: delivery.status == 'dispatched' ? Colors.blue.shade100 : Colors.orange.shade100,
                  side: BorderSide.none,
                ),
              ],
            ),
            const Divider(height: 16),
            Row(
              children: [
                const Icon(Icons.school, size: 16, color: Colors.black54),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${delivery.recipientName} · ${delivery.school}',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.place, size: 16, color: Colors.black54),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${delivery.pickupLocation} (${delivery.pickupTime})',
                    style: const TextStyle(fontSize: 13, color: Colors.black87),
                  ),
                ),
              ],
            ),
            if (delivery.items.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Items: ${delivery.items.join(', ')}',
                style: const TextStyle(fontSize: 12, color: Colors.black54),
              ),
            ],
            const Divider(height: 16),
            // Hardware box section
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.sensors, size: 18, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Text('Box: ${delivery.boxId ?? "Unassigned"}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        delivery.temperature != null ? '${delivery.temperature!.toStringAsFixed(1)} °C' : 'No Temp',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        delivery.batteryPercent != null ? '${delivery.batteryPercent!.toInt()}%' : '',
                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                if (delivery.status != 'dispatched')
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                      icon: const Icon(Icons.local_shipping, size: 16),
                      label: const Text('Start Transit'),
                      onPressed: onDispatch,
                    ),
                  )
                else
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                      icon: const Icon(Icons.check_circle_outline, size: 16),
                      label: const Text('Handover Complete'),
                      onPressed: onHandover,
                    ),
                  ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.primary),
                  icon: const Icon(Icons.edit_note_rounded, size: 18),
                  label: const Text('Status'),
                  onPressed: onUpdateStatus,
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.red.shade700),
                  onPressed: onReportIncident,
                  child: const Text('Incident'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

