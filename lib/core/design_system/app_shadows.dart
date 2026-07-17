import 'package:flutter/material.dart';

abstract final class AppShadows {
  static const card = [
    BoxShadow(color: Color(0x1429303D), blurRadius: 12, offset: Offset(0, 3)),
  ];
  static const search = [
    BoxShadow(color: Color(0x141B5998), blurRadius: 16, offset: Offset(0, 4)),
  ];
  static const floating = [
    BoxShadow(color: Color(0x2613406C), blurRadius: 24, offset: Offset(0, 8)),
  ];
  static const hero = [
    BoxShadow(color: Color(0x2E13406C), blurRadius: 28, offset: Offset(0, 10)),
  ];

  static BoxShadow tinted(Color color) => BoxShadow(
    color: color.withValues(alpha: .16),
    blurRadius: 18,
    offset: const Offset(0, 6),
  );
}
