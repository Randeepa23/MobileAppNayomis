import 'package:flutter/material.dart';

import '../../../shared/widgets/app_widgets.dart';

class TrackingScreen extends StatelessWidget {
  const TrackingScreen({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: const BrandedAppBar(title: 'Delivery tracking'),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Order ' + orderId,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 12),
        const SafetyStatusPanel(status: SafetyStatus.offline),
        const SizedBox(height: 12),
        Container(
          height: 220,
          decoration: BoxDecoration(
            color: Colors.grey.shade300,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.map_outlined, size: 56),
                Text(
                  'Map appears when verified live coordinates are available',
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Card(
          child: Column(
            children: [
              ListTile(
                leading: Icon(Icons.location_off_outlined),
                title: Text('Delivery location'),
                subtitle: Text('No authenticated tracking snapshot available'),
              ),
              Divider(height: 1),
              ListTile(
                leading: Icon(Icons.sensors_off_outlined),
                title: Text('Smart-box connection'),
                subtitle: Text('Offline — no reading is represented as live'),
              ),
              Divider(height: 1),
              ListTile(
                leading: Icon(Icons.thermostat_outlined),
                title: Text('Temperature and humidity'),
                subtitle: Text('Unavailable'),
              ),
              Divider(height: 1),
              ListTile(
                leading: Icon(Icons.lock_outline),
                title: Text('Lid, tamper, and handling'),
                subtitle: Text('Unavailable'),
              ),
              Divider(height: 1),
              ListTile(
                leading: Icon(Icons.battery_unknown_outlined),
                title: Text('Battery'),
                subtitle: Text('Unavailable'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const EmptyState(
          title: 'No safety events',
          message:
              'The backend has smart-box models and services but no authenticated customer snapshot or real-time stream endpoint. Flutter does not calculate a HACCP decision locally.',
        ),
      ],
    ),
  );
}
