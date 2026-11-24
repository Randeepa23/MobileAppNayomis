import 'package:dio/dio.dart';
import '../../../core/networking/api_error_mapper.dart';

class OrderSummaryItem {
  const OrderSummaryItem({
    required this.name,
    required this.quantity,
    required this.price,
  });

  final String name;
  final int quantity;
  final double price;

  factory OrderSummaryItem.fromApi(Map<String, dynamic> json) {
    final food = json['foodItem'] is Map ? Map<String, dynamic>.from(json['foodItem'] as Map) : null;
    return OrderSummaryItem(
      name: food?['name']?.toString() ?? 'Meal item',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      price: (food?['price'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class CustomerOrder {
  const CustomerOrder({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.pickupLocation,
    required this.pickupTime,
    required this.deliveryDate,
    required this.total,
    required this.items,
    this.boxId,
  });

  final String id;
  final String orderNumber;
  final String status;
  final String pickupLocation;
  final String pickupTime;
  final DateTime deliveryDate;
  final double total;
  final List<OrderSummaryItem> items;
  final String? boxId;

  bool get isActive => status != 'delivered' && status != 'completed' && status != 'cancelled' && status != 'rejected';

  factory CustomerOrder.fromApi(Map<String, dynamic> json) {
    final id = (json['_id'] ?? json['id']).toString();
    final delivery = json['delivery'] is Map ? Map<String, dynamic>.from(json['delivery'] as Map) : null;
    final rawItems = json['items'] as List? ?? [];
    
    DateTime date;
    try {
      date = DateTime.parse(json['deliveryDate'].toString());
    } catch (_) {
      date = DateTime.now();
    }

    return CustomerOrder(
      id: id,
      orderNumber: '#' + (id.length >= 6 ? id.substring(id.length - 6).toUpperCase() : id.toUpperCase()),
      status: json['status']?.toString() ?? 'pending',
      pickupLocation: json['pickupLocation']?.toString() ?? 'School Pickup',
      pickupTime: json['pickupTime']?.toString() ?? 'Morning Slot',
      deliveryDate: date,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      items: rawItems
          .whereType<Map>()
          .map((i) => OrderSummaryItem.fromApi(Map<String, dynamic>.from(i)))
          .toList(),
      boxId: delivery?['boxId']?.toString(),
    );
  }
}

class OrdersRepository {
  OrdersRepository(this._dio);
  final Dio _dio;

  Future<List<CustomerOrder>> getOrders() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        'customer/orders',
        options: Options(extra: {'requiresAuth': true}),
      );
      final rawData = response.data?['data'];
      final data = rawData is Map ? Map<String, dynamic>.from(rawData) : null;
      final list = data?['orders'];
      if (list is! List) return const [];
      return list
          .whereType<Map>()
          .map((json) => CustomerOrder.fromApi(Map<String, dynamic>.from(json)))
          .toList();
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }
}

