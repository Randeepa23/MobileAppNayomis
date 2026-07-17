import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radius.dart';
import '../../core/design_system/app_spacing.dart';

String formatLkr(num value) =>
    'Rs. ' + NumberFormat('#,##0.00', 'en').format(value);

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
  });
  final String label;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: double.infinity,
    child: ElevatedButton(
      onPressed: loading ? null : onPressed,
      child: loading
          ? const SizedBox.square(
              dimension: 22,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Text(label),
    ),
  );
}

class BrandedAppBar extends StatelessWidget implements PreferredSizeWidget {
  const BrandedAppBar({
    super.key,
    required this.title,
    this.actions = const [],
    this.leading,
  });
  final String title;
  final List<Widget> actions;
  final Widget? leading;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) => AppBar(
    leading: leading,
    title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
    actions: actions,
  );
}

class LoadingState extends StatelessWidget {
  const LoadingState({super.key, this.label = 'Loading…'});
  final String label;
  @override
  Widget build(BuildContext context) => Center(
    child: Semantics(
      liveRegion: true,
      label: label,
      child: const CircularProgressIndicator(),
    ),
  );
}

class MessageState extends StatelessWidget {
  const MessageState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.action,
  });
  final IconData icon;
  final String title;
  final String message;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 76,
            height: 76,
            decoration: const BoxDecoration(
              color: AppColors.surfaceTint,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 38, color: AppColors.brandSecondary),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center),
          if (action != null) ...[const SizedBox(height: 16), action!],
        ],
      ),
    ),
  );
}

class ErrorState extends MessageState {
  const ErrorState({super.key, required String message, Widget? action})
    : super(
        icon: Icons.error_outline,
        title: 'Unable to load',
        message: message,
        action: action,
      );
}

class EmptyState extends MessageState {
  const EmptyState({
    super.key,
    required String title,
    required String message,
    Widget? action,
  }) : super(
         icon: Icons.inbox_outlined,
         title: title,
         message: message,
         action: action,
       );
}

class OfflineState extends MessageState {
  const OfflineState({super.key, Widget? action})
    : super(
        icon: Icons.cloud_off_outlined,
        title: 'You are offline',
        message:
            'Local cart changes remain available. Reconnect for live restaurant data.',
        action: action,
      );
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    required this.icon,
    required this.color,
  });
  final String label;
  final IconData icon;
  final Color color;
  @override
  Widget build(BuildContext context) => Semantics(
    label: 'Status: ' + label,
    child: Chip(
      avatar: Icon(icon, size: 18, color: color),
      label: Text(label),
      side: BorderSide(color: color),
      backgroundColor: color.withValues(alpha: 0.08),
    ),
  );
}

enum SafetyStatus { safe, warning, critical, offline }

class SafetyStatusPanel extends StatelessWidget {
  const SafetyStatusPanel({super.key, required this.status, this.lastUpdated});
  final SafetyStatus status;
  final DateTime? lastUpdated;

  @override
  Widget build(BuildContext context) {
    final (label, message, icon, color) = switch (status) {
      SafetyStatus.safe => (
        'Safe',
        'Food conditions are within the approved delivery range.',
        Icons.verified_outlined,
        AppColors.success,
      ),
      SafetyStatus.warning => (
        'Warning',
        'A condition requires attention. The restaurant has been notified.',
        Icons.warning_amber,
        AppColors.warning,
      ),
      SafetyStatus.critical => (
        'Critical',
        "A food-safety issue has been detected. Follow the restaurant's instructions before accepting the order.",
        Icons.dangerous_outlined,
        AppColors.critical,
      ),
      SafetyStatus.offline => (
        'Offline',
        'Live smart-box data is temporarily unavailable.',
        Icons.sensors_off_outlined,
        AppColors.unavailable,
      ),
    };
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: color,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(message),
                  if (lastUpdated != null)
                    Text(
                      'Last updated ' +
                          DateFormat.jm().format(lastUpdated!.toLocal()),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class QuantitySelector extends StatelessWidget {
  const QuantitySelector({
    super.key,
    required this.quantity,
    required this.onChanged,
  });
  final int quantity;
  final ValueChanged<int> onChanged;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      IconButton(
        onPressed: quantity > 1 ? () => onChanged(quantity - 1) : null,
        tooltip: 'Decrease quantity',
        icon: const Icon(Icons.remove),
      ),
      Semantics(
        label: 'Quantity $quantity',
        child: Text(
          '$quantity',
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      IconButton(
        onPressed: () => onChanged(quantity + 1),
        tooltip: 'Increase quantity',
        icon: const Icon(Icons.add),
      ),
    ],
  );
}

class CheckoutStepIndicator extends StatelessWidget {
  const CheckoutStepIndicator({
    super.key,
    required this.current,
    required this.total,
  });
  final int current;
  final int total;
  @override
  Widget build(BuildContext context) => Semantics(
    label: 'Checkout step $current of $total',
    child: LinearProgressIndicator(
      value: current / total,
      minHeight: 8,
      borderRadius: BorderRadius.circular(AppRadius.small),
    ),
  );
}
