import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/cart_controller.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  Future<void> _clear(BuildContext context, WidgetRef ref) async {
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Clear cart?'),
            content: const Text(
              'This removes every item from your local cart.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Clear cart'),
              ),
            ],
          ),
        ) ??
        false;
    if (confirmed) await ref.read(cartControllerProvider).clear();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    return Scaffold(
      appBar: BrandedAppBar(
        title: 'Cart',
        actions: [
          IconButton(
            onPressed: cart.value?.isNotEmpty == true
                ? () => _clear(context, ref)
                : null,
            tooltip: 'Clear cart',
            icon: const Icon(Icons.delete_sweep_outlined),
          ),
        ],
      ),
      body: cart.when(
        loading: () => const LoadingState(label: 'Loading cart'),
        error: (error, _) => ErrorState(message: error.toString()),
        data: (items) => items.isEmpty
            ? EmptyState(
                title: 'Your cart is empty',
                message: 'Browse the live menu to add a fresh meal.',
                action: ElevatedButton.icon(
                  onPressed: () => context.go('/menu'),
                  icon: const Icon(Icons.restaurant_menu_rounded),
                  label: const Text('Browse menu'),
                ),
              )
            : ResponsiveContent(
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
                      '${items.length} ${items.length == 1 ? 'item' : 'items'}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    ...items.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.all(AppSpacing.sm),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _CartThumbnail(
                                  imageUrl: item.imageUrl,
                                  name: item.name,
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.name,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: Theme.of(
                                          context,
                                        ).textTheme.titleMedium,
                                      ),
                                      const SizedBox(height: AppSpacing.xxs),
                                      Text(
                                        '${formatLkr(item.unitPrice)} each',
                                        style: Theme.of(
                                          context,
                                        ).textTheme.bodySmall,
                                      ),
                                      const SizedBox(height: AppSpacing.xs),
                                      Wrap(
                                        crossAxisAlignment:
                                            WrapCrossAlignment.center,
                                        spacing: AppSpacing.xs,
                                        runSpacing: AppSpacing.xs,
                                        children: [
                                          QuantitySelector(
                                            quantity: item.quantity,
                                            onChanged: (value) => ref
                                                .read(cartControllerProvider)
                                                .setQuantity(
                                                  item.itemId,
                                                  value,
                                                ),
                                          ),
                                          Text(
                                            formatLkr(
                                              item.unitPrice * item.quantity,
                                            ),
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w900,
                                              color: AppColors.brandPrimary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  onPressed: () async {
                                    await ref
                                        .read(cartControllerProvider)
                                        .remove(item.itemId);
                                    if (!context.mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('${item.name} removed.'),
                                        action: SnackBarAction(
                                          label: 'Undo',
                                          onPressed: () => ref
                                              .read(cartControllerProvider)
                                              .restore(item),
                                        ),
                                      ),
                                    );
                                  },
                                  tooltip: 'Remove ${item.name}',
                                  icon: const Icon(
                                    Icons.delete_outline_rounded,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    'Estimated subtotal',
                                    style: Theme.of(
                                      context,
                                    ).textTheme.titleMedium,
                                  ),
                                ),
                                Text(
                                  formatLkr(subtotal),
                                  style: Theme.of(context).textTheme.titleLarge
                                      ?.copyWith(color: AppColors.brandPrimary),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            const Divider(height: 1),
                            const SizedBox(height: AppSpacing.sm),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(
                                  Icons.verified_user_outlined,
                                  size: 18,
                                  color: AppColors.brandSecondary,
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Expanded(
                                  child: Text(
                                    'Prices and availability are revalidated by the server before placement.',
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodySmall,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    PrimaryButton(
                      label: 'Continue to checkout',
                      onPressed: () => context.push('/checkout'),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}

class _CartThumbnail extends StatelessWidget {
  const _CartThumbnail({required this.imageUrl, required this.name});
  final String? imageUrl;
  final String name;

  @override
  Widget build(BuildContext context) {
    final assetImage = imageUrl?.startsWith('assets/') == true;
    final uri = Uri.tryParse(imageUrl ?? '');
    final valid =
        uri != null &&
        uri.hasScheme &&
        (uri.scheme == 'http' || uri.scheme == 'https');
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.small),
      child: SizedBox.square(
        dimension: 82,
        child: assetImage
            ? Image.asset(
                imageUrl!,
                fit: BoxFit.cover,
                cacheWidth: 220,
                filterQuality: FilterQuality.high,
                errorBuilder: (_, __, ___) => const _CartImageFallback(),
              )
            : valid
            ? CachedNetworkImage(
                imageUrl: imageUrl!,
                fit: BoxFit.cover,
                memCacheWidth: 220,
                placeholder: (_, __) => const _CartImageFallback(),
                errorWidget: (_, __, ___) => const _CartImageFallback(),
              )
            : const _CartImageFallback(),
      ),
    );
  }
}

class _CartImageFallback extends StatelessWidget {
  const _CartImageFallback();
  @override
  Widget build(BuildContext context) => const ColoredBox(
    color: AppColors.surfaceTint,
    child: Icon(Icons.restaurant_rounded, color: AppColors.brandSecondary),
  );
}
