import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/api_client.dart';
import '../data/local_menu_catalog.dart';
import '../data/menu_repository.dart';
import '../domain/food_item.dart';

final menuRepositoryProvider = Provider<MenuRepository>(
  (ref) => MenuRepository(ref.watch(dioProvider)),
);

final menuProvider = FutureProvider<List<FoodItem>>((ref) async {
  final items = await ref.watch(menuRepositoryProvider).getMenu();
  return applyLocalMenuCatalog(items);
});

final foodDetailsProvider = FutureProvider.family<FoodItem, String>((
  ref,
  id,
) async {
  final local = localMenuItemById(id);
  if (local != null) return local;
  final item = await ref.watch(menuRepositoryProvider).getFood(id);
  return applyLocalMenuImage(item);
});
