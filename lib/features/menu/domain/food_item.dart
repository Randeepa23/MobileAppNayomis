class FoodItem {
  const FoodItem({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    required this.isAvailable,
    this.imageUrl,
    this.isPopular = false,
    this.isNew = false,
    this.dietaryTags = const [],
    this.allergens = const [],
  });

  final String id;
  final String name;
  final String description;
  final String category;
  final double price;
  final bool isAvailable;
  final String? imageUrl;
  final bool isPopular;
  final bool isNew;
  final List<String> dietaryTags;
  final List<String> allergens;

  bool get hasAssetImage => imageUrl?.startsWith('assets/') == true;

  bool get hasNetworkImage {
    final uri = Uri.tryParse(imageUrl ?? '');
    return uri != null &&
        uri.hasScheme &&
        (uri.scheme == 'http' || uri.scheme == 'https');
  }

  FoodItem copyWith({String? imageUrl}) => FoodItem(
    id: id,
    name: name,
    description: description,
    category: category,
    price: price,
    isAvailable: isAvailable,
    imageUrl: imageUrl ?? this.imageUrl,
    isPopular: isPopular,
    isNew: isNew,
    dietaryTags: dietaryTags,
    allergens: allergens,
  );

  factory FoodItem.fromApi(Map<String, dynamic> json) {
    final dietary = json['dietary'];
    final tags = <String>[];
    if (dietary is Map) {
      if (dietary['isVegetarian'] == true) tags.add('Vegetarian');
      if (dietary['isVegan'] == true) tags.add('Vegan');
      if (dietary['isHalal'] == true) tags.add('Halal');
      if (dietary['isGlutenFree'] == true) tags.add('Gluten free');
      if (dietary['isDairyFree'] == true) tags.add('Dairy free');
    }
    return FoodItem(
      id: (json['_id'] ?? json['id']).toString(),
      name: json['name']?.toString() ?? 'Unnamed item',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Other',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      isAvailable:
          json['isAvailable'] == true ||
          (json['isAvailable'] == null && json['available'] != false),
      imageUrl: (json['imageUrl'] ?? json['image'])?.toString(),
      isPopular: json['isPopular'] == true || json['popular'] == true,
      isNew: json['isNew'] == true || json['new'] == true,
      dietaryTags: tags,
      allergens:
          (json['allergens'] as List?)
              ?.map((item) => item.toString())
              .toList() ??
          const [],
    );
  }
}
