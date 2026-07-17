import 'package:flutter/material.dart';

import '../../../core/design_system/app_spacing.dart';
import '../../../shared/widgets/app_widgets.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) => DefaultTabController(
    length: 2,
    child: Scaffold(
      appBar: const BrandedAppBar(title: 'Orders'),
      body: Column(
        children: [
          const Material(
            child: TabBar(
              tabs: [
                Tab(text: 'Active'),
                Tab(text: 'History'),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Expanded(
            child: TabBarView(
              children: [
                EmptyState(
                  title: 'No active orders to show',
                  message:
                      'Your authenticated order feed is not available yet.',
                ),
                EmptyState(
                  title: 'Order history is not available',
                  message:
                      'Past orders will appear only when a secure customer order feed is available.',
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}
