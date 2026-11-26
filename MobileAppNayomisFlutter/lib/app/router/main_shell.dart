import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_icons.dart';
import '../../features/authentication/application/auth_controller.dart';
import '../../features/driver/presentation/driver_screen.dart';

class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.navigationShell});
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customer = ref.watch(authControllerProvider).value?.customer;
    if (customer?.isDriver == true) {
      return const DriverScreen();
    }

    return Scaffold(
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
}
