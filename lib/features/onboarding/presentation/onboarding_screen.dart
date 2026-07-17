import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/assets/app_assets.dart';
import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_radius.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../shared/widgets/app_widgets.dart';
import '../application/onboarding_controller.dart';

class _PageData {
  const _PageData(
    this.title,
    this.message,
    this.asset,
    this.icon,
    this.semantics,
  );
  final String title;
  final String message;
  final String asset;
  final IconData icon;
  final String semantics;
}

const _pages = [
  _PageData(
    'Browse fresh meals',
    "Explore Nayomi's live menu and choose what suits you.",
    AppAssets.about,
    Icons.lunch_dining_outlined,
    "Nayomi's bakery food display",
  ),
  _PageData(
    'Pre-order school breakfast',
    'Select meals, choose a pickup point, and schedule delivery.',
    AppAssets.preorder,
    Icons.school_outlined,
    'School meal pre-order illustration',
  ),
  _PageData(
    'Track deliveries and food conditions',
    'Follow real order progress and verified food-condition updates when available.',
    'assets/hero/hero-1.webp',
    Icons.delivery_dining_outlined,
    'Delivery and pickup promotion',
  ),
  _PageData(
    'Earn loyalty rewards',
    'See your verified loyalty points and available rewards in one place.',
    AppAssets.logo,
    Icons.card_giftcard_outlined,
    "Nayomi's Waterfront logo",
  ),
];

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});
  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    await ref.read(onboardingControllerProvider.notifier).complete();
    if (mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.disableAnimationsOf(context);
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) => Align(
            alignment: Alignment.topCenter,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 640),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.xs,
                  AppSpacing.md,
                  AppSpacing.md,
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Text(
                          "Nayomi's",
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(color: AppColors.brandPrimary),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed: _finish,
                          child: const Text('Skip'),
                        ),
                      ],
                    ),
                    Expanded(
                      child: PageView.builder(
                        controller: _controller,
                        onPageChanged: (value) => setState(() => _page = value),
                        itemCount: _pages.length,
                        itemBuilder: (_, index) => _OnboardingPage(
                          item: _pages[index],
                          compact: constraints.maxHeight < 650,
                        ),
                      ),
                    ),
                    Semantics(
                      label: 'Page ${_page + 1} of ${_pages.length}',
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _pages.length,
                          (index) => AnimatedContainer(
                            duration: reduceMotion
                                ? Duration.zero
                                : const Duration(milliseconds: 180),
                            width: index == _page ? 24 : 8,
                            height: 8,
                            margin: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: index == _page
                                  ? AppColors.brandPrimary
                                  : AppColors.borderSubtle,
                              borderRadius: BorderRadius.circular(
                                AppRadius.pill,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    PrimaryButton(
                      label: _page == _pages.length - 1
                          ? 'Get Started'
                          : 'Next',
                      onPressed: () {
                        if (_page == _pages.length - 1) {
                          _finish();
                          return;
                        }
                        if (reduceMotion) {
                          _controller.jumpToPage(_page + 1);
                        } else {
                          _controller.animateToPage(
                            _page + 1,
                            duration: const Duration(milliseconds: 240),
                            curve: Curves.easeOutCubic,
                          );
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.item, required this.compact});
  final _PageData item;
  final bool compact;

  @override
  Widget build(BuildContext context) => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Container(
        constraints: BoxConstraints(maxHeight: compact ? 190 : 270),
        margin: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadius.featureCard,
        ),
        clipBehavior: Clip.antiAlias,
        child: AspectRatio(
          aspectRatio: 16 / 10,
          child: Semantics(
            image: true,
            label: item.semantics,
            child: Image.asset(
              item.asset,
              fit: item.asset == AppAssets.logo ? BoxFit.contain : BoxFit.cover,
              cacheWidth: 900,
            ),
          ),
        ),
      ),
      Container(
        width: 52,
        height: 52,
        decoration: const BoxDecoration(
          color: Color(0xFFFFE9DD),
          shape: BoxShape.circle,
        ),
        child: Icon(item.icon, color: AppColors.brandPrimary),
      ),
      const SizedBox(height: AppSpacing.md),
      Text(
        item.title,
        style: Theme.of(context).textTheme.headlineMedium,
        textAlign: TextAlign.center,
      ),
      const SizedBox(height: AppSpacing.xs),
      Text(
        item.message,
        style: Theme.of(
          context,
        ).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
        textAlign: TextAlign.center,
      ),
    ],
  );
}
