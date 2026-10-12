import 'package:flutter/material.dart';

import '../../../core/assets/app_assets.dart';
import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../core/design_system/widgets/section_header.dart';
import '../../../shared/widgets/app_widgets.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: const BrandedAppBar(title: 'About Nayomi’s'),
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
          ClipRRect(
            borderRadius: AppRadius.featureCard,
            child: AspectRatio(
              aspectRatio: 4 / 3,
              child: Image.asset(
                AppAssets.about,
                fit: BoxFit.cover,
                cacheWidth: 1100,
                semanticLabel: "Nayomi's bakery food display",
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Our story',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              color: AppColors.brandSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            "Operating since 1976, Nayomi's serves authentic Sri Lankan dishes made with fresh ingredients in a welcoming waterfront setting.",
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'From family dining and celebrations to casual visits, the restaurant focuses on fresh preparation and memorable shared meals.',
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'The school breakfast pre-order service helps families select meals in advance for timely pickup and delivery.',
          ),
          const SizedBox(height: AppSpacing.xl),
          const SectionHeader(
            title: 'Our services',
            subtitle: 'Approved services from the Nayomi’s website',
          ),
          const SizedBox(height: AppSpacing.sm),
          const _ServiceCard(
            icon: Icons.restaurant_outlined,
            title: 'All You Can Eat',
            message: 'An extensive buffet with a variety of dishes.',
          ),
          const SizedBox(height: AppSpacing.sm),
          const _ServiceCard(
            icon: Icons.schedule_outlined,
            title: 'Pre-Order System',
            message:
                'Order meals in advance for fresh preparation and timely availability.',
          ),
          const SizedBox(height: AppSpacing.sm),
          const _ServiceCard(
            icon: Icons.eco_outlined,
            title: 'Vegan Options',
            message: 'Plant-based options with authentic flavours.',
          ),
        ],
      ),
    ),
  );
}

class _ServiceCard extends StatelessWidget {
  const _ServiceCard({
    required this.icon,
    required this.title,
    required this.message,
  });
  final IconData icon;
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: const BoxDecoration(
              color: Color(0xFFFFF2C7),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.brandSecondary),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(message),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}
