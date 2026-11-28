import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../../orders/application/orders_providers.dart';
import '../../orders/data/orders_repository.dart';

class InAppNotificationItem {
  const InAppNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.iconColor,
    required this.route,
    this.badgeText,
  });

  final String id;
  final String title;
  final String message;
  final String time;
  final IconData icon;
  final Color iconColor;
  final String? route;
  final String? badgeText;
}

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  List<InAppNotificationItem> _buildNotificationsFromOrders(List<CustomerOrder> orders) {
    final list = <InAppNotificationItem>[];

    for (final order in orders) {
      // 1. Food safety & box live tracking notification
      list.add(
        InAppNotificationItem(
          id: '${order.id}_safety',
          title: 'Smart Box #FOOD-BOX-001 Active',
          message: 'Live food safety & temperature monitoring is active for order #${order.orderNumber}. Tap to view live map.',
          time: 'Live Now',
          icon: Icons.verified_user_rounded,
          iconColor: Colors.green,
          route: '/tracking/${order.id}',
          badgeText: 'FOOD SAFETY',
        ),
      );

      // 2. Order status notification
      final statusUpper = order.status.toUpperCase();
      list.add(
        InAppNotificationItem(
          id: '${order.id}_order',
          title: 'Order #${order.orderNumber} ($statusUpper)',
          message: 'Pickup scheduled at ${order.pickupLocation} (${order.pickupTime}). Total: Rs. ${order.total.toStringAsFixed(0)}',
          time: 'Today',
          icon: Icons.fastfood_rounded,
          iconColor: AppColors.primary,
          route: '/tracking/${order.id}',
          badgeText: statusUpper,
        ),
      );
    }

    return list;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(customerOrdersProvider);

    return Scaffold(
      appBar: const BrandedAppBar(title: 'Notifications'),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => RefreshIndicator(
          onRefresh: () => ref.refresh(customerOrdersProvider.future),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: SizedBox(
              height: MediaQuery.of(context).size.height * 0.7,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.notifications_off_outlined, size: 48, color: Colors.grey),
                      const SizedBox(height: 12),
                      const Text(
                        'Unable to load notifications',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        err.toString(),
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => ref.refresh(customerOrdersProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        data: (orders) {
          final notifications = _buildNotificationsFromOrders(orders);

          if (notifications.isEmpty) {
            return RefreshIndicator(
              onRefresh: () => ref.refresh(customerOrdersProvider.future),
              child: const SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                child: EmptyState(
                  title: 'No notifications',
                  message: 'Your order updates and smart box food-safety alerts will appear here.',
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => ref.refresh(customerOrdersProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = notifications[index];
                return Card(
                  elevation: 0.5,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: item.route != null ? () => context.push(item.route!) : null,
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: item.iconColor.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(item.icon, color: item.iconColor, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    if (item.badgeText != null)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: item.iconColor.withValues(alpha: 0.12),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          item.badgeText!,
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: item.iconColor,
                                          ),
                                        ),
                                      ),
                                    Text(
                                      item.time,
                                      style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  item.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.message,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade700,
                                    height: 1.35,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (item.route != null) ...[
                            const SizedBox(width: 6),
                            const Icon(Icons.chevron_right_rounded, color: Colors.grey, size: 20),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
