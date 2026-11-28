import 'dart:async';
import 'package:flutter/material.dart';

import '../../../app/router/app_router.dart';
import '../../authentication/presentation/login_screen.dart';

class SplashScreen extends StatefulWidget {
  final Widget? targetScreen;
  final String title;
  final String subtitle;

  const SplashScreen({
    super.key,
    this.targetScreen,
    this.title = "NAYOMI'S WATERFRONT",
    this.subtitle = "Smart Food Delivery • Fresh & Safe",
  });

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  // Entrance animations
  late final Animation<double> _logoFade;
  late final Animation<double> _logoScale;
  late final Animation<double> _textFade;
  late final Animation<Offset> _textSlide;

  // Exit transition
  late final Animation<double> _exitFade;

  Timer? _fallbackTimer;
  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();

    // 3.2-second total duration: 1.2s entrance, 1.4s comfortable hold, 0.6s smooth exit
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3200),
    );

    // 1. Logo Entrance (0.0 to 0.40) - Smooth, natural ease-out
    _logoFade = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.38, curve: Curves.easeOutCubic),
    );

    _logoScale = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.42, curve: Curves.easeOutCubic),
      ),
    );

    // 2. Text Branding Stagger (0.25 to 0.55)
    _textFade = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.25, 0.55, curve: Curves.easeOut),
    );

    _textSlide = Tween<Offset>(
      begin: const Offset(0.0, 0.20),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.25, 0.55, curve: Curves.easeOutCubic),
      ),
    );

    // 3. Clean Exit Fade (0.85 to 1.0)
    _exitFade = Tween<double>(begin: 1.0, end: 0.0).animate(
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

    // Safety fallback timer (3600ms)
    _fallbackTimer = Timer(const Duration(milliseconds: 3600), () {
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
        transitionDuration: const Duration(milliseconds: 400),
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
        onTap: _navigateToNext, // Instant tap-to-skip
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final logoOpacity = (_logoFade.value * _exitFade.value).clamp(0.0, 1.0);
            final textOpacity = (_textFade.value * _exitFade.value).clamp(0.0, 1.0);

            return SafeArea(
              child: Stack(
                children: [
                  // 1. Centered Pristine Transparent Brand Logo
                  Center(
                    child: Opacity(
                      opacity: logoOpacity,
                      child: Transform.scale(
                        scale: _logoScale.value,
                        child: Image.asset(
                          'assets/logo.png',
                          width: 230,
                          fit: BoxFit.contain,
                          filterQuality: FilterQuality.high,
                          isAntiAlias: true,
                          errorBuilder: (context, error, stackTrace) {
                            return Image.asset(
                              'assets/branding/nayomis-logo.png',
                              width: 230,
                              fit: BoxFit.contain,
                              filterQuality: FilterQuality.high,
                              isAntiAlias: true,
                            );
                          },
                        ),
                      ),
                    ),
                  ),

                  // 2. Elegant Minimalist Bottom Branding (Clean, Apple/Uber-style)
                  Positioned(
                    left: 24,
                    right: 24,
                    bottom: 40,
                    child: Center(
                      child: Opacity(
                        opacity: textOpacity,
                        child: SlideTransition(
                          position: _textSlide,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                widget.title,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 2.2,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                widget.subtitle,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w400,
                                  letterSpacing: 0.8,
                                  color: const Color(0xFF64748B).withValues(alpha: 0.9),
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
