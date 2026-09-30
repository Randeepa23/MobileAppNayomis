import '../../../core/assets/app_assets.dart';
import '../domain/food_item.dart';

const localMenuItems = <FoodItem>[
  FoodItem(
    id: 'local-fish-bun',
    name: 'Fish Bun',
    price: 120,
    category: 'Buns',
    description:
        'Soft, fluffy bun stuffed with deliciously seasoned fish filling',
    isAvailable: true,
    imageUrl: AppAssets.menuFishBun,
    isPopular: true,
  ),
  FoodItem(
    id: 'local-fish-pastry',
    name: 'Fish Pastry',
    price: 130,
    category: 'Pastries',
    description:
        'Flaky pastry pocket filled with savory fish mixture and spices',
    isAvailable: true,
    imageUrl: AppAssets.menuFishPastry,
  ),
  FoodItem(
    id: 'local-chicken-burger',
    name: 'Chicken Burger',
    price: 280,
    category: 'Burgers',
    description:
        'Juicy chicken patty with fresh vegetables and special sauce in a toasted bun',
    isAvailable: true,
    imageUrl: AppAssets.menuChickenBurger,
    isNew: true,
  ),
  FoodItem(
    id: 'local-chicken-pastry',
    name: 'Chicken Pastry',
    price: 140,
    category: 'Pastries',
    description: 'Golden pastry filled with tender chicken and aromatic spices',
    isAvailable: true,
    imageUrl: AppAssets.menuChickenPastry,
  ),
  FoodItem(
    id: 'local-sausage-pastry',
    name: 'Sausage Pastry',
    price: 135,
    category: 'Pastries',
    description: 'Buttery pastry with succulent sausage and herbs',
    isAvailable: true,
    imageUrl: AppAssets.menuSausagePastry,
  ),
  FoodItem(
    id: 'local-seeni-sambol-bun',
    name: 'Seeni Sambol Bun',
    price: 110,
    category: 'Buns',
    description:
        'Traditional Sri Lankan sweet and spicy caramelized onion filling in a soft bun',
    isAvailable: true,
    imageUrl: AppAssets.menuSeeniSambolBun,
    isPopular: true,
  ),
  FoodItem(
    id: 'local-tea-bun',
    name: 'Tea Bun',
    price: 90,
    category: 'Buns',
    description: 'Classic sweet bun perfect for pairing with Ceylon tea',
    isAvailable: true,
    imageUrl: AppAssets.menuTeaBun,
  ),
];

final _localById = {for (final item in localMenuItems) item.id: item};
final _assetByName = {
  for (final item in localMenuItems) _normalizedName(item.name): item.imageUrl!,
  _normalizedName('Fish Roll'): AppAssets.menuFishRoll,
};

FoodItem? localMenuItemById(String id) => _localById[id];

List<FoodItem> applyLocalMenuCatalog(List<FoodItem> serverItems) {
  if (serverItems.isEmpty) return localMenuItems;
  return serverItems.map(applyLocalMenuImage).toList(growable: false);
}

FoodItem applyLocalMenuImage(FoodItem item) {
  final asset = _assetByName[_normalizedName(item.name)];
  return asset == null ? item : item.copyWith(imageUrl: asset);
}

String _normalizedName(String name) =>
    name.trim().toLowerCase().replaceAll(RegExp('[^a-z0-9]+'), '');
