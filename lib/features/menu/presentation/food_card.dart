import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/app_typography.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../domain/food_item.dart';

class FoodCard extends StatelessWidget {
  const FoodCard({
    super.key,
    required this.food,
    required this.onTap,
    required this.onAdd,
  });
  final FoodItem food;
  final VoidCallback onTap;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label:
          '${food.name}, ${formatLkr(food.price)}, ${food.isAvailable ? 'available' : 'unavailable'}',
      child: Card(
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.card,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 4 / 3,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    food.hasAssetImage
                        ? Image.asset(
                            food.imageUrl!,
                            fit: BoxFit.cover,
                            cacheWidth: 720,
                            filterQuality: FilterQuality.high,
                            errorBuilder: (_, __, ___) =>
                                const _FoodImagePlaceholder(),
                          )
                        : food.hasNetworkImage
                        ? CachedNetworkImage(
                            imageUrl: food.imageUrl!,
                            fit: BoxFit.cover,
                            memCacheWidth: 720,
                            placeholder: (_, __) =>
                                const _FoodImagePlaceholder(loading: true),
                            errorWidget: (_, __, ___) =>
                                const _FoodImagePlaceholder(),
                          )
                        : const _FoodImagePlaceholder(),
                    if (!food.isAvailable)
                      ColoredBox(color: Colors.white.withValues(alpha: .64)),
                    Positioned(
                      left: AppSpacing.sm,
                      top: AppSpacing.sm,
                      child: _AvailabilityBadge(available: food.isAvailable),
                    ),
                    if (food.isPopular || food.isNew)
                      Positioned(
                        right: AppSpacing.sm,
                        top: AppSpacing.sm,
                        child: Wrap(
                          spacing: 4,
                          children: [
                            if (food.isPopular)
                              const _FlagBadge(label: 'Popular'),
                            if (food.isNew) const _FlagBadge(label: 'New'),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        food.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        food.description.isEmpty
                            ? food.category
                            : food.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      if (food.dietaryTags.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Wrap(
                          spacing: 4,
                          runSpacing: 4,
                          children: food.dietaryTags
                              .take(2)
                              .map(
                                (tag) => Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceTint,
                                    borderRadius: BorderRadius.circular(
                                      AppRadius.pill,
                                    ),
                                  ),
                                  child: Text(
                                    tag,
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodySmall,
                                  ),
                                ),
                              )
                              .toList(),
                        ),
                      ],
                      const Spacer(),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              formatLkr(food.price),
                              style: AppTypography.price,
                            ),
                          ),
                          IconButton.filled(
                            onPressed: onAdd,
                            tooltip: food.isAvailable
                                ? 'Add ${food.name} to cart'
                                : '${food.name} is unavailable',
                            icon: Icon(
                              food.isAvailable
                                  ? Icons.add_shopping_cart_rounded
                                  : Icons.block_rounded,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FoodImagePlaceholder extends StatelessWidget {
  const _FoodImagePlaceholder({this.loading = false});
  final bool loading;
  @override
  Widget build(BuildContext context) => ColoredBox(
    color: AppColors.surfaceTint,
    child: Center(
      child: loading
          ? const SizedBox.square(
              dimension: 26,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(
              Icons.restaurant_rounded,
              size: 54,
              color: AppColors.brandSecondary,
            ),
    ),
  );
}

class _AvailabilityBadge extends StatelessWidget {
  const _AvailabilityBadge({required this.available});
  final bool available;
  @override
  Widget build(BuildContext context) {
    final color = available ? AppColors.statusSuccess : AppColors.statusOffline;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .94),
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: color),
      ),
      child: Text(
        available ? 'Available' : 'Unavailable',
        style: AppTypography.status.copyWith(color: color),
      ),
    );
  }
}

class _FlagBadge extends StatelessWidget {
  const _FlagBadge({required this.label});
  final String label;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
    decoration: BoxDecoration(
      color: AppColors.brandPrimary,
      borderRadius: BorderRadius.circular(AppRadius.pill),
    ),
    child: Text(
      label,
      style: AppTypography.status.copyWith(color: Colors.white),
    ),
  );
}
