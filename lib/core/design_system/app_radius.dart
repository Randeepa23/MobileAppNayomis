import 'package:flutter/widgets.dart';

abstract final class AppRadius {
  static const double small = 8;
  static const double standard = 12;
  static const double large = 16;
  static const double feature = 20;
  static const double pill = 999;

  static const BorderRadius card = BorderRadius.all(Radius.circular(standard));
  static const BorderRadius featureCard = BorderRadius.all(
    Radius.circular(feature),
  );
}
