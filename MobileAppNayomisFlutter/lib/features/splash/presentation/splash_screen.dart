import 'dart:async';
import 'package:flutter/material.dart';

import '../../../app/router/app_router.dart';
import '../../../core/design_system/app_colors.dart';
import '../../authentication/presentation/login_screen.dart';

class SplashScreen extends StatefulWidget {
  final Widget? targetScreen;
  final String subtitle;

  const SplashScreen({
    super.key,
    this.targetScreen,
    this.subtitle = "Nayomi's Waterfront • Smart Food Delivery",
  });

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  // Entrance animations (0.0 -> 0.40, ~0s to 1.5s)
  late final Animation<double> _logoFadeIn;
  late final Animation<double> _logoScaleIn;
  late final Animation<double> _textFadeIn;
  late final Animation<Offset> _textSlideIn;

  // Smooth exit animations (0.85 -> 1.0, ~3.2s to 3.8s)
  late final Animation<double> _fadeOut;
  late final Animation<double> _scaleOut;

  Timer? _fallbackTimer;
  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();

    // 3.8-second luxurious total duration for a calm, premium brand entrance & hold
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3800),
    );

    // 1. Logo Entrance (0.0 to 0.40)
    _logoFadeIn = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.40, curve: Curves.easeOutCubic),
    );

    _logoScaleIn = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.45, curve: Curves.easeOutCubic),
      ),
    );

    // 2. Subtitle / Label Stagger (0.25 to 0.55)
    _textFadeIn = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.25, 0.55, curve: Curves.easeOut),
    );

    _textSlideIn = Tween<Offset>(
      begin: const Offset(0.0, 0.25),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.25, 0.55, curve: Curves.easeOutCubic),
      ),
    );

    // 3. Out-Transition (0.85 to 1.0)
    _fadeOut = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.85, 1.0, curve: Curves.easeInOutCubic),
      ),
    );

    _scaleOut = Tween<double>(begin: 1.0, end: 1.04).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.85, 1.0, curve: Curves.easeInOutCubic),
      ),
    );

    // Trigger navigation on animation completion
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _navigateToNext();
      }
    });

    _controller.forward();

    // Safety fallback Timer (4200ms)
    _fallbackTimer = Timer(const Duration(milliseconds: 4200), () {
      _navigateToNext();
    });
  }

  void _navigateToNext() {
    if (_hasNavigated || !mounted) return;
    _hasNavigated = true;

    _fallbackTimer?.cancel();
    markSplashCompleted();

    final destination = widget.targetScreen ?? const LoginScreen();

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 450),
        pageBuilder: (context, animation, secondaryAnimation) => destination,
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _fallbackTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _navigateToNext, // Tap anywhere to skip instantly
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            // Composite opacity: in (0->1), hold (1.0), out (1->0)
            final currentOpacity = (_logoFadeIn.value * _fadeOut.value).clamp(0.0, 1.0);
            final currentScale = _logoScaleIn.value * _scaleOut.value;
            final textOpacity = (_textFadeIn.value * _fadeOut.value).clamp(0.0, 1.0);

            return SafeArea(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Subtle ambient brand warmth behind the logo
                  Opacity(
                    opacity: currentOpacity * 0.7,
                    child: Container(
                      width: 280,
                      height: 280,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.brandPrimary.withValues(alpha: 0.12),
                            blurRadius: 80,
                            spreadRadius: 25,
                          ),
                          BoxShadow(
                            color: AppColors.brandAccent.withValues(alpha: 0.08),
                            blurRadius: 100,
                            spreadRadius: 35,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Centered brand logo (Ultra-HD, High filter quality)
                  Center(
                    child: Opacity(
                      opacity: currentOpacity,
                      child: Transform.scale(
                        scale: currentScale,
                        child: Image.asset(
                          'assets/logo.png',
                          width: 250,
                          fit: BoxFit.contain,
                          filterQuality: FilterQuality.high,
                          isAntiAlias: true,
                          errorBuilder: (context, error, stackTrace) {
                            return Image.asset(
                              'assets/branding/nayomis-logo.png',
                              width: 250,
                              fit: BoxFit.contain,
                              filterQuality: FilterQuality.high,
                              isAntiAlias: true,
                            );
                          },
                        ),
                      ),
                    ),
                  ),

                  // Bottom subtitle / app label positioned bottom: 36 inside SafeArea
                  Positioned(
                    left: 20,
                    right: 20,
                    bottom: 36,
                    child: Center(
                      child: Opacity(
                        opacity: textOpacity,
                        child: SlideTransition(
                          position: _textSlideIn,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                widget.subtitle,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.5,
                                  color: Colors.black54,
                                ),
                              ),
                              const SizedBox(height: 12),
                              // Sleek micro-indicator indicating load progress
                              SizedBox(
                                width: 100,
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(2),
                                  child: LinearProgressIndicator(
                                    value: _controller.value,
                                    minHeight: 2.0,
                                    backgroundColor: Colors.black.withValues(alpha: 0.06),
                                    valueColor: const AlwaysStoppedAnimation<Color>(
                                      AppColors.brandPrimary,
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
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
