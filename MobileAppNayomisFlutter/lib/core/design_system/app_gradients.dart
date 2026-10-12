import 'package:flutter/material.dart';

import 'app_colors.dart';

abstract final class AppGradients {
  static const brandWarm = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.brandPrimary, Color(0xFFDC2626)],
  );

  static const heroOverlay = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0x18000000), Color(0xB8000000)],
    stops: [0.25, 1],
  );

  static const blueWash = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.brandSecondary, AppColors.brandSecondaryDark],
  );
}
