import 'package:dio/dio.dart';

import '../../../core/networking/api_error_mapper.dart';
import '../domain/food_item.dart';

class MenuRepository {
  MenuRepository(this._dio);
  final Dio _dio;

  Future<List<FoodItem>> getMenu() async {
    try {
      final response = await _dio.get<List<dynamic>>('food');
      return (response.data ?? const [])
          .whereType<Map>()
          .map((json) => FoodItem.fromApi(Map<String, dynamic>.from(json)))
          .toList(growable: false);
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }

  Future<FoodItem> getFood(String id) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('food/' + id);
      final food = response.data?['foodItem'];
      if (food is! Map) throw const FormatException('Invalid food response.');
      return FoodItem.fromApi(Map<String, dynamic>.from(food));
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }
}
