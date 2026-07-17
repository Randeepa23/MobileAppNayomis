import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_gradients.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../../authentication/application/auth_controller.dart';

class RewardsScreen extends ConsumerWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final points = ref.watch(authControllerProvider).value?.customer?.points;
    return Scaffold(
      appBar: const BrandedAppBar(title: 'Rewards'),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.card_giftcard_rounded,
                    color: AppColors.brandAccent,
                    size: 38,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'Verified loyalty balance',
                    style: Theme.of(
                      context,
                    ).textTheme.titleMedium?.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    points == null ? 'Unavailable' : '$points points',
                    style: Theme.of(
                      context,
                    ).textTheme.displayMedium?.copyWith(color: Colors.white),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            const EmptyState(
              title: 'Rewards are not available yet',
              message:
                  'Earning, redemption, expiry, and benefit rules have not been published by the backend. Your server-provided points remain visible above.',
            ),
          ],
        ),
      ),
    );
  }
}
