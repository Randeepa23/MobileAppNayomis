import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_icons.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) => Scaffold(
    body: navigationShell,
    bottomNavigationBar: DecoratedBox(
      decoration: const BoxDecoration(
        color: AppColors.cardSurface,
        border: Border(top: BorderSide(color: AppColors.borderSubtle)),
      ),
      child: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
        destinations: const [
          NavigationDestination(
            icon: Icon(AppIcons.home),
            selectedIcon: Icon(
              Icons.home_rounded,
              color: AppColors.brandPrimary,
            ),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(AppIcons.menu),
            selectedIcon: Icon(
              Icons.restaurant_menu_rounded,
              color: AppColors.brandPrimary,
            ),
            label: 'Menu',
          ),
          NavigationDestination(
            icon: Icon(AppIcons.orders),
            selectedIcon: Icon(
              Icons.receipt_long_rounded,
              color: AppColors.brandPrimary,
            ),
            label: 'Orders',
          ),
          NavigationDestination(
            icon: Icon(AppIcons.rewards),
            selectedIcon: Icon(
              Icons.card_giftcard_rounded,
              color: AppColors.brandPrimary,
            ),
            label: 'Rewards',
          ),
          NavigationDestination(
            icon: Icon(AppIcons.profile),
            selectedIcon: Icon(
              Icons.person_rounded,
              color: AppColors.brandPrimary,
            ),
            label: 'Profile',
          ),
        ],
      ),
    ),
  );
}
