import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/persistence/app_database.dart';
import '../../menu/domain/food_item.dart';

final databaseProvider = Provider<AppDatabase>((ref) {
  final database = AppDatabase();
  ref.onDispose(database.close);
  return database;
});

final cartProvider = StreamProvider<List<CartEntry>>(
  (ref) => ref.watch(databaseProvider).watchCart(),
);

final cartQuantityProvider = Provider<int>(
  (ref) => ref
      .watch(cartProvider)
      .maybeWhen(
        data: (items) => items.fold(0, (sum, item) => sum + item.quantity),
        orElse: () => 0,
      ),
);

final cartSubtotalProvider = Provider<double>(
  (ref) => ref
      .watch(cartProvider)
      .maybeWhen(
        data: (items) =>
            items.fold(0, (sum, item) => sum + item.unitPrice * item.quantity),
        orElse: () => 0,
      ),
);

class CartController {
  CartController(this._database);
  final AppDatabase _database;

  Future<void> add(FoodItem food, {int quantity = 1}) => _database.addCartItem(
    CartEntriesCompanion.insert(
      itemId: food.id,
      name: food.name,
      imageUrl: Value(food.imageUrl),
      unitPrice: food.price,
      quantity: Value(quantity),
      available: Value(food.isAvailable),
    ),
    quantity,
  );

  Future<void> setQuantity(String itemId, int quantity) =>
      _database.setQuantity(itemId, quantity);
  Future<void> remove(String itemId) => _database.removeCartItem(itemId);
  Future<void> restore(CartEntry entry) => _database.putCartItem(
    CartEntriesCompanion.insert(
      itemId: entry.itemId,
      name: entry.name,
      imageUrl: Value(entry.imageUrl),
      unitPrice: entry.unitPrice,
      quantity: Value(entry.quantity),
      available: Value(entry.available),
    ),
  );
  Future<void> clear() => _database.clearCart();
}

final cartControllerProvider = Provider<CartController>(
  (ref) => CartController(ref.watch(databaseProvider)),
);
