import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../features/authentication/application/auth_controller.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/driver_providers.dart';
import '../data/driver_repository.dart';

class DriverScreen extends ConsumerStatefulWidget {
  const DriverScreen({super.key});

  @override
  ConsumerState<DriverScreen> createState() => _DriverScreenState();
}

class _DriverScreenState extends ConsumerState<DriverScreen> {
  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign out?'),
        content: const Text('Are you sure you want to sign out of the Driver Portal?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(authControllerProvider.notifier).logout();
      if (mounted) context.go('/login');
    }
  }

  Future<void> _handleStatusUpdate(String orderId, String newStatus, String label) async {
    try {
      await ref.read(driverRepositoryProvider).updateStatus(orderId, newStatus);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Delivery status updated to $label in MongoDB Atlas.'),
          backgroundColor: AppColors.primary,
          duration: const Duration(seconds: 2),
        ),
      );
      ref.invalidate(driverDeliveriesProvider);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update status: $e'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  void _showChangeStatusSheet(String orderId, String currentStatus) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Change Delivery Status',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                'Updates the order status immediately in MongoDB Atlas',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.black54,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              _StatusOptionTile(
                icon: Icons.access_time_rounded,
                iconColor: Colors.amber.shade800,
                title: 'Ready for Dispatch',
                subtitle: 'Food packaged and loaded in smart box',
                isSelected: currentStatus == 'ready',
                onTap: () {
                  Navigator.pop(ctx);
                  _handleStatusUpdate(orderId, 'ready', 'READY');
                },
              ),
              const Divider(height: 1),
              _StatusOptionTile(
                icon: Icons.local_shipping_rounded,
                iconColor: Colors.blue.shade700,
                title: 'Dispatched (In Transit)',
                subtitle: 'Van en route to delivery destination',
                isSelected: currentStatus == 'dispatched',
                onTap: () {
                  Navigator.pop(ctx);
                  _handleStatusUpdate(orderId, 'dispatched', 'DISPATCHED');
                },
              ),
              const Divider(height: 1),
              _StatusOptionTile(
                icon: Icons.check_circle_rounded,
                iconColor: Colors.green.shade700,
                title: 'Delivered (Handover Complete)',
                subtitle: 'Order safely handed over to school recipient',
                isSelected: currentStatus == 'delivered',
                onTap: () {
                  Navigator.pop(ctx);
                  _handleStatusUpdate(orderId, 'delivered', 'DELIVERED');
                },
              ),
              const Divider(height: 1),
              _StatusOptionTile(
                icon: Icons.cancel_outlined,
                iconColor: Colors.red.shade700,
                title: 'Cancelled',
                subtitle: 'Delivery cannot be completed',
                isSelected: currentStatus == 'cancelled',
                onTap: () {
                  Navigator.pop(ctx);
                  _handleStatusUpdate(orderId, 'cancelled', 'CANCELLED');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final customer = ref.watch(authControllerProvider).value?.customer;
    final deliveriesAsync = ref.watch(driverDeliveriesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Driver Delivery Portal',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0.5,
        actions: [
          IconButton(
            tooltip: 'Sign out',
            icon: const Icon(Icons.logout_rounded, color: Colors.red),
            onPressed: _confirmLogout,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(driverDeliveriesProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Driver Information Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: Colors.amber.shade700,
                    child: const Icon(
                      Icons.local_shipping_rounded,
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          customer?.name.isNotEmpty == true
                              ? customer!.name
                              : 'Sunimal Perera',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Vehicle: ${customer?.vehicleNumber ?? "WP NB-4521"}  •  Box: ${customer?.assignedBox ?? "BOX-001"}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Assigned Deliveries',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                TextButton.icon(
                  onPressed: () => ref.refresh(driverDeliveriesProvider),
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Refresh'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    visualDensity: VisualDensity.compact,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            deliveriesAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(40),
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              ),
              error: (err, _) => Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Column(
                    children: [
                      Text(
                        err.toString(),
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red),
                      ),
                      const SizedBox(height: 12),
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
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: EmptyState(
                      title: 'No Deliveries Assigned',
                      message: 'There are currently no active deliveries assigned to your vehicle.',
                    ),
                  );
                }

                return Column(
                  children: deliveries.map((d) {
                    return _DeliveryStatusCard(
                      delivery: d,
                      onQuickProgress: () {
                        if (d.status == 'ready') {
                          _handleStatusUpdate(d.orderId, 'dispatched', 'DISPATCHED');
                        } else if (d.status == 'dispatched') {
                          _handleStatusUpdate(d.orderId, 'delivered', 'DELIVERED');
                        }
                      },
                      onChangeStatus: () => _showChangeStatusSheet(d.orderId, d.status),
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusOptionTile extends StatelessWidget {
  const _StatusOptionTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: iconColor.withValues(alpha: 0.15),
        child: Icon(icon, color: iconColor),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
          color: isSelected ? iconColor : Colors.black87,
        ),
      ),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      trailing: isSelected
          ? Icon(Icons.check_circle, color: iconColor)
          : const Icon(Icons.chevron_right, color: Colors.black26),
      onTap: onTap,
    );
  }
}

class _DeliveryStatusCard extends StatelessWidget {
  const _DeliveryStatusCard({
    required this.delivery,
    required this.onQuickProgress,
    required this.onChangeStatus,
  });

  final DriverDelivery delivery;
  final VoidCallback onQuickProgress;
  final VoidCallback onChangeStatus;

  Color _statusColor(String status) {
    switch (status) {
      case 'dispatched':
        return Colors.blue.shade700;
      case 'delivered':
        return Colors.green.shade700;
      case 'cancelled':
        return Colors.red.shade700;
      case 'ready':
      default:
        return Colors.amber.shade800;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'dispatched':
        return 'IN TRANSIT';
      case 'delivered':
        return 'DELIVERED';
      case 'cancelled':
        return 'CANCELLED';
      case 'ready':
      default:
        return 'READY FOR DISPATCH';
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(delivery.status);
    final statusLabel = _statusLabel(delivery.status);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Number & Status Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  delivery.orderNumber,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 17,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 20),

            // Recipient & School
            Row(
              children: [
                const Icon(Icons.school_outlined, size: 18, color: Colors.black54),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${delivery.recipientName}  •  ${delivery.school}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Pickup location & time
            Row(
              children: [
                const Icon(Icons.place_outlined, size: 18, color: Colors.black54),
                const SizedBox(width: 8),
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
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.fastfood_outlined, size: 18, color: Colors.black54),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      delivery.items.join(', '),
                      style: const TextStyle(fontSize: 13, color: Colors.black87),
                    ),
                  ),
                ],
              ),
            ],

            const SizedBox(height: 12),

            // Smart Box Monitoring Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.sensors, size: 16, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Text(
                        'Box: ${delivery.boxId ?? "BOX-001"}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ],
                  ),
                  if (delivery.temperature != null)
                    Text(
                      '${delivery.temperature!.toStringAsFixed(1)} °C',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Status Modification Action Buttons
            Row(
              children: [
                // Quick progression button (Start Transit / Handover Complete)
                if (delivery.status == 'ready')
                  Expanded(
                    flex: 3,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      icon: const Icon(Icons.local_shipping, size: 18),
                      label: const Text(
                        'Start Transit',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      onPressed: onQuickProgress,
                    ),
                  )
                else if (delivery.status == 'dispatched')
                  Expanded(
                    flex: 3,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade700,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      icon: const Icon(Icons.check_circle_outline, size: 18),
                      label: const Text(
                        'Handover Complete',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      onPressed: onQuickProgress,
                    ),
                  )
                else if (delivery.status == 'delivered')
                  Expanded(
                    flex: 3,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle, size: 18, color: Colors.green.shade700),
                          const SizedBox(width: 6),
                          Text(
                            'Delivery Completed',
                            style: TextStyle(
                              color: Colors.green.shade700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  Expanded(
                    flex: 3,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.cancel, size: 18, color: Colors.red.shade700),
                          const SizedBox(width: 6),
                          Text(
                            'Order Cancelled',
                            style: TextStyle(
                              color: Colors.red.shade700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                const SizedBox(width: 10),

                // Change status button (Dropdown / Sheet to set any status in Atlas)
                Expanded(
                  flex: 2,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.black87,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(color: Colors.grey.shade400),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: const Icon(Icons.edit_note_rounded, size: 18),
                    label: const Text(
                      'Change',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    onPressed: onChangeStatus,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
