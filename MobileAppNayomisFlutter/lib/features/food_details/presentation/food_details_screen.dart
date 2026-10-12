import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/app_typography.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../../cart/application/cart_controller.dart';
import '../../menu/application/menu_providers.dart';
import '../../menu/domain/food_item.dart';

class FoodDetailsScreen extends ConsumerStatefulWidget {
  const FoodDetailsScreen({super.key, required this.foodId});
  final String foodId;
  @override
  ConsumerState<FoodDetailsScreen> createState() => _FoodDetailsScreenState();
}

class _FoodDetailsScreenState extends ConsumerState<FoodDetailsScreen> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final food = ref.watch(foodDetailsProvider(widget.foodId));
    final cartCount = ref.watch(cartQuantityProvider);
    return Scaffold(
      appBar: BrandedAppBar(
        title: 'Meal details',
        actions: [
          Badge(
            label: Text('$cartCount'),
            isLabelVisible: cartCount > 0,
            child: IconButton(
              onPressed: () => context.push('/cart'),
              tooltip: 'Cart, $cartCount items',
              icon: const Icon(Icons.shopping_bag_outlined),
            ),
          ),
        ],
      ),
      body: food.when(
        loading: () => const LoadingState(label: 'Loading meal details'),
        error: (error, _) => ErrorState(
          message: error.toString(),
          action: ElevatedButton(
            onPressed: () => ref.invalidate(foodDetailsProvider(widget.foodId)),
            child: const Text('Retry'),
          ),
        ),
        data: (item) => _Details(
          item: item,
          quantity: _quantity,
          onQuantityChanged: (value) => setState(() => _quantity = value),
          onAdd: () => _add(item),
        ),
      ),
    );
  }

  Future<void> _add(FoodItem item) async {
    await ref.read(cartControllerProvider).add(item, quantity: _quantity);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${item.name} added to cart.'),
        action: SnackBarAction(
          label: 'View cart',
          onPressed: () => context.push('/cart'),
        ),
      ),
    );
  }
}

class _Details extends StatelessWidget {
  const _Details({
    required this.item,
    required this.quantity,
    required this.onQuantityChanged,
    required this.onAdd,
  });
  final FoodItem item;
  final int quantity;
  final ValueChanged<int> onQuantityChanged;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return ResponsiveContent(
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
              child: item.hasAssetImage
                  ? Image.asset(
                      item.imageUrl!,
                      fit: BoxFit.cover,
                      cacheWidth: 1100,
                      filterQuality: FilterQuality.high,
                      errorBuilder: (_, __, ___) =>
                          const _DetailImagePlaceholder(),
                    )
                  : item.hasNetworkImage
                  ? CachedNetworkImage(
                      imageUrl: item.imageUrl!,
                      fit: BoxFit.cover,
                      memCacheWidth: 1100,
                      placeholder: (_, __) =>
                          const _DetailImagePlaceholder(loading: true),
                      errorWidget: (_, __, ___) =>
                          const _DetailImagePlaceholder(),
                    )
                  : const _DetailImagePlaceholder(),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  item.name,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color:
                      (item.isAvailable
                              ? AppColors.statusSuccess
                              : AppColors.statusOffline)
                          .withValues(alpha: .1),
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
                child: Text(
                  item.isAvailable ? 'Available' : 'Unavailable',
                  style: AppTypography.status.copyWith(
                    color: item.isAvailable
                        ? AppColors.statusSuccess
                        : AppColors.statusOffline,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            formatLkr(item.price),
            style: AppTypography.price.copyWith(fontSize: 22),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            item.description.isEmpty
                ? 'No description supplied by the restaurant.'
                : item.description,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          if (item.dietaryTags.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: item.dietaryTags
                  .map(
                    (tag) => Chip(
                      label: Text(tag),
                      avatar: const Icon(Icons.eco_outlined, size: 18),
                    ),
                  )
                  .toList(),
            ),
          ],
          if (item.allergens.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Card(
              color: const Color(0xFFFFF5E8),
              child: ListTile(
                leading: const Icon(
                  Icons.warning_amber_rounded,
                  color: AppColors.statusWarning,
                ),
                title: const Text('Allergens'),
                subtitle: Text(item.allergens.join(', ')),
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.lg),
          Card(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.xs,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Quantity',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  QuantitySelector(
                    quantity: quantity,
                    onChanged: onQuantityChanged,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          PrimaryButton(
            label: item.isAvailable
                ? 'Add $quantity to cart'
                : 'Currently unavailable',
            onPressed: item.isAvailable ? onAdd : null,
          ),
        ],
      ),
    );
  }
}

class _DetailImagePlaceholder extends StatelessWidget {
  const _DetailImagePlaceholder({this.loading = false});
  final bool loading;
  @override
  Widget build(BuildContext context) => ColoredBox(
    color: AppColors.surfaceTint,
    child: Center(
      child: loading
          ? const CircularProgressIndicator()
          : const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.restaurant_rounded,
                  size: 76,
                  color: AppColors.brandSecondary,
                ),
                SizedBox(height: 8),
                Text('Image unavailable'),
              ],
            ),
    ),
  );
}
