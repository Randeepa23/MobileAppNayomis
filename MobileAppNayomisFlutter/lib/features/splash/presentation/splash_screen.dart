import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/assets/app_assets.dart';
import '../../../core/design_system/app_colors.dart';
import '../../authentication/application/auth_controller.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeIn;
  late final Animation<double> _scaleIn;
  late final Animation<Offset> _slideIn;

  late final Animation<double> _textFadeIn;
  late final Animation<Offset> _textSlideIn;

  late final Animation<double> _fadeOut;
  late final Animation<double> _scaleOut;

  bool _navigated = false;

  @override
  void initState() {
    super.initState();

    // 5-second total duration for clean in, hold/breathe, and out transitions
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 5000),
    );

    // In-transition (0s to 1.3s -> 0.0 to 0.26)
    _fadeIn = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.26, curve: Curves.easeOutCubic),
    );

    _scaleIn = Tween<double>(begin: 0.70, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.28, curve: Curves.easeOutBack),
      ),
    );

    _slideIn = Tween<Offset>(
      begin: const Offset(0, 0.12),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.26, curve: Curves.easeOutCubic),
      ),
    );

    // Subtitle & Branding text fade-in (0.8s to 1.8s -> 0.16 to 0.36)
    _textFadeIn = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.16, 0.36, curve: Curves.easeOut),
    );

    _textSlideIn = Tween<Offset>(
      begin: const Offset(0, 0.25),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.16, 0.36, curve: Curves.easeOutCubic),
      ),
    );

    // Out-transition (4.1s to 5.0s -> 0.82 to 1.0)
    _fadeOut = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.82, 1.0, curve: Curves.easeInOutCubic),
      ),
    );

    _scaleOut = Tween<double>(begin: 1.0, end: 1.10).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.82, 1.0, curve: Curves.easeInOutCubic),
      ),
    );

    _controller.forward();

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _navigateNext();
      }
    });
  }

  void _navigateNext() {
    if (_navigated || !mounted) return;
    _navigated = true;

    final auth = ref.read(authControllerProvider);
    final isAuthenticated = auth.value?.isAuthenticated == true;

    if (isAuthenticated) {
      context.go('/home');
    } else {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _navigateNext, // User can optionally tap to skip
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            // Composite combined opacity and scale:
            // In: 0 -> 1, Hold: 1, Out: 1 -> 0
            final currentOpacity = (_fadeIn.value * _fadeOut.value).clamp(0.0, 1.0);
            final currentScale = _scaleIn.value * _scaleOut.value;

            // Subtle gentle breathing pulse during the hold phase (1.3s to 4.1s)
            final progress = _controller.value;
            final breathe = (progress > 0.26 && progress < 0.82)
                ? math.sin((progress - 0.26) / (0.82 - 0.26) * math.pi * 3) * 0.02
                : 0.0;

            return Container(
              width: double.infinity,
              height: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFFFFFFFF),
                    Color(0xFFFFFDF9),
                    Color(0xFFFFF6ED),
                  ],
                ),
              ),
              child: SafeArea(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Ambient radial glow behind logo
                    Opacity(
                      opacity: currentOpacity * 0.8,
                      child: Container(
                        width: 280,
                        height: 280,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.brandPrimary.withValues(alpha: 0.15),
                              blurRadius: 70,
                              spreadRadius: 20,
                            ),
                            BoxShadow(
                              color: AppColors.brandAccent.withValues(alpha: 0.10),
                              blurRadius: 90,
                              spreadRadius: 30,
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Main Centered Content
                    Opacity(
                      opacity: currentOpacity,
                      child: Transform.scale(
                        scale: currentScale + breathe,
                        child: SlideTransition(
                          position: _slideIn,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Elegant white elevated badge for Logo
                              Container(
                                width: 140,
                                height: 140,
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.06),
                                      blurRadius: 28,
                                      offset: const Offset(0, 10),
                                    ),
                                    BoxShadow(
                                      color: AppColors.brandPrimary.withValues(alpha: 0.08),
                                      blurRadius: 18,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                  border: Border.all(
                                    color: AppColors.brandPrimary.withValues(alpha: 0.12),
                                    width: 1.5,
                                  ),
                                ),
                                child: Image.asset(
                                  AppAssets.logo,
                                  fit: BoxFit.contain,
                                  filterQuality: FilterQuality.high,
                                ),
                              ),

                              const SizedBox(height: 28),

                              // Animated Branding Text & Taglines
                              FadeTransition(
                                opacity: _textFadeIn,
                                child: SlideTransition(
                                  position: _textSlideIn,
                                  child: Column(
                                    children: [
                                      Text(
                                        "NAYOMI'S WATERFRONT",
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: 2.5,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 14,
                                          vertical: 5,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.brandPrimary.withValues(alpha: 0.08),
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(
                                            color: AppColors.brandPrimary.withValues(alpha: 0.18),
                                            width: 1,
                                          ),
                                        ),
                                        child: Text(
                                          "Smart Food Delivery • School Breakfast",
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            letterSpacing: 0.4,
                                            color: AppColors.brandPrimaryDark,
                                          ),
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
                    ),

                    // Elegant subtle loading progress bar at bottom
                    Positioned(
                      bottom: 40,
                      child: Opacity(
                        opacity: currentOpacity,
                        child: Column(
                          children: [
                            // Sleek micro-progress track
                            SizedBox(
                              width: 130,
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(3),
                                child: LinearProgressIndicator(
                                  value: _controller.value,
                                  minHeight: 2.5,
                                  backgroundColor: AppColors.brandPrimary.withValues(alpha: 0.12),
                                  valueColor: const AlwaysStoppedAnimation<Color>(
                                    AppColors.brandPrimary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              "Loading fresh experience...",
                              style: TextStyle(
                                fontSize: 11,
                                letterSpacing: 0.8,
                                fontWeight: FontWeight.w500,
                                color: AppColors.textSecondary.withValues(alpha: 0.8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
