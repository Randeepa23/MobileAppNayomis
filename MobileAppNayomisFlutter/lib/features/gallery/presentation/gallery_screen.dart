import 'package:flutter/material.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/responsive_content.dart';
import '../../../shared/widgets/app_widgets.dart';

enum GalleryCategory { all, food, interior, view, drinks }

extension on GalleryCategory {
  String get label => switch (this) {
    GalleryCategory.all => 'All',
    GalleryCategory.food => 'Food',
    GalleryCategory.interior => 'Interior',
    GalleryCategory.view => 'View',
    GalleryCategory.drinks => 'Drinks',
  };
}

class GalleryItem {
  const GalleryItem(this.id, this.category, this.description);
  final String id;
  final GalleryCategory category;
  final String description;
  String get thumbnail => 'assets/gallery/thumbs/$id.webp';
  String get full => 'assets/gallery/full/$id.webp';
}

const galleryItems = [
  GalleryItem(
    '10',
    GalleryCategory.drinks,
    'New Year celebration artwork with champagne glasses',
  ),
  GalleryItem(
    '11',
    GalleryCategory.view,
    'Halloween pumpkin display beside the waterfront at dusk',
  ),
  GalleryItem(
    '12',
    GalleryCategory.food,
    'Sri Lankan rice and curry served on a banana leaf',
  ),
  GalleryItem(
    '13',
    GalleryCategory.food,
    'Rice and curry presentation on an orange promotional background',
  ),
  GalleryItem('14', GalleryCategory.food, 'Chocolate-topped pastries'),
  GalleryItem('15', GalleryCategory.food, 'Filled submarine sandwich'),
  GalleryItem('16', GalleryCategory.food, 'Black pork rice meal presentation'),
  GalleryItem('17', GalleryCategory.food, 'Authentic dum biryani menu artwork'),
  GalleryItem(
    '18',
    GalleryCategory.food,
    'Rice meal with curries and accompaniments',
  ),
  GalleryItem('19', GalleryCategory.food, 'Banana-leaf rice meal with curries'),
  GalleryItem('20', GalleryCategory.food, 'Sri Lankan meal delivery promotion'),
  GalleryItem(
    '21',
    GalleryCategory.food,
    'Fried rice with vegetables and cashews',
  ),
  GalleryItem(
    '22',
    GalleryCategory.food,
    'Twelve-inch submarine sandwich promotion',
  ),
  GalleryItem('23', GalleryCategory.food, 'Dosa meal promotion'),
  GalleryItem('24', GalleryCategory.food, 'Filled bread roll with lettuce'),
];

class GalleryScreen extends StatefulWidget {
  const GalleryScreen({super.key});
  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> {
  GalleryCategory _category = GalleryCategory.all;

  @override
  Widget build(BuildContext context) {
    final items = _category == GalleryCategory.all
        ? galleryItems
        : galleryItems.where((item) => item.category == _category).toList();
    return Scaffold(
      appBar: const BrandedAppBar(title: 'Gallery'),
      body: ResponsiveContent(
        padding: EdgeInsets.zero,
        maxWidth: 980,
        child: CustomScrollView(
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
                    Text(
                      'Our gallery',
                      style: Theme.of(context).textTheme.headlineLarge
                          ?.copyWith(color: AppColors.brandSecondary),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Approved imagery from the Nayomi’s Waterfront website.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: GalleryCategory.values
                            .map(
                              (category) => Padding(
                                padding: const EdgeInsets.only(
                                  right: AppSpacing.xs,
                                ),
                                child: ChoiceChip(
                                  key: ValueKey(
                                    'gallery-filter-${category.label}',
                                  ),
                                  label: Text(category.label),
                                  selected: _category == category,
                                  onSelected: (_) =>
                                      setState(() => _category = category),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (items.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: EmptyState(
                  title: 'No approved interior images',
                  message:
                      'The current website gallery does not publish an interior photograph in this category.',
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
                  key: const ValueKey('gallery-grid'),
                  itemCount: items.length,
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 260,
                    mainAxisSpacing: AppSpacing.sm,
                    crossAxisSpacing: AppSpacing.sm,
                    childAspectRatio: 1,
                  ),
                  itemBuilder: (_, index) {
                    final item = items[index];
                    return Semantics(
                      button: true,
                      image: true,
                      label:
                          '${item.description}. Open image ${index + 1} of ${items.length}',
                      child: InkWell(
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => GalleryViewer(
                              items: items,
                              initialIndex: index,
                            ),
                          ),
                        ),
                        borderRadius: AppRadius.card,
                        child: ClipRRect(
                          borderRadius: AppRadius.card,
                          child: Image.asset(
                            item.thumbnail,
                            fit: BoxFit.cover,
                            cacheWidth: 520,
                            excludeFromSemantics: true,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class GalleryViewer extends StatefulWidget {
  const GalleryViewer({
    super.key,
    required this.items,
    required this.initialIndex,
  });
  final List<GalleryItem> items;
  final int initialIndex;

  @override
  State<GalleryViewer> createState() => _GalleryViewerState();
}

class _GalleryViewerState extends State<GalleryViewer> {
  late final PageController _controller = PageController(
    initialPage: widget.initialIndex,
  );
  late int _index = widget.initialIndex;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.black,
    appBar: AppBar(
      backgroundColor: Colors.black,
      foregroundColor: Colors.white,
      title: Text('${_index + 1} of ${widget.items.length}'),
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        tooltip: 'Close gallery',
        icon: const Icon(Icons.close_rounded),
      ),
    ),
    body: SafeArea(
      child: PageView.builder(
        controller: _controller,
        onPageChanged: (value) => setState(() => _index = value),
        itemCount: widget.items.length,
        itemBuilder: (_, index) {
          final item = widget.items[index];
          return Semantics(
            image: true,
            label: item.description,
            child: InteractiveViewer(
              minScale: 1,
              maxScale: 4,
              child: Center(
                child: Image.asset(
                  item.full,
                  fit: BoxFit.contain,
                  cacheWidth: 1400,
                  excludeFromSemantics: true,
                ),
              ),
            ),
          );
        },
      ),
    ),
  );
}
