import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_radius.dart';
import 'app_typography.dart';

abstract final class AppTheme {
  static ThemeData get light {
    const scheme = ColorScheme.light(
      primary: AppColors.brandPrimary,
      onPrimary: Colors.white,
      primaryContainer: Color(0xFFFFE9DD),
      onPrimaryContainer: AppColors.textPrimary,
      secondary: AppColors.brandSecondary,
      onSecondary: Colors.white,
      secondaryContainer: AppColors.surfaceTint,
      onSecondaryContainer: AppColors.brandSecondaryDark,
      tertiary: AppColors.brandAccentDark,
      onTertiary: AppColors.textPrimary,
      error: AppColors.statusCritical,
      surface: AppColors.cardSurface,
      onSurface: AppColors.textPrimary,
      outline: AppColors.borderSubtle,
      outlineVariant: Color(0xFFEAF0F4),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      textTheme: AppTypography.textTheme,
      scaffoldBackgroundColor: AppColors.pageBackground,
      splashFactory: InkRipple.splashFactory,
      visualDensity: VisualDensity.standard,
      cardTheme: const CardThemeData(
        color: AppColors.cardSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.borderSubtle),
          borderRadius: AppRadius.card,
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.cardSurface,
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: AppRadius.card,
          borderSide: BorderSide(color: AppColors.borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.card,
          borderSide: BorderSide(color: AppColors.borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.card,
          borderSide: BorderSide(color: AppColors.brandSecondary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppRadius.card,
          borderSide: BorderSide(color: AppColors.statusCritical),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.cardSurface,
        foregroundColor: AppColors.textPrimary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 19,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(48, 52),
          backgroundColor: AppColors.actionPrimary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.borderSubtle,
          disabledForegroundColor: AppColors.textSecondary,
          elevation: 0,
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.card),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 52),
          backgroundColor: AppColors.actionPrimary,
          foregroundColor: Colors.white,
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.card),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(48, 52),
          foregroundColor: AppColors.actionSecondary,
          side: const BorderSide(color: AppColors.brandSecondary),
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.card),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          minimumSize: const Size(48, 48),
          foregroundColor: AppColors.actionSecondary,
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      chipTheme: const ChipThemeData(
        shape: StadiumBorder(side: BorderSide(color: AppColors.borderSubtle)),
        backgroundColor: AppColors.cardSurface,
        selectedColor: AppColors.surfaceTint,
        side: BorderSide(color: AppColors.borderSubtle),
        labelStyle: TextStyle(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w700,
        ),
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
      navigationBarTheme: const NavigationBarThemeData(
        height: 72,
        backgroundColor: AppColors.cardSurface,
        indicatorColor: Color(0xFFFFE9DD),
        surfaceTintColor: Colors.transparent,
        labelTextStyle: WidgetStatePropertyAll(
          TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
        ),
        iconTheme: WidgetStatePropertyAll(IconThemeData(size: 24)),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtle,
        thickness: 1,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.cardSurface,
        showDragHandle: true,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppRadius.feature),
          ),
        ),
      ),
    );
  }
}
