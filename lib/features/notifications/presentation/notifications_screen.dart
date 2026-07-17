import 'package:flutter/material.dart';

import '../../../shared/widgets/app_widgets.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(
    appBar: BrandedAppBar(title: 'Notifications'),
    body: EmptyState(
      title: 'No notifications',
      message:
          'Significant order and food-safety events will appear after the backend and approved FCM project are configured.',
    ),
  );
}
