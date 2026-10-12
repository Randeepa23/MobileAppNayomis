import 'package:flutter/material.dart';

abstract final class AppColors {
  // Verified from the website CSS/Tailwind source.
  static const brandPrimary = Color(0xFFEA580C);
  static const brandPrimaryDark = Color(0xFFC2410C);
  static const brandSecondary = Color(0xFF1B5998);
  static const brandSecondaryDark = Color(0xFF13406C);
  static const brandAccent = Color(0xFFFFCC33);
  static const brandAccentDark = Color(0xFFFFB300);

  static const pageBackground = Color(0xFFFAF8F2);
  static const cardSurface = Color(0xFFFFFFFF);
  static const surfaceTint = Color(0xFFF0F5FA);
  static const textPrimary = Color(0xFF29303D);
  static const textSecondary = Color(0xFF647085);
  static const borderSubtle = Color(0xFFDEE6EB);

  static const actionPrimary = brandPrimary;
  static const actionSecondary = brandSecondary;
  static const statusSuccess = Color(0xFF16794B);
  static const statusWarning = Color(0xFFB45309);
  static const statusCritical = Color(0xFFB91C1C);
  static const statusOffline = Color(0xFF64748B);

  // Compatibility aliases used by existing features.
  static const deepBlue = brandSecondary;
  static const deepBlueDark = brandSecondaryDark;
  static const gold = brandAccent;
  static const goldDark = brandAccentDark;
  static const orange = brandPrimary;
  static const red = Color(0xFFDC2626);
  static const cream = pageBackground;
  static const success = statusSuccess;
  static const warning = statusWarning;
  static const critical = statusCritical;
  static const unavailable = statusOffline;
}
