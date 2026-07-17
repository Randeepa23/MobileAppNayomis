import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../../cart/application/cart_controller.dart';
import '../application/menu_providers.dart';
import '../domain/food_item.dart';
import 'food_card.dart';

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key});
  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {
  String _query = '';
  String? _category;

  @override
  Widget build(BuildContext context) {
    final menu = ref.watch(menuProvider);
    final cartCount = ref.watch(cartQuantityProvider);
    return Scaffold(
      appBar: BrandedAppBar(
        title: 'Menu',
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
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(menuProvider.future),
        child: menu.when(
          loading: () => const _MenuLoading(),
          error: (error, _) => ListView(
            children: [
              SizedBox(
                height: MediaQuery.sizeOf(context).height * .65,
                child: ErrorState(
                  message: error.toString(),
                  action: ElevatedButton(
                    onPressed: () => ref.invalidate(menuProvider),
                    child: const Text('Retry'),
                  ),
                ),
              ),
            ],
          ),
          data: _content,
        ),
      ),
    );
  }

  Widget _content(List<FoodItem> items) {
    final categories =
        items
            .map((item) => item.category)
            .where((value) => value.trim().isNotEmpty)
            .toSet()
            .toList()
          ..sort();
    final query = _query.trim().toLowerCase();
    final filtered = items
        .where(
          (item) =>
              (_category == null || item.category == _category) &&
              (query.isEmpty ||
                  item.name.toLowerCase().contains(query) ||
                  item.description.toLowerCase().contains(query)),
        )
        .toList();
    return ResponsiveContent(
      maxWidth: 980,
      padding: EdgeInsets.zero,
      child: CustomScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.sm,
            ),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SearchBar(
                    hintText: 'Search fresh meals',
                    leading: const Icon(
                      Icons.search_rounded,
                      color: AppColors.brandSecondary,
                    ),
                    trailing: _query.isEmpty
                        ? const []
                        : [
                            IconButton(
                              onPressed: () => setState(() => _query = ''),
                              tooltip: 'Clear search',
                              icon: const Icon(Icons.close_rounded),
                            ),
                          ],
                    onChanged: (value) => setState(() => _query = value),
                  ),
                  if (categories.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          ChoiceChip(
                            label: const Text('All'),
                            selected: _category == null,
                            onSelected: (_) => setState(() => _category = null),
                          ),
                          ...categories.map(
                            (category) => Padding(
                              padding: const EdgeInsets.only(
                                left: AppSpacing.xs,
                              ),
                              child: ChoiceChip(
                                label: Text(category),
                                selected: _category == category,
                                onSelected: (_) =>
                                    setState(() => _category = category),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.xs),
                  Semantics(
                    liveRegion: true,
                    child: Text(
                      '${filtered.length} ${filtered.length == 1 ? 'item' : 'items'}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (filtered.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                title: items.isEmpty ? 'Menu is empty' : 'No meals found',
                message: items.isEmpty
                    ? 'The restaurant has not published meals yet.'
                    : 'Try another search or category.',
                action: items.isEmpty || (_query.isEmpty && _category == null)
                    ? null
                    : OutlinedButton(
                        onPressed: () => setState(() {
                          _query = '';
                          _category = null;
                        }),
                        child: const Text('Clear filters'),
                      ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.md,
                AppSpacing.sm,
                AppSpacing.md,
                AppSpacing.xl,
              ),
              sliver: SliverGrid.builder(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 420,
                  mainAxisSpacing: AppSpacing.sm,
                  crossAxisSpacing: AppSpacing.sm,
                  childAspectRatio: .78,
                ),
                itemCount: filtered.length,
                itemBuilder: (_, index) {
                  final food = filtered[index];
                  return FoodCard(
                    food: food,
                    onTap: () => context.push('/food/${food.id}'),
                    onAdd: food.isAvailable
                        ? () async {
                            await ref.read(cartControllerProvider).add(food);
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${food.name} added to cart.'),
                                action: SnackBarAction(
                                  label: 'View cart',
                                  onPressed: () => context.push('/cart'),
                                ),
                              ),
                            );
                          }
                        : null,
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

class _MenuLoading extends StatelessWidget {
  const _MenuLoading();
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(AppSpacing.md),
    children: [
      Container(
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.borderSubtle,
          borderRadius: BorderRadius.circular(AppRadius.standard),
        ),
      ),
      const SizedBox(height: AppSpacing.md),
      ...List.generate(
        3,
        (_) => Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: AspectRatio(
            aspectRatio: 1.4,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.borderSubtle,
                borderRadius: BorderRadius.circular(AppRadius.standard),
              ),
            ),
          ),
        ),
      ),
    ],
  );
}
