import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http_mock_adapter/http_mock_adapter.dart';
import 'package:nayomis_waterfront/features/menu/data/menu_repository.dart';

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
}
