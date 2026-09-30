import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http_mock_adapter/http_mock_adapter.dart';
import 'package:nayomis_waterfront/core/assets/app_assets.dart';
import 'package:nayomis_waterfront/features/menu/application/menu_providers.dart';
import 'package:nayomis_waterfront/features/menu/data/local_menu_catalog.dart';
import 'package:nayomis_waterfront/features/menu/data/menu_repository.dart';
import 'package:nayomis_waterfront/features/menu/domain/food_item.dart';

void main() {
  test('maps real backend food IDs and availability', () async {
    final dio = Dio(BaseOptions(baseUrl: 'https://example.test/api/'));
    final adapter = DioAdapter(dio: dio);
    adapter.onGet(
      'food',
      (server) => server.reply(200, [
        {
          '_id': 'mongo-food-id',
          'name': 'Fresh breakfast',
          'price': 450,
          'category': 'Breakfast',
          'available': true,
        },
      ]),
    );

    final menu = await MenuRepository(dio).getMenu();

    expect(menu.single.id, 'mongo-food-id');
    expect(menu.single.price, 450);
    expect(menu.single.isAvailable, isTrue);
  });

  test(
    'uses the seven-item local catalog when the backend menu is empty',
    () async {
      final dio = Dio(BaseOptions(baseUrl: 'https://example.test/api/'));
      final adapter = DioAdapter(dio: dio);
      adapter.onGet('food', (server) => server.reply(200, <dynamic>[]));
      final container = ProviderContainer(
        overrides: [
          menuRepositoryProvider.overrideWithValue(MenuRepository(dio)),
        ],
      );
      addTearDown(container.dispose);

      final menu = await container.read(menuProvider.future);

      expect(menu, hasLength(7));
      expect(menu.map((item) => item.name), contains('Chicken Burger'));
      expect(menu.every((item) => item.hasAssetImage), isTrue);
    },
  );

  test('keeps backend data while applying the matching local image', () {
    const backendItem = FoodItem(
      id: 'backend-fish-roll-id',
      name: 'Fish Roll',
      description: 'Backend description',
      category: 'Bakery',
      price: 175,
      isAvailable: false,
    );

    final mapped = applyLocalMenuCatalog([backendItem]).single;

    expect(mapped.id, backendItem.id);
    expect(mapped.price, backendItem.price);
    expect(mapped.isAvailable, isFalse);
    expect(mapped.hasAssetImage, isTrue);
    expect(mapped.imageUrl, AppAssets.menuFishRoll);
  });
}
