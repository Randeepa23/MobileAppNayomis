import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/brand_logo.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../core/design_system/widgets/section_header.dart';
import '../../../core/time/opening_status.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../../authentication/application/auth_controller.dart';
import '../../cart/application/cart_controller.dart';
import '../../menu/application/menu_providers.dart';
import '../../menu/domain/food_item.dart';
import 'widgets/hero_carousel.dart';
import 'widgets/home_preview_card.dart';
import 'widgets/preorder_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customer = ref.watch(authControllerProvider).value?.customer;
    final cartCount = ref.watch(cartQuantityProvider);
    final status = colomboOpeningStatus();
    final menu = ref.watch(menuProvider);
    final firstName = customer?.name.trim().split(RegExp(r'\s+')).first;
    return Scaffold(
      appBar: AppBar(
        leadingWidth: 62,
        leading: const Padding(
          padding: EdgeInsets.all(7),
          child: BrandLogo(size: 46),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              firstName == null || firstName.isEmpty
                  ? 'Welcome to Nayomi’s'
                  : 'Hello, $firstName',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            Text(
              'Waterfront',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.brandPrimary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => context.push('/notifications'),
            tooltip: 'Notifications',
            icon: const Icon(Icons.notifications_outlined),
          ),
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
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(menuProvider.future),
        child: ResponsiveContent(
          padding: EdgeInsets.zero,
          child: ListView(
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.xl,
            ),
            children: [
              SearchBar(
                hintText: 'Search fresh meals',
                leading: const Icon(
                  Icons.search_rounded,
                  color: AppColors.brandSecondary,
                ),
                trailing: const [
                  Icon(
                    Icons.arrow_forward_rounded,
                    color: AppColors.brandPrimary,
                  ),
                ],
                elevation: const WidgetStatePropertyAll(1),
                onTap: () => context.go('/menu'),
              ),
              const SizedBox(height: AppSpacing.sm),
              Align(
                alignment: Alignment.centerLeft,
                child: StatusBadge(
                  label: status.message,
                  icon: status.isOpen
                      ? Icons.schedule_rounded
                      : Icons.nights_stay_outlined,
                  color: status.isOpen
                      ? AppColors.statusSuccess
                      : AppColors.statusOffline,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              HeroCarousel(
                onMenu: () => context.go('/menu'),
                onOrders: () => context.go('/orders'),
                onPreorder: () => context.go('/menu'),
              ),
              const SizedBox(height: AppSpacing.lg),
              PreorderCard(onPressed: () => context.go('/menu')),
              const SizedBox(height: AppSpacing.lg),
              menu.when(
                loading: () => const _MenuLoadingPreview(),
                error: (error, _) => Card(
                  child: ListTile(
                    leading: const Icon(
                      Icons.cloud_off_outlined,
                      color: AppColors.statusOffline,
                    ),
                    title: const Text('Menu preview unavailable'),
                    subtitle: const Text(
                      'Live restaurant data could not be loaded.',
                    ),
                    trailing: TextButton(
                      onPressed: () => ref.invalidate(menuProvider),
                      child: const Text('Retry'),
                    ),
                  ),
                ),
                data: (items) => items.isEmpty
                    ? const EmptyState(
                        title: 'Menu is empty',
                        message: 'The restaurant has not published meals yet.',
                      )
                    : _MenuHomeContent(items: items),
              ),
              if (customer != null) ...[
                const SizedBox(height: AppSpacing.lg),
                const SectionHeader(title: 'Your loyalty'),
                const SizedBox(height: AppSpacing.sm),
                HomePreviewCard(
                  icon: Icons.card_giftcard_outlined,
                  title: '${customer.points} verified points',
                  message: 'View your current server-provided loyalty balance.',
                  accent: AppColors.brandAccentDark,
                  onTap: () => context.go('/rewards'),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),
              const SectionHeader(
                title: 'More from Nayomi’s',
                subtitle: 'Restaurant services and waterfront story',
              ),
              const SizedBox(height: AppSpacing.sm),
              HomePreviewCard(
                icon: Icons.room_service_outlined,
                title: 'Our services',
                message:
                    'All You Can Eat, pre-order service, and vegan options.',
                onTap: () => context.push('/about'),
              ),
              const SizedBox(height: AppSpacing.sm),
              HomePreviewCard(
                icon: Icons.info_outline_rounded,
                title: 'Our story',
                message:
                    'Authentic Sri Lankan food and waterfront dining since 1976.',
                onTap: () => context.push('/about'),
              ),
              const SizedBox(height: AppSpacing.sm),
              HomePreviewCard(
                icon: Icons.photo_library_outlined,
                title: 'Gallery',
                message: 'Explore approved food and restaurant imagery.',
                onTap: () => context.push('/gallery'),
              ),
              const SizedBox(height: AppSpacing.sm),
              HomePreviewCard(
                icon: Icons.location_on_outlined,
                title: 'Visit or contact us',
                message: 'Nayomi’s, Katunayake 11500',
                onTap: () => context.push('/contact'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuHomeContent extends StatelessWidget {
  const _MenuHomeContent({required this.items});
  final List<FoodItem> items;

  @override
  Widget build(BuildContext context) {
    final categories = items
        .map((item) => item.category)
        .where((value) => value.trim().isNotEmpty)
        .toSet()
        .take(8)
        .toList();
    final popular = items.where((item) => item.isPopular).take(6).toList();
    final newest = items.where((item) => item.isNew).take(6).toList();
    final highlights = popular.isEmpty && newest.isEmpty
        ? items.take(6).toList()
        : <FoodItem>[];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (categories.isNotEmpty) ...[
          const SectionHeader(title: 'Food categories'),
          const SizedBox(height: AppSpacing.xs),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: categories
                  .map(
                    (category) => Padding(
                      padding: const EdgeInsets.only(right: AppSpacing.xs),
                      child: ActionChip(
                        label: Text(category),
                        avatar: const Icon(Icons.restaurant_outlined, size: 18),
                        onPressed: () => context.go('/menu'),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
        if (popular.isNotEmpty)
          _FoodStrip(title: 'Popular items', items: popular),
        if (popular.isNotEmpty && newest.isNotEmpty)
          const SizedBox(height: AppSpacing.lg),
        if (newest.isNotEmpty) _FoodStrip(title: 'New items', items: newest),
        if (highlights.isNotEmpty)
          _FoodStrip(title: 'Menu highlights', items: highlights),
      ],
    );
  }
}

class _FoodStrip extends StatelessWidget {
  const _FoodStrip({required this.title, required this.items});
  final String title;
  final List<FoodItem> items;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SectionHeader(title: title, onAction: () => context.go('/menu')),
      const SizedBox(height: AppSpacing.sm),
      SizedBox(
        height: 198,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
          itemBuilder: (_, index) => _FoodPreviewTile(food: items[index]),
        ),
      ),
    ],
  );
}

class _FoodPreviewTile extends StatelessWidget {
  const _FoodPreviewTile({required this.food});
  final FoodItem food;

  @override
  Widget build(BuildContext context) {
    final validImage =
        Uri.tryParse(food.imageUrl ?? '')?.hasAbsolutePath == true &&
        (food.imageUrl?.startsWith('http') ?? false);
    return SizedBox(
      width: 172,
      child: Card(
        child: InkWell(
          onTap: () => context.push('/food/${food.id}'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 16 / 8,
                child: validImage
                    ? CachedNetworkImage(
                        imageUrl: food.imageUrl!,
                        fit: BoxFit.cover,
                        memCacheWidth: 420,
                        placeholder: (_, __) => const _FoodPlaceholder(),
                        errorWidget: (_, __, ___) => const _FoodPlaceholder(),
                      )
                    : const _FoodPlaceholder(),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        food.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const Spacer(),
                      Text(
                        formatLkr(food.price),
                        style: const TextStyle(
                          color: AppColors.brandPrimary,
                          fontWeight: FontWeight.w900,
                        ),
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

class _FoodPlaceholder extends StatelessWidget {
  const _FoodPlaceholder();
  @override
  Widget build(BuildContext context) => const ColoredBox(
    color: AppColors.surfaceTint,
    child: Center(
      child: Icon(
        Icons.restaurant_rounded,
        color: AppColors.brandSecondary,
        size: 38,
      ),
    ),
  );
}

class _MenuLoadingPreview extends StatelessWidget {
  const _MenuLoadingPreview();
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const SectionHeader(title: 'Fresh from the menu'),
      const SizedBox(height: AppSpacing.sm),
      SizedBox(
        height: 160,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: 3,
          separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
          itemBuilder: (_, __) => Container(
            width: 170,
            decoration: BoxDecoration(
              color: AppColors.borderSubtle,
              borderRadius: BorderRadius.circular(AppRadius.standard),
            ),
          ),
        ),
      ),
    ],
  );
}
