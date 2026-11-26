import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_gradients.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../../authentication/application/auth_controller.dart';
import '../../authentication/domain/customer.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customer = ref.watch(authControllerProvider).value?.customer;
    if (customer == null) return const LoadingState(label: 'Loading profile');

    // Separate Driver profile from Customer/Student profile
    if (customer.isDriver) {
      return _DriverProfileView(customer: customer);
    }
    return _StudentProfileView(customer: customer);
  }
}

/// Dedicated Student / Customer Profile — strictly customer features only
class _StudentProfileView extends ConsumerWidget {
  const _StudentProfileView({required this.customer});
  final Customer customer;

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign out?'),
        content: const Text(
          'You will need to sign in again to place orders and view loyalty points.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      await ref.read(authControllerProvider.notifier).logout();
      if (context.mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initials = customer.name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part[0].toUpperCase())
        .join();

    return Scaffold(
      appBar: const BrandedAppBar(title: 'Profile'),
      body: ResponsiveContent(
        padding: EdgeInsets.zero,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.md,
            AppSpacing.md,
            AppSpacing.xl,
          ),
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: const BoxDecoration(
                gradient: AppGradients.blueWash,
                borderRadius: AppRadius.featureCard,
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.brandSecondary,
                    child: Text(
                      initials.isEmpty ? '?' : initials,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.brandSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          customer.name,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          customer.email,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.white.withValues(alpha: .86),
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'Account details',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppSpacing.sm),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(
                      Icons.email_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Email'),
                    subtitle: Text(customer.email),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.school_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('School'),
                    subtitle: Text(
                      (customer.school != null &&
                              customer.school!.trim().isNotEmpty)
                          ? customer.school!
                          : 'Ave Maria Convent, Negombo',
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.badge_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Grade'),
                    subtitle: Text(
                      (customer.grade != null &&
                              customer.grade!.trim().isNotEmpty)
                          ? customer.grade!
                          : 'Grade 10',
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.card_giftcard_outlined,
                      color: AppColors.brandAccentDark,
                    ),
                    title: const Text('Loyalty points'),
                    subtitle: Text('${customer.pointsDisplay} verified points'),
                    onTap: () => context.go('/rewards'),
                    trailing: const Icon(Icons.chevron_right_rounded),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            OutlinedButton.icon(
              onPressed: () => _confirmLogout(context, ref),
              icon: const Icon(
                Icons.logout_rounded,
                color: AppColors.statusCritical,
              ),
              label: const Text(
                'Sign out',
                style: TextStyle(color: AppColors.statusCritical),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Dedicated Driver Profile — strictly driver and hardware operations only
class _DriverProfileView extends ConsumerWidget {
  const _DriverProfileView({required this.customer});
  final Customer customer;

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign out of Driver Portal?'),
        content: const Text(
          'You will need to sign in again to manage dispatches and delivery handovers.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      await ref.read(authControllerProvider.notifier).logout();
      if (context.mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final initials = customer.name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part[0].toUpperCase())
        .join();

    return Scaffold(
      appBar: const BrandedAppBar(title: 'Driver Profile'),
      body: ResponsiveContent(
        padding: EdgeInsets.zero,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.md,
            AppSpacing.md,
            AppSpacing.xl,
          ),
          children: [
            // Driver Badge Header
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: AppRadius.featureCard,
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.amber.shade700,
                    foregroundColor: Colors.white,
                    child: Text(
                      initials.isEmpty ? 'DR' : initials,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                customer.name,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade700.withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'OFFICIAL DELIVERY DRIVER',
                            style: TextStyle(
                              color: Colors.black87,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          customer.email,
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Colors.white70,
                                  ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Driver Fleet & Assignment Details
            Text(
              'Fleet & Operational Details',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppSpacing.sm),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(
                      Icons.sensors_rounded,
                      color: AppColors.brandPrimary,
                    ),
                    title: const Text('Smart Delivery Box'),
                    subtitle: Text(
                      customer.assignedBox ?? 'Assigned Unit: BOX-001',
                    ),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'ACTIVE',
                        style: TextStyle(
                          color: Colors.green,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.directions_car_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Assigned Vehicle'),
                    subtitle: Text(
                      '${customer.vehicleModel ?? "Nayomi's Waterfront Van #1"} (${customer.vehicleNumber ?? "WP NB-4521"})',
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.badge_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Driving License No.'),
                    subtitle: Text(customer.licenseNumber ?? 'B-8492011'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.alt_route_rounded,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Distribution Route'),
                    subtitle: Text(
                      customer.assignedRoute ??
                          'Ave Maria Convent & Negombo Distribution Route',
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.storefront_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Dispatch Hub'),
                    subtitle: Text(
                      customer.dispatchHub ??
                          "Nayomi's Waterfront Kitchen Dispatch, Negombo",
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(
                      Icons.phone_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Driver Contact'),
                    subtitle: Text(customer.phone ?? '+94 77 123 4567'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Primary Driver Operational Portal Button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.brandPrimary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.local_shipping_outlined, size: 22),
              label: const Text(
                'Open Driver Deliveries & Operations',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              onPressed: () => context.push('/driver'),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Sign out
            OutlinedButton.icon(
              onPressed: () => _confirmLogout(context, ref),
              icon: const Icon(
                Icons.logout_rounded,
                color: AppColors.statusCritical,
              ),
              label: const Text(
                'Sign out',
                style: TextStyle(color: AppColors.statusCritical),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
