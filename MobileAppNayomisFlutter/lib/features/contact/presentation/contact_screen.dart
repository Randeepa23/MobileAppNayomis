import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../core/time/opening_status.dart';
import '../../../shared/widgets/app_widgets.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  void _copy(BuildContext context, String label, String value) {
    Clipboard.setData(ClipboardData(text: value));
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('$label copied.')));
  }

  @override
  Widget build(BuildContext context) {
    final status = colomboOpeningStatus();
    return Scaffold(
      appBar: const BrandedAppBar(title: 'Contact & location'),
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
            Text(
              'Get in touch',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                color: AppColors.brandSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Visit or contact Nayomi’s Waterfront.',
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.lg),
            _ContactCard(
              icon: Icons.call_outlined,
              title: 'Telephone',
              value: '0317 934 447',
              onTap: () => _copy(context, 'Telephone number', '0317934447'),
            ),
            const SizedBox(height: AppSpacing.sm),
            _ContactCard(
              icon: Icons.smartphone_outlined,
              title: 'Mobile',
              value: '+94 76 799 3874',
              onTap: () => _copy(context, 'Mobile number', '+94767993874'),
            ),
            const SizedBox(height: AppSpacing.sm),
            _ContactCard(
              icon: Icons.email_outlined,
              title: 'Email',
              value: 'info@nayomis.com',
              onTap: () => _copy(context, 'Email address', 'info@nayomis.com'),
            ),
            const SizedBox(height: AppSpacing.sm),
            _ContactCard(
              icon: Icons.location_on_outlined,
              title: 'Location',
              value: 'Nayomi’s, Katunayake 11500',
              onTap: () =>
                  _copy(context, 'Coordinates', '7.1739644, 79.8611947'),
            ),
            const SizedBox(height: AppSpacing.sm),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color:
                            (status.isOpen
                                    ? AppColors.statusSuccess
                                    : AppColors.statusOffline)
                                .withValues(alpha: .1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.schedule_rounded,
                        color: status.isOpen
                            ? AppColors.statusSuccess
                            : AppColors.statusOffline,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Opening status',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 2),
                          Text(status.message),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Card(
              color: AppColors.surfaceTint,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.map_outlined,
                      color: AppColors.brandSecondary,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        'Location coordinates: 7.1739644, 79.8611947',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      minVerticalPadding: AppSpacing.sm,
      leading: CircleAvatar(
        backgroundColor: const Color(0xFFFFF2C7),
        foregroundColor: AppColors.brandSecondary,
        child: Icon(icon),
      ),
      title: Text(title, style: Theme.of(context).textTheme.titleMedium),
      subtitle: Text(value),
      trailing: IconButton(
        onPressed: onTap,
        tooltip: 'Copy $title',
        icon: const Icon(Icons.copy_outlined),
      ),
    ),
  );
}
