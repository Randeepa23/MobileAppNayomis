import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/design_system/app_colors.dart';
import '../../../core/design_system/app_gradients.dart';
import '../../../core/design_system/app_spacing.dart';
import '../../../core/design_system/widgets/brand_logo.dart';
import '../../authentication/application/auth_controller.dart';
import '../../onboarding/application/onboarding_controller.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  bool _routed = false;

  void _route(AsyncValue<AuthState> auth) {
    if (_routed || !auth.hasValue) return;
    _routed = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final onboarded = ref.read(onboardingControllerProvider);
      context.go(onboarded ? '/home' : '/onboarding');
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    _route(auth);
    final reduceMotion = MediaQuery.disableAnimationsOf(context);
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(gradient: AppGradients.brandWarm),
        child: SafeArea(
          child: Center(
            child: Semantics(
              label: "Nayomi's Waterfront, starting",
              child: TweenAnimationBuilder<double>(
                duration: reduceMotion
                    ? Duration.zero
                    : const Duration(milliseconds: 500),
                tween: Tween(begin: .86, end: 1),
                curve: Curves.easeOutCubic,
                builder: (context, value, child) => Opacity(
                  opacity: value,
                  child: Transform.scale(scale: value, child: child),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const BrandLogo(size: 112, showSurface: true),
                      const SizedBox(height: AppSpacing.lg),
                      Text(
                        "Nayomi's Waterfront",
                        style: Theme.of(context).textTheme.headlineLarge
                            ?.copyWith(color: Colors.white),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        'Plan Ahead. Eat Fresh. Stress Less.',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withValues(alpha: .92),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      const SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(
                          color: AppColors.brandAccent,
                          strokeWidth: 2.5,
                          semanticsLabel: 'Restoring your session',
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
    );
  }
}
