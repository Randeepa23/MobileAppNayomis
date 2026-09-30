import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:nayomis_waterfront/app/router/app_router.dart';
import 'package:nayomis_waterfront/app/router/main_shell.dart';
import 'package:nayomis_waterfront/core/assets/app_assets.dart';
import 'package:nayomis_waterfront/core/design_system/app_colors.dart';
import 'package:nayomis_waterfront/core/design_system/app_theme.dart';
import 'package:nayomis_waterfront/core/persistence/app_database.dart';
import 'package:nayomis_waterfront/features/authentication/application/auth_controller.dart';
import 'package:nayomis_waterfront/features/authentication/presentation/login_screen.dart';
import 'package:nayomis_waterfront/features/authentication/presentation/register_screen.dart';
import 'package:nayomis_waterfront/features/cart/application/cart_controller.dart';
import 'package:nayomis_waterfront/features/cart/presentation/cart_screen.dart';
import 'package:nayomis_waterfront/features/gallery/presentation/gallery_screen.dart';
import 'package:nayomis_waterfront/features/home/presentation/home_screen.dart';
import 'package:nayomis_waterfront/features/menu/application/menu_providers.dart';
import 'package:nayomis_waterfront/features/menu/data/local_menu_catalog.dart';
import 'package:nayomis_waterfront/features/menu/domain/food_item.dart';
import 'package:nayomis_waterfront/features/menu/presentation/food_card.dart';
import 'package:nayomis_waterfront/features/menu/presentation/menu_screen.dart';
import 'package:nayomis_waterfront/shared/widgets/app_widgets.dart';
import 'package:timezone/data/latest.dart' as timezone_data;

class _PendingAuthController extends AuthController {
  @override
  Future<AuthState> build() => Completer<AuthState>().future;
}

class _AnonymousAuthController extends AuthController {
  @override
  Future<AuthState> build() async => const AuthState();
}

class _ReadyRegistrationController extends RegistrationController {
  @override
  Future<void> build() async {}
}

const _food = FoodItem(
  id: 'food-1',
  name: 'Backend breakfast',
  description: 'A description supplied by the restaurant backend.',
  category: 'Breakfast',
  price: 490,
  isAvailable: true,
  imageUrl: AppAssets.menuChickenBurger,
  isPopular: true,
);

Widget _themed(
  Widget child, {
  Widget Function(Widget child)? providerWrapper,
  MediaQueryData? mediaQuery,
}) {
  final app = MaterialApp(
    theme: AppTheme.light,
    home: Builder(
      builder: (context) => MediaQuery(
        data:
            mediaQuery ??
            MediaQuery.of(context).copyWith(disableAnimations: true),
        child: child,
      ),
    ),
  );
  return providerWrapper?.call(app) ?? app;
}

void main() {
  timezone_data.initializeTimeZones();

  test('theme uses verified website colours', () {
    expect(AppColors.brandPrimary, const Color(0xFFEA580C));
    expect(AppColors.brandSecondary, const Color(0xFF1B5998));
    expect(AppColors.brandAccent, const Color(0xFFFFCC33));
    expect(AppTheme.light.scaffoldBackgroundColor, AppColors.pageBackground);
  });

  testWidgets('app router starts directly on login', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(_PendingAuthController.new),
        ],
        child: Consumer(
          builder: (context, ref, _) => MaterialApp.router(
            theme: AppTheme.light,
            routerConfig: ref.watch(appRouterProvider),
          ),
        ),
      ),
    );
    await tester.pump();

    expect(find.text("Nayomi's Waterfront"), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.byType(PageView), findsNothing);
  });

  testWidgets(
    'login layout is branded and exposes password visibility control',
    (tester) async {
      await tester.pumpWidget(
        _themed(
          const LoginScreen(),
          providerWrapper: (child) => ProviderScope(
            overrides: [
              authControllerProvider.overrideWith(_AnonymousAuthController.new),
            ],
            child: child,
          ),
        ),
      );
      await tester.pump();

      expect(find.text("Nayomi's Waterfront"), findsOneWidget);
      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.byTooltip('Show password'), findsOneWidget);
      expect(find.text('Log in'), findsOneWidget);
      expect(find.text("New to Nayomi's? Sign up"), findsOneWidget);
    },
  );

  testWidgets('registration layout renders all real account fields', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      _themed(
        const RegisterScreen(),
        providerWrapper: (child) => ProviderScope(
          overrides: [
            registrationControllerProvider.overrideWith(
              _ReadyRegistrationController.new,
            ),
          ],
          child: child,
        ),
      ),
    );
    await tester.pump();

    expect(find.text('Create your account'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(4));
    expect(find.text('Create account'), findsOneWidget);
  });

  testWidgets(
    'bottom navigation has five labelled destinations and preserves shell routing',
    (tester) async {
      late final GoRouter router;
      router = GoRouter(
        initialLocation: '/home',
        routes: [
          StatefulShellRoute.indexedStack(
            builder: (_, __, shell) => MainShell(navigationShell: shell),
            branches: [
              StatefulShellBranch(
                routes: [
                  GoRoute(
                    path: '/home',
                    builder: (_, __) => const Text('Home page'),
                  ),
                ],
              ),
              StatefulShellBranch(
                routes: [
                  GoRoute(
                    path: '/menu',
                    builder: (_, __) => const Text('Menu page'),
                  ),
                ],
              ),
              StatefulShellBranch(
                routes: [
                  GoRoute(
                    path: '/orders',
                    builder: (_, __) => const Text('Orders page'),
                  ),
                ],
              ),
              StatefulShellBranch(
                routes: [
                  GoRoute(
                    path: '/rewards',
                    builder: (_, __) => const Text('Rewards page'),
                  ),
                ],
              ),
              StatefulShellBranch(
                routes: [
                  GoRoute(
                    path: '/profile',
                    builder: (_, __) => const Text('Profile page'),
                  ),
                ],
              ),
            ],
          ),
        ],
      );
      addTearDown(router.dispose);
      await tester.pumpWidget(
        MaterialApp.router(theme: AppTheme.light, routerConfig: router),
      );
      await tester.pumpAndSettle();

      for (final label in ['Home', 'Menu', 'Orders', 'Rewards', 'Profile']) {
        expect(find.text(label), findsOneWidget);
      }
      await tester.tap(find.text('Menu'));
      await tester.pumpAndSettle();
      expect(find.text('Menu page'), findsOneWidget);
    },
  );

  testWidgets(
    'home renders an honest empty menu state on a narrow device with large text',
    (tester) async {
      tester.view.physicalSize = const Size(320, 640);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      const media = MediaQueryData(
        size: Size(320, 640),
        textScaler: TextScaler.linear(1.35),
        disableAnimations: true,
      );
      await tester.pumpWidget(
        _themed(
          const HomeScreen(),
          mediaQuery: media,
          providerWrapper: (child) => ProviderScope(
            overrides: [
              authControllerProvider.overrideWith(_AnonymousAuthController.new),
              menuProvider.overrideWith((ref) async => const <FoodItem>[]),
              cartQuantityProvider.overrideWith((ref) => 0),
            ],
            child: child,
          ),
        ),
      );
      await tester.pumpAndSettle();

      for (
        var attempt = 0;
        attempt < 8 && find.text('Menu is empty').evaluate().isEmpty;
        attempt++
      ) {
        await tester.drag(find.byType(ListView).first, const Offset(0, -260));
        await tester.pumpAndSettle();
      }
      expect(find.text('Menu is empty'), findsOneWidget);
      expect(find.byType(PageView), findsNothing);
      await tester.dragUntilVisible(
        find.byType(StatusBadge),
        find.byType(ListView).first,
        const Offset(0, -260),
      );
      expect(find.byType(StatusBadge), findsOneWidget);
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox.shrink());
    },
  );

  testWidgets('home menu preview is balanced on a phone-sized screen', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      _themed(
        const HomeScreen(),
        providerWrapper: (child) => ProviderScope(
          overrides: [
            authControllerProvider.overrideWith(_AnonymousAuthController.new),
            menuProvider.overrideWith((ref) async => localMenuItems),
            cartQuantityProvider.overrideWith((ref) => 0),
          ],
          child: child,
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.dragUntilVisible(
      find.text('Popular items'),
      find.byType(ListView).first,
      const Offset(0, -260),
    );

    expect(find.text('Browse categories'), findsOneWidget);
    expect(find.text('Popular items'), findsOneWidget);
    expect(find.text('Fish Bun'), findsOneWidget);
    expect(find.text('BUNS'), findsWidgets);
    expect(find.text('Rs. 120.00'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('menu food card shows backend fields and real badges', (
    tester,
  ) async {
    await tester.pumpWidget(
      _themed(FoodCard(food: _food, onTap: () {}, onAdd: () {})),
    );
    await tester.pump();

    expect(find.text('Backend breakfast'), findsOneWidget);
    expect(find.text('Rs. 490.00'), findsOneWidget);
    expect(find.text('Popular'), findsOneWidget);
    expect(find.text('Available'), findsOneWidget);
    expect(find.byType(Image), findsOneWidget);
  });

  testWidgets('menu screen displays the local catalog with clear images', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      _themed(
        const MenuScreen(),
        providerWrapper: (child) => ProviderScope(
          overrides: [
            menuProvider.overrideWith((ref) async => localMenuItems),
            cartQuantityProvider.overrideWith((ref) => 0),
          ],
          child: child,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('7 items'), findsOneWidget);
    expect(find.text('Fish Bun'), findsOneWidget);
    expect(find.byType(Image), findsWidgets);
    expect(find.text('Menu is empty'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'gallery filters its lazy grid and exposes truthful empty category',
    (tester) async {
      await tester.pumpWidget(_themed(const GalleryScreen()));
      await tester.pumpAndSettle();

      expect(find.byKey(const ValueKey('gallery-grid')), findsOneWidget);
      expect(find.byKey(const ValueKey('gallery-filter-Food')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('gallery-filter-Interior')));
      await tester.pumpAndSettle();
      expect(find.text('No approved interior images'), findsOneWidget);
    },
  );

  testWidgets(
    'cart layout labels totals as estimates and keeps item controls visible',
    (tester) async {
      const entry = CartEntry(
        itemId: 'food-1',
        name: 'Backend breakfast',
        unitPrice: 490,
        quantity: 2,
        available: true,
      );
      await tester.pumpWidget(
        _themed(
          const CartScreen(),
          providerWrapper: (child) => ProviderScope(
            overrides: [
              cartProvider.overrideWith((ref) => Stream.value(const [entry])),
              cartSubtotalProvider.overrideWith((ref) => 980),
            ],
            child: child,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Backend breakfast'), findsOneWidget);
      expect(find.text('Estimated subtotal'), findsOneWidget);
      expect(find.text('Continue to checkout'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}
