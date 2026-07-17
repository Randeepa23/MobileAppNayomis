import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/api_client.dart';
import '../data/menu_repository.dart';
import '../domain/food_item.dart';

final menuRepositoryProvider = Provider<MenuRepository>(
  (ref) => MenuRepository(ref.watch(dioProvider)),
);

final menuProvider = FutureProvider<List<FoodItem>>(
  (ref) => ref.watch(menuRepositoryProvider).getMenu(),
);

final foodDetailsProvider = FutureProvider.family<FoodItem, String>(
  (ref, id) => ref.watch(menuRepositoryProvider).getFood(id),
);
