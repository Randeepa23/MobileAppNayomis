// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $CartEntriesTable extends CartEntries
    with TableInfo<$CartEntriesTable, CartEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CartEntriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _itemIdMeta = const VerificationMeta('itemId');
  @override
  late final GeneratedColumn<String> itemId = GeneratedColumn<String>(
    'item_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _imageUrlMeta = const VerificationMeta(
    'imageUrl',
  );
  @override
  late final GeneratedColumn<String> imageUrl = GeneratedColumn<String>(
    'image_url',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _unitPriceMeta = const VerificationMeta(
    'unitPrice',
  );
  @override
  late final GeneratedColumn<double> unitPrice = GeneratedColumn<double>(
    'unit_price',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _quantityMeta = const VerificationMeta(
    'quantity',
  );
  @override
  late final GeneratedColumn<int> quantity = GeneratedColumn<int>(
    'quantity',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1),
  );
  static const VerificationMeta _availableMeta = const VerificationMeta(
    'available',
  );
  @override
  late final GeneratedColumn<bool> available = GeneratedColumn<bool>(
    'available',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("available" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  @override
  List<GeneratedColumn> get $columns => [
    itemId,
    name,
    imageUrl,
    unitPrice,
    quantity,
    available,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cart_entries';
  @override
  VerificationContext validateIntegrity(
    Insertable<CartEntry> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('item_id')) {
      context.handle(
        _itemIdMeta,
        itemId.isAcceptableOrUnknown(data['item_id']!, _itemIdMeta),
      );
    } else if (isInserting) {
      context.missing(_itemIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('image_url')) {
      context.handle(
        _imageUrlMeta,
        imageUrl.isAcceptableOrUnknown(data['image_url']!, _imageUrlMeta),
      );
    }
    if (data.containsKey('unit_price')) {
      context.handle(
        _unitPriceMeta,
        unitPrice.isAcceptableOrUnknown(data['unit_price']!, _unitPriceMeta),
      );
    } else if (isInserting) {
      context.missing(_unitPriceMeta);
    }
    if (data.containsKey('quantity')) {
      context.handle(
        _quantityMeta,
        quantity.isAcceptableOrUnknown(data['quantity']!, _quantityMeta),
      );
    }
    if (data.containsKey('available')) {
      context.handle(
        _availableMeta,
        available.isAcceptableOrUnknown(data['available']!, _availableMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {itemId};
  @override
  CartEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CartEntry(
      itemId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}item_id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      imageUrl: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}image_url'],
      ),
      unitPrice: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}unit_price'],
      )!,
      quantity: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}quantity'],
      )!,
      available: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}available'],
      )!,
    );
  }

  @override
  $CartEntriesTable createAlias(String alias) {
    return $CartEntriesTable(attachedDatabase, alias);
  }
}

class CartEntry extends DataClass implements Insertable<CartEntry> {
  final String itemId;
  final String name;
  final String? imageUrl;
  final double unitPrice;
  final int quantity;
  final bool available;
  const CartEntry({
    required this.itemId,
    required this.name,
    this.imageUrl,
    required this.unitPrice,
    required this.quantity,
    required this.available,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['item_id'] = Variable<String>(itemId);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || imageUrl != null) {
      map['image_url'] = Variable<String>(imageUrl);
    }
    map['unit_price'] = Variable<double>(unitPrice);
    map['quantity'] = Variable<int>(quantity);
    map['available'] = Variable<bool>(available);
    return map;
  }

  CartEntriesCompanion toCompanion(bool nullToAbsent) {
    return CartEntriesCompanion(
      itemId: Value(itemId),
      name: Value(name),
      imageUrl: imageUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(imageUrl),
      unitPrice: Value(unitPrice),
      quantity: Value(quantity),
      available: Value(available),
    );
  }

  factory CartEntry.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CartEntry(
      itemId: serializer.fromJson<String>(json['itemId']),
      name: serializer.fromJson<String>(json['name']),
      imageUrl: serializer.fromJson<String?>(json['imageUrl']),
      unitPrice: serializer.fromJson<double>(json['unitPrice']),
      quantity: serializer.fromJson<int>(json['quantity']),
      available: serializer.fromJson<bool>(json['available']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'itemId': serializer.toJson<String>(itemId),
      'name': serializer.toJson<String>(name),
      'imageUrl': serializer.toJson<String?>(imageUrl),
      'unitPrice': serializer.toJson<double>(unitPrice),
      'quantity': serializer.toJson<int>(quantity),
      'available': serializer.toJson<bool>(available),
    };
  }

  CartEntry copyWith({
    String? itemId,
    String? name,
    Value<String?> imageUrl = const Value.absent(),
    double? unitPrice,
    int? quantity,
    bool? available,
  }) => CartEntry(
    itemId: itemId ?? this.itemId,
    name: name ?? this.name,
    imageUrl: imageUrl.present ? imageUrl.value : this.imageUrl,
    unitPrice: unitPrice ?? this.unitPrice,
    quantity: quantity ?? this.quantity,
    available: available ?? this.available,
  );
  CartEntry copyWithCompanion(CartEntriesCompanion data) {
    return CartEntry(
      itemId: data.itemId.present ? data.itemId.value : this.itemId,
      name: data.name.present ? data.name.value : this.name,
      imageUrl: data.imageUrl.present ? data.imageUrl.value : this.imageUrl,
      unitPrice: data.unitPrice.present ? data.unitPrice.value : this.unitPrice,
      quantity: data.quantity.present ? data.quantity.value : this.quantity,
      available: data.available.present ? data.available.value : this.available,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CartEntry(')
          ..write('itemId: $itemId, ')
          ..write('name: $name, ')
          ..write('imageUrl: $imageUrl, ')
          ..write('unitPrice: $unitPrice, ')
          ..write('quantity: $quantity, ')
          ..write('available: $available')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(itemId, name, imageUrl, unitPrice, quantity, available);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CartEntry &&
          other.itemId == this.itemId &&
          other.name == this.name &&
          other.imageUrl == this.imageUrl &&
          other.unitPrice == this.unitPrice &&
          other.quantity == this.quantity &&
          other.available == this.available);
}

class CartEntriesCompanion extends UpdateCompanion<CartEntry> {
  final Value<String> itemId;
  final Value<String> name;
  final Value<String?> imageUrl;
  final Value<double> unitPrice;
  final Value<int> quantity;
  final Value<bool> available;
  final Value<int> rowid;
  const CartEntriesCompanion({
    this.itemId = const Value.absent(),
    this.name = const Value.absent(),
    this.imageUrl = const Value.absent(),
    this.unitPrice = const Value.absent(),
    this.quantity = const Value.absent(),
    this.available = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CartEntriesCompanion.insert({
    required String itemId,
    required String name,
    this.imageUrl = const Value.absent(),
    required double unitPrice,
    this.quantity = const Value.absent(),
    this.available = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : itemId = Value(itemId),
       name = Value(name),
       unitPrice = Value(unitPrice);
  static Insertable<CartEntry> custom({
    Expression<String>? itemId,
    Expression<String>? name,
    Expression<String>? imageUrl,
    Expression<double>? unitPrice,
    Expression<int>? quantity,
    Expression<bool>? available,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (itemId != null) 'item_id': itemId,
      if (name != null) 'name': name,
      if (imageUrl != null) 'image_url': imageUrl,
      if (unitPrice != null) 'unit_price': unitPrice,
      if (quantity != null) 'quantity': quantity,
      if (available != null) 'available': available,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CartEntriesCompanion copyWith({
    Value<String>? itemId,
    Value<String>? name,
    Value<String?>? imageUrl,
    Value<double>? unitPrice,
    Value<int>? quantity,
    Value<bool>? available,
    Value<int>? rowid,
  }) {
    return CartEntriesCompanion(
      itemId: itemId ?? this.itemId,
      name: name ?? this.name,
      imageUrl: imageUrl ?? this.imageUrl,
      unitPrice: unitPrice ?? this.unitPrice,
      quantity: quantity ?? this.quantity,
      available: available ?? this.available,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (itemId.present) {
      map['item_id'] = Variable<String>(itemId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (imageUrl.present) {
      map['image_url'] = Variable<String>(imageUrl.value);
    }
    if (unitPrice.present) {
      map['unit_price'] = Variable<double>(unitPrice.value);
    }
    if (quantity.present) {
      map['quantity'] = Variable<int>(quantity.value);
    }
    if (available.present) {
      map['available'] = Variable<bool>(available.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CartEntriesCompanion(')
          ..write('itemId: $itemId, ')
          ..write('name: $name, ')
          ..write('imageUrl: $imageUrl, ')
          ..write('unitPrice: $unitPrice, ')
          ..write('quantity: $quantity, ')
          ..write('available: $available, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $CartEntriesTable cartEntries = $CartEntriesTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [cartEntries];
}

typedef $$CartEntriesTableCreateCompanionBuilder =
    CartEntriesCompanion Function({
      required String itemId,
      required String name,
      Value<String?> imageUrl,
      required double unitPrice,
      Value<int> quantity,
      Value<bool> available,
      Value<int> rowid,
    });
typedef $$CartEntriesTableUpdateCompanionBuilder =
    CartEntriesCompanion Function({
      Value<String> itemId,
      Value<String> name,
      Value<String?> imageUrl,
      Value<double> unitPrice,
      Value<int> quantity,
      Value<bool> available,
      Value<int> rowid,
    });

class $$CartEntriesTableFilterComposer
    extends Composer<_$AppDatabase, $CartEntriesTable> {
  $$CartEntriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get itemId => $composableBuilder(
    column: $table.itemId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get imageUrl => $composableBuilder(
    column: $table.imageUrl,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get unitPrice => $composableBuilder(
    column: $table.unitPrice,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get quantity => $composableBuilder(
    column: $table.quantity,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get available => $composableBuilder(
    column: $table.available,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CartEntriesTableOrderingComposer
    extends Composer<_$AppDatabase, $CartEntriesTable> {
  $$CartEntriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get itemId => $composableBuilder(
    column: $table.itemId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get imageUrl => $composableBuilder(
    column: $table.imageUrl,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get unitPrice => $composableBuilder(
    column: $table.unitPrice,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get quantity => $composableBuilder(
    column: $table.quantity,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get available => $composableBuilder(
    column: $table.available,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CartEntriesTableAnnotationComposer
    extends Composer<_$AppDatabase, $CartEntriesTable> {
  $$CartEntriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get itemId =>
      $composableBuilder(column: $table.itemId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get imageUrl =>
      $composableBuilder(column: $table.imageUrl, builder: (column) => column);

  GeneratedColumn<double> get unitPrice =>
      $composableBuilder(column: $table.unitPrice, builder: (column) => column);

  GeneratedColumn<int> get quantity =>
      $composableBuilder(column: $table.quantity, builder: (column) => column);

  GeneratedColumn<bool> get available =>
      $composableBuilder(column: $table.available, builder: (column) => column);
}

class $$CartEntriesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CartEntriesTable,
          CartEntry,
          $$CartEntriesTableFilterComposer,
          $$CartEntriesTableOrderingComposer,
          $$CartEntriesTableAnnotationComposer,
          $$CartEntriesTableCreateCompanionBuilder,
          $$CartEntriesTableUpdateCompanionBuilder,
          (
            CartEntry,
            BaseReferences<_$AppDatabase, $CartEntriesTable, CartEntry>,
          ),
          CartEntry,
          PrefetchHooks Function()
        > {
  $$CartEntriesTableTableManager(_$AppDatabase db, $CartEntriesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CartEntriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CartEntriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CartEntriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> itemId = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> imageUrl = const Value.absent(),
                Value<double> unitPrice = const Value.absent(),
                Value<int> quantity = const Value.absent(),
                Value<bool> available = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CartEntriesCompanion(
                itemId: itemId,
                name: name,
                imageUrl: imageUrl,
                unitPrice: unitPrice,
                quantity: quantity,
                available: available,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String itemId,
                required String name,
                Value<String?> imageUrl = const Value.absent(),
                required double unitPrice,
                Value<int> quantity = const Value.absent(),
                Value<bool> available = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CartEntriesCompanion.insert(
                itemId: itemId,
                name: name,
                imageUrl: imageUrl,
                unitPrice: unitPrice,
                quantity: quantity,
                available: available,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CartEntriesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CartEntriesTable,
      CartEntry,
      $$CartEntriesTableFilterComposer,
      $$CartEntriesTableOrderingComposer,
      $$CartEntriesTableAnnotationComposer,
      $$CartEntriesTableCreateCompanionBuilder,
      $$CartEntriesTableUpdateCompanionBuilder,
      (CartEntry, BaseReferences<_$AppDatabase, $CartEntriesTable, CartEntry>),
      CartEntry,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$CartEntriesTableTableManager get cartEntries =>
      $$CartEntriesTableTableManager(_db, _db.cartEntries);
}
