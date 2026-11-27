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

    return _StudentProfileView(customer: customer);
  }
}

/// Dedicated Customer Profile
class _StudentProfileView extends ConsumerWidget {
  const _StudentProfileView({required this.customer});
  final Customer customer;

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign out?'),
        content: const Text(
          'You will need to sign in again to place breakfast orders and view loyalty points.',
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
                        fontWeight: FontWeight.bold,
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
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
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
                      Icons.phone_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    title: const Text('Telephone'),
                    subtitle: Text(
                      (customer.phone != null && customer.phone!.trim().isNotEmpty)
                          ? customer.phone!
                          : 'Not set',
                    ),
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
