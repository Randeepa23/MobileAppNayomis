import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'app_database.g.dart';

class CartEntries extends Table {
  TextColumn get itemId => text()();
  TextColumn get name => text()();
  TextColumn get imageUrl => text().nullable()();
  RealColumn get unitPrice => real()();
  IntColumn get quantity => integer().withDefault(const Constant(1))();
  BoolColumn get available => boolean().withDefault(const Constant(true))();

  @override
  Set<Column<Object>> get primaryKey => {itemId};
}

@DriftDatabase(tables: [CartEntries])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(driftDatabase(name: 'nayomis_cart'));

  @override
  int get schemaVersion => 1;

  Stream<List<CartEntry>> watchCart() => (select(
    cartEntries,
  )..orderBy([(entry) => OrderingTerm.asc(entry.name)])).watch();

  Future<void> putCartItem(CartEntriesCompanion item) =>
      into(cartEntries).insertOnConflictUpdate(item);

  Future<void> addCartItem(CartEntriesCompanion item, int amount) async {
    await transaction(() async {
      final id = item.itemId.value;
      final existing = await (select(
        cartEntries,
      )..where((entry) => entry.itemId.equals(id))).getSingleOrNull();
      if (existing == null) {
        await into(cartEntries).insert(item);
      } else {
        await (update(
          cartEntries,
        )..where((entry) => entry.itemId.equals(id))).write(
          CartEntriesCompanion(quantity: Value(existing.quantity + amount)),
        );
      }
    });
  }

  Future<void> setQuantity(String itemId, int quantity) async {
    if (quantity <= 0) {
      await removeCartItem(itemId);
      return;
    }
    await (update(cartEntries)..where((entry) => entry.itemId.equals(itemId)))
        .write(CartEntriesCompanion(quantity: Value(quantity)));
  }

  Future<void> removeCartItem(String itemId) =>
      (delete(cartEntries)..where((entry) => entry.itemId.equals(itemId))).go();

  Future<void> clearCart() => delete(cartEntries).go();
}
