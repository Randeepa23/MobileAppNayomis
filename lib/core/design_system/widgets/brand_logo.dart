import 'package:flutter/material.dart';

import '../../assets/app_assets.dart';
import '../app_colors.dart';
import '../app_radius.dart';

class BrandLogo extends StatelessWidget {
  const BrandLogo({super.key, this.size = 88, this.showSurface = false});

  final double size;
  final bool showSurface;

  @override
  Widget build(BuildContext context) {
    final image = Image.asset(
      AppAssets.logo,
      width: size,
      height: size,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.medium,
      semanticLabel: "Nayomi's Waterfront logo",
    );
    if (!showSurface) return image;
    return Container(
      width: size + 24,
      height: size + 24,
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: AppRadius.featureCard,
      ),
      child: image,
    );
  }
}
