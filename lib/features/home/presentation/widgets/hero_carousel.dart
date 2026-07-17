import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/design_system/app_colors.dart';
import '../../../../core/design_system/app_gradients.dart';
import '../../../../core/design_system/app_radius.dart';
import '../../../../core/design_system/app_shadows.dart';
import '../../../../core/design_system/app_spacing.dart';

class HeroCarousel extends StatefulWidget {
  const HeroCarousel({
    super.key,
    required this.onMenu,
    required this.onOrders,
    required this.onPreorder,
  });

  final VoidCallback onMenu;
  final VoidCallback onOrders;
  final VoidCallback onPreorder;

  @override
  State<HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<HeroCarousel> {
  final _controller = PageController();
  Timer? _timer;
  int _page = 0;
  bool _precacheStarted = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_precacheStarted) {
      _precacheStarted = true;
      precacheImage(const AssetImage('assets/hero/hero-1.webp'), context);
    }
    _timer?.cancel();
    if (!MediaQuery.disableAnimationsOf(context)) {
      _timer = Timer.periodic(const Duration(seconds: 6), (_) {
        if (!mounted || !_controller.hasClients) return;
        _controller.animateToPage(
          (_page + 1) % AppAssets.heroImages.length,
          duration: const Duration(milliseconds: 360),
          curve: Curves.easeOutCubic,
        );
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final actions = [widget.onOrders, widget.onMenu, widget.onPreorder];
    final labels = ['View orders', 'Browse menu', 'Plan breakfast'];
    final semantics = [
      'Delivery and pickup promotion',
      'Registration and fresh meal promotion',
      'School breakfast care promotion',
    ];
    return Column(
      children: [
        Container(
          decoration: const BoxDecoration(
            borderRadius: AppRadius.featureCard,
            boxShadow: AppShadows.hero,
          ),
          clipBehavior: Clip.antiAlias,
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: Material(
              color: Colors.transparent,
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (value) => setState(() => _page = value),
                itemCount: AppAssets.heroImages.length,
                itemBuilder: (_, index) => Semantics(
                  image: true,
                  button: true,
                  label: '${semantics[index]}. ${labels[index]}',
                  child: InkWell(
                    onTap: actions[index],
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset(
                          AppAssets.heroImages[index],
                          fit: BoxFit.cover,
                          cacheWidth: 1200,
                          excludeFromSemantics: true,
                        ),
                        const DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: AppGradients.heroOverlay,
                          ),
                        ),
                        Align(
                          alignment: Alignment.bottomLeft,
                          child: Padding(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                                vertical: AppSpacing.sm,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: .58),
                                borderRadius: BorderRadius.circular(
                                  AppRadius.pill,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Flexible(
                                    child: Text(
                                      labels[index],
                                      style: Theme.of(context)
                                          .textTheme
                                          .labelLarge
                                          ?.copyWith(color: Colors.white),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.xs),
                                  const Icon(
                                    Icons.arrow_forward_rounded,
                                    color: AppColors.brandAccent,
                                    size: 18,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Material(
          color: Colors.transparent,
          child: Semantics(
            label: 'Promotion ${_page + 1} of ${AppAssets.heroImages.length}',
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                AppAssets.heroImages.length,
                (index) => Semantics(
                  button: true,
                  label: 'Show promotion ${index + 1}',
                  child: InkWell(
                    onTap: () => _controller.animateToPage(
                      index,
                      duration: const Duration(milliseconds: 240),
                      curve: Curves.easeOut,
                    ),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: AnimatedContainer(
                        duration: MediaQuery.disableAnimationsOf(context)
                            ? Duration.zero
                            : const Duration(milliseconds: 180),
                        width: index == _page ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: index == _page
                              ? AppColors.brandPrimary
                              : AppColors.borderSubtle,
                          borderRadius: BorderRadius.circular(AppRadius.pill),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
