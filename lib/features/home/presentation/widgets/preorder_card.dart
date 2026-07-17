import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/design_system/app_colors.dart';
import '../../../../core/design_system/app_radius.dart';
import '../../../../core/design_system/app_spacing.dart';

class PreorderCard extends StatelessWidget {
  const PreorderCard({super.key, required this.onPressed});
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) => Card(
    color: const Color(0xFFFFF3EA),
    shape: const RoundedRectangleBorder(borderRadius: AppRadius.featureCard),
    child: LayoutBuilder(
      builder: (context, constraints) {
        final stacked = constraints.maxWidth < 420;
        final image = ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.large),
          child: AspectRatio(
            aspectRatio: 12 / 5,
            child: Image.asset(
              AppAssets.preorder,
              fit: BoxFit.cover,
              cacheWidth: 900,
              semanticLabel: 'School meal pre-order illustration',
            ),
          ),
        );
        final copy = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'School breakfast pre-order',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Select meals, choose a pickup point, schedule delivery, and track the order.',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.md),
            FilledButton.icon(
              onPressed: onPressed,
              icon: const Icon(Icons.calendar_month_outlined),
              label: const Text('Plan breakfast'),
            ),
          ],
        );
        return Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: stacked
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    image,
                    const SizedBox(height: AppSpacing.md),
                    copy,
                  ],
                )
              : Row(
                  children: [
                    Expanded(flex: 5, child: copy),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(flex: 4, child: image),
                  ],
                ),
        );
      },
    ),
  );
}
