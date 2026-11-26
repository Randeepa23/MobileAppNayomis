import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/orders_providers.dart';
import '../data/orders_repository.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(customerOrdersProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: const BrandedAppBar(title: 'Orders'),
        body: Column(
          children: [
            Material(
              color: Colors.white,
              child: TabBar(
                indicatorColor: AppColors.primary,
                labelColor: AppColors.primary,
                unselectedLabelColor: Colors.black54,
                tabs: [
                  Tab(text: 'Active'),
                  Tab(text: 'History'),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Expanded(
              child: ordersAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
                error: (error, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
                        const SizedBox(height: 12),
                        Text(
                          error.toString(),
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.black87),
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
                data: (orders) {
                  final activeOrders = orders.where((o) => o.isActive).toList();
                  final historyOrders = orders.where((o) => !o.isActive).toList();

                  return TabBarView(
                    children: [
                      _OrdersList(
                        orders: activeOrders,
                        emptyTitle: 'No active orders',
                        emptyMessage: 'You do not have any active breakfast deliveries.',
                        onRefresh: () => ref.refresh(customerOrdersProvider.future),
                      ),
                      _OrdersList(
                        orders: historyOrders,
                        emptyTitle: 'No past orders',
                        emptyMessage: 'Your completed breakfast orders will appear here.',
                        onRefresh: () => ref.refresh(customerOrdersProvider.future),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrdersList extends StatelessWidget {
  const _OrdersList({
    required this.orders,
    required this.emptyTitle,
    required this.emptyMessage,
    required this.onRefresh,
  });

  final List<CustomerOrder> orders;
  final String emptyTitle;
  final String emptyMessage;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return RefreshIndicator(
        onRefresh: onRefresh,
        child: ListView(
          children: [
            const SizedBox(height: 80),
            EmptyState(title: emptyTitle, message: emptyMessage),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final order = orders[index];
          return _OrderCard(order: order);
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final CustomerOrder order;

  Color _statusColor(String status) => switch (status.toLowerCase()) {
    'dispatched' || 'ready' => Colors.blue,
    'delivered' || 'completed' => Colors.green,
    'confirmed' || 'preparing' => Colors.orange,
    'cancelled' || 'rejected' => Colors.red,
    _ => Colors.grey,
  };

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('EEE, d MMM yyyy');

    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  order.orderNumber,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor(order.status).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _statusColor(order.status).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    order.status.toUpperCase(),
                    style: TextStyle(
                      color: _statusColor(order.status),
                      fontWeight: FontWeight.w700,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 16, color: Colors.black54),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '${order.pickupLocation} · ${order.pickupTime}',
                    style: const TextStyle(color: Colors.black87, fontSize: 13),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.calendar_today_outlined, size: 14, color: Colors.black54),
                const SizedBox(width: 4),
                Text(
                  dateFormat.format(order.deliveryDate),
                  style: const TextStyle(color: Colors.black54, fontSize: 12),
                ),
              ],
            ),
            const Divider(height: 20),
            ...order.items.map(
              (item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${item.quantity}x ${item.name}', style: const TextStyle(fontSize: 13)),
                    Text('Rs. ${(item.price * item.quantity).toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
                  ],
                ),
              ),
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total', style: TextStyle(color: Colors.black54, fontSize: 11)),
                    Text(
                      'Rs. ${order.total.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary),
                    ),
                  ],
                ),
                if (order.boxId != null && order.boxId!.isNotEmpty)
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.sensors, size: 16),
                    label: const Text('Track Smart Box'),
                    onPressed: () => context.push('/tracking/${order.id}'),
                  )
                else
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.black87,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.info_outline, size: 16),
                    label: const Text('Order Details'),
                    onPressed: () => context.push('/tracking/${order.id}'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
